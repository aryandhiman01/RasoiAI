from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, FoodItem


# -------------------- USER SERIALIZER --------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# -------------------- USER PROFILE SERIALIZER --------------------
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'phone', 'location']


# -------------------- FOOD ITEM SERIALIZER --------------------
class FoodItemSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)

    class Meta:
        model = FoodItem
        fields = ['id', 'food_name', 'quantity', 'location', 'is_claimed', 'donor']
