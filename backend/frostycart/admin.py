from django.contrib import admin
from .models import FrostyCart, CartScoop

class CartScoopInline(admin.TabularInline):
    model = CartScoop
    extra = 0

@admin.register(FrostyCart)
class FrostyCartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    inlines = [CartScoopInline]
