from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from scoop.models import Scoop
from frostycart.models import FrostyCart, CartScoop
from .serializers import (
    FrostyCartSerializer, AddScoopToCartSerializer, UpdateCartScoopSerializer
)


class FrostyCartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = FrostyCart.objects.get_or_create(user=request.user)
        serializer = FrostyCartSerializer(cart)
        return Response(serializer.data)


class AddScoopToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddScoopToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        scoop = get_object_or_404(Scoop, id=serializer.validated_data['scoop_id'], is_active=True)
        quantity = serializer.validated_data['quantity']

        if scoop.stock < quantity:
            return Response(
                {"error": f"Only {scoop.stock} scoops available in stock"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _ = FrostyCart.objects.get_or_create(user=request.user)
        cart_scoop, created = CartScoop.objects.get_or_create(cart=cart, scoop=scoop)

        if not created:
            cart_scoop.quantity += quantity
        else:
            cart_scoop.quantity = quantity

        cart_scoop.save()
        return Response({"message": f"'{scoop.name}' added to your FrostyCart 🍦"}, status=status.HTTP_200_OK)


class UpdateCartScoopView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        serializer = UpdateCartScoopSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantity = serializer.validated_data['quantity']

        try:
            cart_scoop = CartScoop.objects.get(id=item_id, cart__user=request.user)
        except CartScoop.DoesNotExist:
            return Response({"error": "Scoop not found in your cart"}, status=status.HTTP_404_NOT_FOUND)

        cart_scoop.quantity += quantity

        if cart_scoop.quantity <= 0:
            cart_scoop.delete()
            return Response({"message": "Scoop removed from FrostyCart 🗑️"})

        cart_scoop.save()
        return Response({"message": "FrostyCart updated 🍦"})


class RemoveCartScoopView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart_scoop = CartScoop.objects.get(id=item_id, cart__user=request.user)
            cart_scoop.delete()
            return Response({"message": "Scoop removed from FrostyCart 🗑️"})
        except CartScoop.DoesNotExist:
            return Response({"error": "Scoop not found in cart"}, status=status.HTTP_404_NOT_FOUND)
