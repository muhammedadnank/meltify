from rest_framework import serializers
from frostycart.models import FrostyCart, CartScoop
from scoop.models import ScoopImage


class ScoopImageMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoopImage
        fields = ['id', 'image']


class CartScoopSerializer(serializers.ModelSerializer):
    scoop_images = ScoopImageMiniSerializer(many=True, read_only=True, source='scoop.images')
    scoop_name = serializers.CharField(source='scoop.name', read_only=True)
    scoop_type = serializers.CharField(source='scoop.scoop_type', read_only=True)
    scoop_flavour = serializers.CharField(source='scoop.flavour.name', read_only=True)
    unit_price = serializers.DecimalField(source='scoop.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartScoop
        fields = [
            'id', 'scoop', 'quantity', 'created_at',
            'scoop_name', 'scoop_type', 'scoop_flavour',
            'scoop_images', 'unit_price', 'total_price'
        ]
        read_only_fields = ['created_at']

    def get_total_price(self, obj):
        return obj.scoop.price * obj.quantity


class FrostyCartSerializer(serializers.ModelSerializer):
    scoops = CartScoopSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = FrostyCart
        fields = ['id', 'user', 'created_at', 'scoops', 'total_cart_price']
        read_only_fields = ['user', 'created_at']

    def get_total_cart_price(self, obj):
        return sum(item.scoop.price * item.quantity for item in obj.scoops.all())


class AddScoopToCartSerializer(serializers.Serializer):
    scoop_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartScoopSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()
