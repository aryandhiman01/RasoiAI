from django.contrib import admin
from .models import UserProfile, FoodItem, Notification

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'location', 'latitude', 'longitude')
    search_fields = ('user__username', 'phone', 'location')
    list_filter = ('role',)


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('food_name', 'donor', 'quantity', 'location', 'is_claimed', 'created_at', 'freshness_score')
    list_filter = ('is_claimed', 'created_at')
    search_fields = ('food_name', 'location', 'donor__username')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    ordering = ('-created_at',)
