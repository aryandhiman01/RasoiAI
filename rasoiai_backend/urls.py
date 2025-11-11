from django.contrib import admin
from django.urls import path, include     # ✅ yeh line zaroori hai
from django.http import HttpResponse       # ✅ for home page

def home(request):
    return HttpResponse("<h1>Welcome to RasoiAI Backend 🍲</h1><p>Use /api/ to access endpoints.</p>")

urlpatterns = [
    path('', home),                       # 👈 home route
    path('admin/', admin.site.urls),
    path('api/', include('foodapp.urls')),
]
