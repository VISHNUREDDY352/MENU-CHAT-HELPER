from django.urls import path
from . import views

urlpatterns = [
    path('menu/',  views.menu_list),
    path('chat/',  views.chat),
]
