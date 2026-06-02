from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from scoop.models import Flavour, Scoop, ScoopImage
from .serializers import FlavourSerializer, ScoopSerializer, ScoopImageSerializer


class FlavourViewSet(ModelViewSet):
    queryset = Flavour.objects.all()
    serializer_class = FlavourSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ScoopViewSet(ModelViewSet):
    serializer_class = ScoopSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Scoop.objects.filter(is_active=True)
        flavour_id = self.request.query_params.get('flavour')
        scoop_type = self.request.query_params.get('type')
        is_vegan = self.request.query_params.get('vegan')
        is_sugar_free = self.request.query_params.get('sugar_free')

        if flavour_id:
            queryset = queryset.filter(flavour_id=flavour_id)
        if scoop_type:
            queryset = queryset.filter(scoop_type=scoop_type)
        if is_vegan is not None:
            queryset = queryset.filter(is_vegan=is_vegan.lower() == 'true')
        if is_sugar_free is not None:
            queryset = queryset.filter(is_sugar_free=is_sugar_free.lower() == 'true')

        return queryset


class ScoopImageViewSet(ModelViewSet):
    queryset = ScoopImage.objects.all()
    serializer_class = ScoopImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
