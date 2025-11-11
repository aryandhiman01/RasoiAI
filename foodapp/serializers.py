from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, FoodItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ['user', 'role', 'phone', 'location']


class FoodItemSerializer(serializers.ModelSerializer):
    donor = UserProfileSerializer(read_only=True)

    class Meta:
        model = FoodItem
        fields = ['id', 'food_name', 'donor', 'quantity', 'location', 'is_claimed', 'created_at']
