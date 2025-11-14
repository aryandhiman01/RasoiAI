from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, FoodItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'phone', 'location']


class FoodItemSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            'id', 'donor', 'food_name', 'quantity', 'location', 'image',
            'is_claimed', 'created_at', 'food_quantity_estimate', 'freshness_score'
        ]
