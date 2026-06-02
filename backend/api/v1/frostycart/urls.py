from django.urls import path
from .views import FrostyCartView, AddScoopToCartView, UpdateCartScoopView, RemoveCartScoopView

urlpatterns = [
    path('cart/', FrostyCartView.as_view(), name='frosty-cart'),
    path('cart/add/', AddScoopToCartView.as_view(), name='cart-add-scoop'),
    path('cart/update/<int:item_id>/', UpdateCartScoopView.as_view(), name='cart-update-scoop'),
    path('cart/remove/<int:item_id>/', RemoveCartScoopView.as_view(), name='cart-remove-scoop'),
]
