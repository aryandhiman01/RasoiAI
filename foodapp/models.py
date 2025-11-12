from django.db import models
from django.contrib.auth.models import User


# -------------------------------------------------
# 🧑 USER PROFILE MODEL
# -------------------------------------------------
class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('Donor', 'Donor'),
        ('NGO', 'NGO'),
        ('Admin', 'Admin'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    location = models.CharField(max_length=255)

    # 🌍 Live Location Tracking
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


# -------------------------------------------------
# 🍲 FOOD ITEM MODEL
# -------------------------------------------------
class FoodItem(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE)
    food_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    location = models.CharField(max_length=255)

    # 📷 Image Upload (Optional)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)

    # 🔄 Status Fields
    is_claimed = models.BooleanField(default=False)
    claimed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claimed_foods'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    # 🤖 AI Model Fields
    food_quantity_estimate = models.FloatField(null=True, blank=True)
    freshness_score = models.FloatField(null=True, blank=True)

    # 🌍 Location Fields (for Map & Nearby Search)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name} - {self.donor.username}"

    class Meta:
        verbose_name = "Food Item"
        verbose_name_plural = "Food Items"


# -------------------------------------------------
# 📬 NOTIFICATION MODEL (Phase 2 Optional)
# -------------------------------------------------
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
