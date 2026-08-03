"""Run once to populate the menu: python seed.py"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant.settings')
django.setup()

from menu.models import MenuItem

MenuItem.objects.all().delete()

items = [
    # Starters
    dict(name='Paneer Tikka',       description='Grilled cottage cheese with spices', price=180, category='starter', is_veg=True,  is_spicy=True,  image_url='https://source.unsplash.com/300x200/?paneer'),
    dict(name='Chicken Wings',      description='Crispy fried chicken wings',          price=220, category='starter', is_veg=False, is_spicy=True,  image_url='https://source.unsplash.com/300x200/?chicken-wings'),
    dict(name='Veg Spring Rolls',   description='Crispy rolls with mixed veggies',     price=120, category='starter', is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?spring-rolls'),
    dict(name='Soup of the Day',    description='Chef\'s special soup',                price=90,  category='starter', is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?soup'),
    # Mains
    dict(name='Butter Chicken',     description='Creamy tomato chicken curry',         price=280, category='main',    is_veg=False, is_spicy=True,  image_url='https://source.unsplash.com/300x200/?butter-chicken'),
    dict(name='Dal Makhani',        description='Slow-cooked black lentils',           price=200, category='main',    is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?dal'),
    dict(name='Veg Biryani',        description='Fragrant basmati with vegetables',    price=220, category='main',    is_veg=True,  is_spicy=True,  image_url='https://source.unsplash.com/300x200/?biryani'),
    dict(name='Chicken Biryani',    description='Fragrant basmati with chicken',       price=280, category='main',    is_veg=False, is_spicy=True,  image_url='https://source.unsplash.com/300x200/?biryani'),
    dict(name='Palak Paneer',       description='Cottage cheese in spinach gravy',     price=210, category='main',    is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?palak'),
    dict(name='Fish Curry',         description='Coastal style fish curry',            price=300, category='main',    is_veg=False, is_spicy=True,  image_url='https://source.unsplash.com/300x200/?fish-curry'),
    # Desserts
    dict(name='Gulab Jamun',        description='Soft fried milk balls in syrup',      price=80,  category='dessert', is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?gulab-jamun'),
    dict(name='Ice Cream',          description='Two scoops of your choice',           price=100, category='dessert', is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?ice-cream'),
    dict(name='Chocolate Brownie',  description='Warm brownie with ice cream',         price=150, category='dessert', is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?brownie'),
    # Drinks
    dict(name='Mango Lassi',        description='Chilled yogurt mango drink',          price=80,  category='drink',   is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?lassi'),
    dict(name='Fresh Lime Soda',    description='Refreshing lime with soda',           price=60,  category='drink',   is_veg=True,  is_spicy=False, image_url='https://source.unsplash.com/300x200/?lemonade'),
    dict(name='Masala Chai',        description='Spiced Indian tea',                   price=40,  category='drink',   is_veg=True,  is_spicy=True,  image_url='https://source.unsplash.com/300x200/?tea'),
]

MenuItem.objects.bulk_create([MenuItem(**i) for i in items])
print(f'Seeded {len(items)} menu items.')
