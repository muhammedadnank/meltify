from django.urls import path
from .views import (
    CheckoutView, OrderListView, OrderDetailView, OrderStatusView,
    CancelOrderView, PaymentDetailView
)

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/status/', OrderStatusView.as_view(), name='order-status'),
    path('orders/<int:order_id>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('orders/<int:order_id>/payment/', PaymentDetailView.as_view(), name='order-payment'),
    path('orders/checkout/', CheckoutView.as_view(), name='checkout'),
]