from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlavourViewSet, ScoopViewSet, ScoopImageViewSet

router = DefaultRouter()
router.register('flavours', FlavourViewSet, basename='flavour')
router.register('scoops', ScoopViewSet, basename='scoop')
router.register('scoop-images', ScoopImageViewSet, basename='scoop-image')

urlpatterns = [
    path('', include(router.urls)),
]
