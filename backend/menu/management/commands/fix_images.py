from django.core.management.base import BaseCommand
from menu.models import MenuItem

IMAGE_MAP = {
    # Starters
    'Paneer Tikka':      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80',
    'Chicken Wings':     'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80',
    'Veg Spring Rolls':  'https://images.unsplash.com/photo-1606834012773-e08f6a4d22e5?w=400&q=80',
    'Soup of the Day':   'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    # Main Course
    'Butter Chicken':    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
    'Dal Makhani':       'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    'Veg Biryani':       'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80',
    'Chicken Biryani':   'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
    'Palak Paneer':      'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80',
    'Fish Curry':        'https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=400&q=80',
    # Desserts
    'Gulab Jamun':       'https://images.unsplash.com/photo-1601303516534-bf5d7f809d6f?w=400&q=80',
    'Ice Cream':         'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    'Chocolate Brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    # Drinks
    'Mango Lassi':       'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80',
    'Fresh Lime Soda':   'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
    'Masala Chai':       'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80',
}

class Command(BaseCommand):
    help = 'Update menu item images with accurate Unsplash URLs'

    def handle(self, *args, **kwargs):
        for name, url in IMAGE_MAP.items():
            # Force update regardless of current value
            updated = MenuItem.objects.filter(name=name).update(image_url=url)
            if updated:
                self.stdout.write(self.style.SUCCESS(f'Updated: {name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Not found: {name}'))
        self.stdout.write(self.style.SUCCESS('Done.'))
