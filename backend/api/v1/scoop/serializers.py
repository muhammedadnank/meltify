from rest_framework import serializers
from scoop.models import Flavour, Scoop, ScoopImage


class FlavourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flavour
        fields = ['id', 'name', 'description']


class ScoopImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoopImage
        fields = ['id', 'image', 'scoop']


class ScoopSerializer(serializers.ModelSerializer):
    images = ScoopImageSerializer(many=True, read_only=True)
    flavour = serializers.PrimaryKeyRelatedField(
        queryset=Flavour.objects.all(), write_only=True
    )
    flavour_details = FlavourSerializer(source='flavour', read_only=True)

    class Meta:
        model = Scoop
        fields = [
            'id', 'name', 'price', 'description', 'stock',
            'scoop_type', 'is_active', 'is_vegan', 'is_sugar_free',
            'flavour', 'flavour_details', 'images'
        ]
