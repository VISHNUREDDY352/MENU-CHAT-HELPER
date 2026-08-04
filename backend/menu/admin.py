from django.contrib import admin
from .models import MenuItem, Customer, Order, OrderItem


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'price', 'calories', 'is_veg', 'is_spicy')
    list_filter   = ('category', 'is_veg', 'is_spicy')
    search_fields = ('name', 'description')
    list_editable = ('price', 'calories', 'is_veg', 'is_spicy')
    ordering      = ('category', 'name')


class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    fields = ('name', 'qty', 'price')
    readonly_fields = ('name', 'qty', 'price')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ('phone', 'name', 'created_at')
    search_fields = ('phone', 'name')
    ordering      = ('-created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ('id', 'customer', 'total', 'created_at')
    list_filter   = ('created_at',)
    search_fields = ('customer__phone', 'customer__name')
    ordering      = ('-created_at',)
    inlines       = [OrderItemInline]
    readonly_fields = ('customer', 'total', 'created_at')
