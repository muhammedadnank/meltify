from rest_framework import serializers
from order.models import Order, OrderItem, Payment


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for individual order items"""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'scoop_name', 'scoop_type', 'flavour_name',
            'quantity', 'unit_price', 'total_price', 'created_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment records"""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_method', 'amount', 'transaction_id',
            'payment_gateway', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed order serializer with items and payment"""
    
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_email', 'status', 'payment_status',
            'total_amount', 'tax_amount', 'discount_amount', 'final_amount',
            'delivery_address', 'phone_number', 'delivery_notes',
            'items', 'payment', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'created_at', 'updated_at', 'final_amount'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order listing"""
    
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'total_amount', 'final_amount', 'item_count', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout request (cart → order)"""
    
    delivery_address = serializers.CharField(max_length=500)
    phone_number = serializers.CharField(max_length=15)
    delivery_notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=['upi', 'card', 'netbanking', 'wallet', 'cod'],
        default='cod'
    )
    tax_percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text="Tax percentage to apply on total"
    )
    discount_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Discount to apply (if any)"
    )

    def validate_phone_number(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Valid phone number required (10+ digits)")
        return value

    def validate_delivery_address(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Delivery address must be at least 10 characters")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status (parlour only)"""

    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        required=False,
    )
    payment_status = serializers.ChoiceField(
        choices=['pending', 'completed', 'failed', 'refunded'],
        required=False,
    )

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("Provide at least one of: status, payment_status")
        return data