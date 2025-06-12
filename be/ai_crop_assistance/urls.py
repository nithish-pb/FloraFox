from django.urls import path
from . import views
from .views import CropAssistanceView  # Import the correct view


urlpatterns = [
    path('weather/', views.WeatherView.as_view(), name='weather'),
    path('crop_assistance/', CropAssistanceView.as_view(), name='crop_assistance'),
]

