from django.core.management.base import BaseCommand
from menu.models import MenuItem

# Approximate calories per serving for each menu item
CALORIES_MAP = {
    # Starters
    'Paneer Tikka':      320,
    'Chicken Wings':     430,
    'Veg Spring Rolls':  180,
    'Soup of the Day':   110,

    # Mains
    'Butter Chicken':    490,
    'Dal Makhani':       380,
    'Veg Biryani':       420,
    'Chicken Biryani':   550,
    'Palak Paneer':      360,
    'Fish Curry':        310,

    # Desserts
    'Gulab Jamun':       270,
    'Ice Cream':         230,
    'Chocolate Brownie': 410,

    # Drinks
    'Mango Lassi':       190,
    'Fresh Lime Soda':    60,
    'Masala Chai':        80,
}

class Command(BaseCommand):
    help = 'Seed calorie values for all menu items'

    def handle(self, *args, **kwargs):
        for name, cal in CALORIES_MAP.items():
            updated = MenuItem.objects.filter(name=name).update(calories=cal)
            if updated:
                self.stdout.write(self.style.SUCCESS(f'  {name}: {cal} kcal'))
            else:
                self.stdout.write(self.style.WARNING(f'  Not found: {name}'))
        self.stdout.write(self.style.SUCCESS('Done.'))
