from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('profile/', views.get_profile, name='get_profile'),
    path('food/add/', views.add_food_item, name='add_food_item'),
    path('food/list/', views.available_food, name='available_food'),
    path('food/claim/<int:food_id>/', views.claim_food, name='claim_food'),
]
