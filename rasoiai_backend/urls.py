from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse


# ✅ Simple Home View
def home(request):
    return HttpResponse("""
        <h1>Welcome to RasoiAI Backend 🍲</h1>
        <p>Use <strong>/api/</strong> to access available endpoints.</p>
        <p>Example: <code>/api/food/add/</code> or <code>/api/analyze-food-image/</code></p>
    """)


# ✅ URL Configuration
urlpatterns = [
    path('', home),  # 👈 Root URL - shows a welcome message
    path('admin/', admin.site.urls),  # Django admin panel
    path('api/', include('foodapp.urls')),  # API routes from your foodapp
]
