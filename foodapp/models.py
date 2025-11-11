from django.db import models
from django.contrib.auth.models import User


# ---------------------------
# USER PROFILE MODEL
# ---------------------------
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

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ---------------------------
# FOOD ITEM MODEL
# ---------------------------
class FoodItem(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE)
    food_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    location = models.CharField(max_length=255)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)
    is_claimed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.food_name} - {self.donor.username}"
