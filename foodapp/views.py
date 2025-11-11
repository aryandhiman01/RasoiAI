from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import UserProfile, FoodItem
from .serializers import UserProfileSerializer, FoodItemSerializer


# -------------------- REGISTER USER --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role')
        phone = request.data.get('phone')
        location = request.data.get('location')

        # Validation
        if not all([username, email, password, role, phone, location]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and profile
        user = User.objects.create_user(username=username, email=email, password=password)
        profile = UserProfile.objects.create(user=user, role=role, phone=phone, location=location)
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "User registered successfully",
            "username": user.username,
            "role": profile.role,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------- LOGIN USER --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile = UserProfile.objects.get(user=user)

        return Response({
            "message": "Login successful",
            "username": user.username,
            "role": profile.role,
            "token": token.key
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------- PROFILE VIEW --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


# -------------------- ADD FOOD ITEM --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_food_item(request):
    try:
        donor_profile = UserProfile.objects.get(user=request.user)
        data = request.data

        food_name = data.get('food_name')
        quantity = data.get('quantity')
        location = data.get('location')

        if not all([food_name, quantity, location]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        food = FoodItem.objects.create(
            donor=donor_profile,
            food_name=food_name,
            quantity=quantity,
            location=location
        )

        serializer = FoodItemSerializer(food)
        return Response({
            "message": "Food item added successfully!",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------- AVAILABLE FOOD LIST --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_food(request):
    foods = FoodItem.objects.filter(is_claimed=False)
    serializer = FoodItemSerializer(foods, many=True)
    return Response({"available_foods": serializer.data}, status=status.HTTP_200_OK)


# -------------------- CLAIM FOOD --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_food(request, food_id):
    try:
        food = FoodItem.objects.get(id=food_id, is_claimed=False)
        food.is_claimed = True
        food.save()
        return Response({"message": "Food claimed successfully!"}, status=status.HTTP_200_OK)
    except FoodItem.DoesNotExist:
        return Response({"error": "Food not available or already claimed"}, status=status.HTTP_404_NOT_FOUND)
