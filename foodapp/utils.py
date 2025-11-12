import requests
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import Notification  # Make sure Notification model exists


# 🌍 Convert Address → Latitude/Longitude using Google Maps API
def get_lat_lng_from_address(address):
    try:
        api_key = "YOUR_GOOGLE_API_KEY"  # ⚠️ Replace with your real API key
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
        response = requests.get(url).json()

        if response["status"] == "OK":
            lat = response["results"][0]["geometry"]["location"]["lat"]
            lng = response["results"][0]["geometry"]["location"]["lng"]
            return lat, lng
        else:
            return None, None
    except Exception as e:
        print("Geocoding error:", e)
        return None, None


# ✉️ Send Notification Email
def send_notification_email(subject, message, recipient_list):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=True,
        )
    except Exception as e:
        print("Email error:", e)


# 🔔 Create In-App Notification
def create_notification(user, title, message):
    """
    Create a notification record in the database for the given user.
    This is optional but useful for admin panel or in-app alerts.
    """
    try:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            created_at=timezone.now()
        )
        print(f"Notification created for {user.username}")
    except Exception as e:
        print("Notification error:", e)
