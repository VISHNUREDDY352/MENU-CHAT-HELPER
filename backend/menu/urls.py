from django.urls import path
from . import views

urlpatterns = [
    # Menu
    path('menu/',                           views.menu_list),

    # Auth
    path('auth/send-otp/',                  views.send_otp),
    path('auth/verify-otp/',                views.verify_otp),
    path('auth/customer/<int:customer_id>/', views.update_customer),

    # Orders
    path('orders/',                         views.place_order),
    path('orders/<int:customer_id>/',       views.order_history),

    # Chat
    path('chat/',                           views.chat),
]
