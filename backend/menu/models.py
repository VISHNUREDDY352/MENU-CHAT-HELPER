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

    def __str__(self):
        return self.name
