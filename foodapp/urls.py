from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('profile/', views.get_profile, name='get_profile'),
    path('food/add/', views.add_food_item, name='add_food_item'),
    path('food/list/', views.available_food, name='available_food'),
    path('food/claim/<int:food_id>/', views.claim_food, name='claim_food'),
    path('analyze-food-image/', views.analyze_food_image),
    path('food/nearby/', views.nearby_food, name='nearby_food'),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('update_location/', views.update_user_location),  # 👈 new route
]
