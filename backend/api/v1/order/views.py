from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal

from frostycart.models import FrostyCart
from order.models import Order, OrderItem, Payment
from scoop.models import Scoop
from .serializers import (
    OrderDetailSerializer, OrderListSerializer, CheckoutSerializer,
    OrderStatusUpdateSerializer, PaymentSerializer
)


class CheckoutView(APIView):
    """
    Convert shopping cart to order
    POST /api/v1/order/checkout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Create order from cart"""
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get user's cart
        try:
            cart = FrostyCart.objects.get(user=request.user)
        except FrostyCart.DoesNotExist:
            return Response(
                {"error": "Cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate cart has items
        cart_items = cart.scoops.select_related('scoop__flavour').all()
        if not cart_items.exists():
            return Response(
                {"error": "Cannot checkout with empty cart"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Lock scoop rows to prevent concurrent oversell
            scoop_ids = [ci.scoop_id for ci in cart_items]
            locked_scoops = {
                s.id: s
                for s in Scoop.objects.select_for_update().filter(id__in=scoop_ids)
            }

            total_amount = Decimal('0')
            order_items_data = []

            for cart_item in cart_items:
                scoop = locked_scoops[cart_item.scoop_id]
                if scoop.stock < cart_item.quantity:
                    return Response(
                        {
                            "error": f"Insufficient stock for {scoop.name}. "
                                     f"Only {scoop.stock} available."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                item_total = scoop.price * cart_item.quantity
                total_amount += item_total

                order_items_data.append({
                    'scoop': scoop,
                    'scoop_name': scoop.name,
                    'scoop_type': scoop.scoop_type,
                    'flavour_name': scoop.flavour.name,
                    'quantity': cart_item.quantity,
                    'unit_price': scoop.price,
                })

            # Calculate tax and final amount
            tax_percentage = serializer.validated_data.get('tax_percentage', 0)
            tax_amount = (total_amount * Decimal(str(tax_percentage))) / 100
            discount_amount = Decimal(str(serializer.validated_data.get('discount_amount', 0)))
            final_amount = total_amount + tax_amount - discount_amount

            # Create order
            order = Order.objects.create(
                user=request.user,
                order_number=Order.generate_order_number(),
                total_amount=total_amount,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                final_amount=final_amount,
                delivery_address=serializer.validated_data['delivery_address'],
                phone_number=serializer.validated_data['phone_number'],
                delivery_notes=serializer.validated_data.get('delivery_notes', ''),
                status='pending',
                payment_status='pending',
            )

            # Create order items
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    scoop=item_data['scoop'],
                    scoop_name=item_data['scoop_name'],
                    scoop_type=item_data['scoop_type'],
                    flavour_name=item_data['flavour_name'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                )

            # Create payment record
            payment_method = serializer.validated_data.get('payment_method', 'cod')
            Payment.objects.create(
                order=order,
                payment_method=payment_method,
                amount=final_amount,
                status='pending',
            )

            # Reduce stock (inside transaction, using already-locked rows)
            for item_data in order_items_data:
                scoop = item_data['scoop']
                scoop.stock -= item_data['quantity']
                scoop.save(update_fields=['stock'])

            # Clear cart
            cart.scoops.all().delete()

        return Response(
            {
                "message": "Order created successfully 🍦",
                "order": OrderDetailSerializer(order).data
            },
            status=status.HTTP_201_CREATED
        )


class OrderListView(APIView):
    """
    Get all orders for current user
    GET /api/v1/order/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all orders for current user"""
        orders = Order.objects.filter(user=request.user)
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailView(APIView):
    """
    Get detailed order information
    GET /api/v1/order/{order_id}/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        """Retrieve order details"""
        order = get_object_or_404(Order, id=order_id, user=request.user)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)


class OrderStatusView(APIView):
    """
    Update order status (admin/seller only)
    PATCH /api/v1/order/{order_id}/status/
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        """Update order status"""
        # Only parlour owners can update order status
        if request.user.role != 'Parlour':
            return Response(
                {"error": "Permission denied. Only sellers/admin can update orders."},
                status=status.HTTP_403_FORBIDDEN
            )

        order = get_object_or_404(Order, id=order_id)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if 'status' in serializer.validated_data:
            order.status = serializer.validated_data['status']

        if 'payment_status' in serializer.validated_data:
            order.payment_status = serializer.validated_data['payment_status']

        order.save()

        return Response({
            "message": "Order updated successfully",
            "order": OrderDetailSerializer(order).data
        })


class CancelOrderView(APIView):
    """
    Cancel an order (only if pending)
    POST /api/v1/order/{order_id}/cancel/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        """Cancel order and refund stock"""
        order = get_object_or_404(Order, id=order_id, user=request.user)

        # Can only cancel pending orders
        if order.status != 'pending':
            return Response(
                {"error": f"Cannot cancel {order.status} order"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock
        for item in order.items.all():
            if item.scoop:
                item.scoop.stock += item.quantity
                item.scoop.save()

        # Update order status
        order.status = 'cancelled'
        if order.payment:
            order.payment.status = 'refunded'
            order.payment.save()
        order.save()

        return Response({
            "message": "Order cancelled and stock restored",
            "order": OrderDetailSerializer(order).data
        })


class PaymentDetailView(APIView):
    """
    Get payment details for an order
    GET /api/v1/order/{order_id}/payment/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        """Get payment details"""
        order = get_object_or_404(Order, id=order_id, user=request.user)
        
        if not hasattr(order, 'payment'):
            return Response(
                {"error": "No payment record found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PaymentSerializer(order.payment)
        return Response(serializer.data)