from django.db import models
from account.models import User
from scoop.models import Scoop


class FrostyCart(models.Model):
    """Each customer has one persistent cart"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="frosty_cart")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}'s FrostyCart"


class CartScoop(models.Model):
    """Individual scoop item inside a cart"""
    cart = models.ForeignKey(FrostyCart, on_delete=models.CASCADE, related_name="scoops")
    scoop = models.ForeignKey(Scoop, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.scoop.name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["cart", "scoop"], name='unique_cart_scoop')
        ]