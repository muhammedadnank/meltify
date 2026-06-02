from django.db import models
from account.models import User
from scoop.models import Scoop
import random
import string
from django.utils import timezone


class Order(models.Model):
    """Customer order — checkout from cart"""
    
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    order_number = models.CharField(max_length=50, unique=True)
    
    # Order status
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Pricing
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Delivery info
    delivery_address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    delivery_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'order_order'

    def __str__(self):
        return f"Order #{self.order_number} - {self.user.email}"

    def update_final_amount(self):
        """Calculate final amount = total + tax - discount"""
        self.final_amount = self.total_amount + self.tax_amount - self.discount_amount
        return self.final_amount

    @staticmethod
    def generate_order_number():
        """Generate unique order number like ORD-20260330-ABC123"""
        timestamp = timezone.now().strftime("%Y%m%d")
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD-{timestamp}-{random_part}"


class OrderItem(models.Model):
    """Individual item (scoop) in an order"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    scoop = models.ForeignKey(Scoop, on_delete=models.SET_NULL, null=True)
    
    # Store product details at time of order (in case product details change)
    scoop_name = models.CharField(max_length=500)
    scoop_type = models.CharField(max_length=20)
    flavour_name = models.CharField(max_length=100)
    
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_orderitem'

    def __str__(self):
        return f"{self.scoop_name} x{self.quantity} - Order #{self.order.order_number}"

    def save(self, *args, **kwargs):
        """Auto-calculate total_price when saving"""
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment records for orders"""
    
    PAYMENT_METHOD_CHOICES = (
        ('upi', 'UPI'),
        ('card', 'Credit/Debit Card'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Digital Wallet'),
        ('cod', 'Cash on Delivery'),
    )

    id = models.AutoField(primary_key=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment gateway details
    transaction_id = models.CharField(max_length=100, blank=True, unique=True)
    payment_gateway = models.CharField(max_length=50, blank=True)  # razorpay, stripe, etc.
    
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ), default='pending')
    
    # Response data from payment gateway
    response_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'order_payment'

    def __str__(self):
        return f"Payment {self.transaction_id or 'Pending'} - Order #{self.order.order_number}"