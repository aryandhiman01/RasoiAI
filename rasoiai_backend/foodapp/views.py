from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from geopy.distance import geodesic
from .models import UserProfile, FoodItem, Notification
from .serializers import UserProfileSerializer, FoodItemSerializer
from .ai_model.predictor import predict_food_quantity, check_freshness
from .utils import get_lat_lng_from_address, send_notification_email, create_notification
import tempfile


# -------------------------------------------------
# 🧑 REGISTER USER
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        phone = data.get('phone')
        location = data.get('location')

        # 🌍 Get coordinates automatically from address
        lat, lng = get_lat_lng_from_address(location)

        # Validation
        if not all([username, email, password, role, phone, location]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create user and profile
        user = User.objects.create_user(username=username, email=email, password=password)
        UserProfile.objects.create(
            user=user,
            role=role,
            phone=phone,
            location=location,
            latitude=lat,
            longitude=lng
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "User registered successfully.",
            "username": user.username,
            "role": role,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 🔐 LOGIN USER
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile = UserProfile.objects.get(user=user)

        return Response({
            "message": "Login successful.",
            "username": user.username,
            "role": profile.role,
            "token": token.key
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 👤 GET PROFILE
# -------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)


# -------------------------------------------------
# 🥘 ADD FOOD ITEM (AI + Location)
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_food_item(request):
    try:
        user = request.user
        data = request.data

        food_name = data.get('food_name')
        quantity = data.get('quantity')
        location = data.get('location')
        image = request.FILES.get('image')

        if not all([food_name, quantity, location]):
            return Response({"error": "Food name, quantity, and location are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 🌍 Get coordinates using Google Maps API
        lat, lng = get_lat_lng_from_address(location)

        # Create food item
        food = FoodItem.objects.create(
            donor=user,
            food_name=food_name,
            quantity=quantity,
            location=location,
            latitude=lat,
            longitude=lng,
            image=image
        )

        # 🤖 AI Model Integration
        if food.image:
            image_path = food.image.path
            food.food_quantity_estimate = predict_food_quantity(image_path)
            food.freshness_score = check_freshness(image_path)
            food.save()

        serializer = FoodItemSerializer(food)
        return Response({
            "message": "Food item added successfully with AI insights!",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 📋 AVAILABLE FOOD LIST
# -------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_food(request):
    foods = FoodItem.objects.filter(is_claimed=False).order_by('-created_at')
    serializer = FoodItemSerializer(foods, many=True)
    return Response({"available_foods": serializer.data}, status=status.HTTP_200_OK)


# -------------------------------------------------
# 🧾 CLAIM FOOD (Email + In-App Notification)
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_food(request, food_id):
    try:
        food = FoodItem.objects.get(id=food_id, is_claimed=False)
        food.is_claimed = True
        food.claimed_by = request.user
        food.save()

        donor = food.donor
        ngo = request.user

        # ✉️ Email Notification
        subject = "Your food donation was claimed 🎉"
        message = (
            f"Hi {donor.username},\n\n"
            f"Your food item '{food.food_name}' was successfully claimed by {ngo.username}.\n"
            f"Quantity: {food.quantity}\n"
            f"Location: {food.location}\n\n"
            f"Thank you for your valuable contribution 🙏"
        )
        send_notification_email(subject, message, [donor.email])

        # 🔔 In-app Notification
        create_notification(donor, f"Your food '{food.food_name}' was claimed by {ngo.username} ✅")

        return Response({"message": "Food claimed successfully and donor notified!"}, status=status.HTTP_200_OK)

    except FoodItem.DoesNotExist:
        return Response({"error": "Food not available or already claimed."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 🧠 ANALYZE FOOD IMAGE (AI Prediction)
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_food_image(request):
    try:
        if 'image' not in request.FILES:
            return Response({"error": "Image file is required."}, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES['image']
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_img:
            for chunk in image.chunks():
                temp_img.write(chunk)
            temp_path = temp_img.name

        quantity_estimate = predict_food_quantity(temp_path)
        freshness_score = check_freshness(temp_path)

        return Response({
            "message": "Image analyzed successfully.",
            "food_quantity_estimate": float(quantity_estimate),
            "freshness_score": float(freshness_score)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 📍 NEARBY FOOD (within 5 km)
# -------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nearby_food(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if not (user_profile.latitude and user_profile.longitude):
            return Response({"error": "User location not set."}, status=status.HTTP_400_BAD_REQUEST)

        user_location = (float(user_profile.latitude), float(user_profile.longitude))
        nearby_foods = []

        for food in FoodItem.objects.filter(is_claimed=False):
            if food.latitude and food.longitude:
                food_location = (float(food.latitude), float(food.longitude))
                distance = geodesic(user_location, food_location).km
                if distance <= 5:
                    nearby_foods.append({
                        "id": food.id,
                        "food_name": food.food_name,
                        "quantity": food.quantity,
                        "location": food.location,
                        "latitude": food.latitude,
                        "longitude": food.longitude,
                        "distance_km": round(distance, 2)
                    })

        return Response({
            "user_location": user_location,
            "nearby_foods": nearby_foods
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------
# 🔔 GET NOTIFICATIONS
# -------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                "id": n.id,
                "message": n.message,
                "created_at": n.created_at,
                "is_read": n.is_read
            }
            for n in notifications
        ]
        return Response({"notifications": data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------------------------
# 📍 UPDATE USER LOCATION (Live)
# -------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_location(request):
    try:
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')

        if not lat or not lng:
            return Response({"error": "Latitude and longitude required."}, status=status.HTTP_400_BAD_REQUEST)

        profile = UserProfile.objects.get(user=request.user)
        profile.latitude = lat
        profile.longitude = lng
        profile.save()

        return Response({"message": "Location updated successfully!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
