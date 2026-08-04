from django.contrib import admin
from .models import MenuItem

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'price', 'calories', 'is_veg', 'is_spicy')
    list_filter   = ('category', 'is_veg', 'is_spicy')
    search_fields = ('name', 'description')
    list_editable = ('price', 'calories', 'is_veg', 'is_spicy')
    ordering      = ('category', 'name')
