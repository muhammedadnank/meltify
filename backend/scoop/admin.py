from django.contrib import admin
from .models import Flavour, Scoop, ScoopImage

@admin.register(Flavour)
class FlavourAdmin(admin.ModelAdmin):
    list_display = ['name']

class ScoopImageInline(admin.TabularInline):
    model = ScoopImage
    extra = 1

@admin.register(Scoop)
class ScoopAdmin(admin.ModelAdmin):
    list_display = ['name', 'flavour', 'price', 'stock', 'scoop_type', 'is_active', 'is_vegan']
    list_filter = ['flavour', 'scoop_type', 'is_vegan', 'is_sugar_free']
    inlines = [ScoopImageInline]
