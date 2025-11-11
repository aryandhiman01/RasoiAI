from django.contrib import admin
from .models import UserProfile, FoodItem

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'location')

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('food_name', 'donor', 'quantity', 'location', 'is_claimed', 'created_at')
