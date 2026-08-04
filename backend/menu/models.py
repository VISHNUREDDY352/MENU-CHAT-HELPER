from django.db import models

class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('starter', 'Starter'),
        ('main', 'Main Course'),
        ('dessert', 'Dessert'),
        ('drink', 'Drink'),
    ]

    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=8, decimal_places=2)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    is_veg      = models.BooleanField(default=False)
    is_spicy    = models.BooleanField(default=False)
    image_url   = models.URLField(blank=True)
    calories    = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class Customer(models.Model):
    phone      = models.CharField(max_length=10, unique=True)
    name       = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.phone} ({self.name or 'No name'})"


class Order(models.Model):
    customer   = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer.phone}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    name     = models.CharField(max_length=100)   # snapshot at order time
    price    = models.DecimalField(max_digits=8, decimal_places=2)
    qty      = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} ×{self.qty}"
