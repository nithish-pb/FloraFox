from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import APIView
import requests
from .serializers import WeatherSerializer
from rest_framework.views import APIView

    
# WeatherView: Fetch weather information based on city
class WeatherView(APIView):
    def get_weather(self, city_name):
        api_key = "weathermap_api_key"  # OpenWeatherMap API key
        base_url = "http://api.openweathermap.org/data/2.5/weather?"
        complete_url = f"{base_url}q={city_name}&appid={api_key}&units=metric"

        response = requests.get(complete_url)
        data = response.json()

        if data.get("cod") != "404":
            weather_data = data["main"]
            weather_description = data["weather"][0]["description"]
            temperature = weather_data["temp"]
            humidity = weather_data.get("humidity", "Data unavailable")
            precipitation = data.get("rain", {}).get("1h", 0)

            return {
                "temperature": temperature,
                "humidity": humidity,
                "precipitation": precipitation,
                "weather_condition": weather_description,
                
            }
        else:
            return None

    def get(self, request):
        city_name = request.query_params.get('city')

        if not city_name:
            return Response({"error": "City name is required"}, status=400)

        weather_data = self.get_weather(city_name)

        if weather_data:
            return Response(weather_data)
        else:
            return Response({"error": "City not found"}, status=404)


# CropAssistanceView: Provides crop-specific advice based on weather

class CropAssistanceView(APIView):
    def get_weather(self, city_name):
        api_key = "weathermap_api_key"  # OpenWeatherMap API key
        base_url = "http://api.openweathermap.org/data/2.5/weather?"
        complete_url = f"{base_url}q={city_name}&appid={api_key}&units=metric"

        response = requests.get(complete_url)
        data = response.json()

        if data.get("cod") != "404":
            weather_data = data["main"]
            weather_description = data["weather"][0]["description"]
            temperature = weather_data["temp"]
            humidity = weather_data.get("humidity", "Data unavailable")
            precipitation = data.get("rain", {}).get("1h", 0)
            

            return {
                "temperature": temperature,
                "humidity": humidity,
                "precipitation": precipitation,
                "weather_condition": weather_description,
            }
        else:
            return None

    def get_crop_advice(self, crop_name, weather_data):
        crop_advice = {
            "watering": f"Watering schedule should be adjusted based on precipitation: {weather_data['precipitation']} mm",
            "temperature": f"Optimal temperature for {crop_name}: {weather_data['temperature']}°C",
            "humidity": weather_data["humidity"],
            "precipitation": weather_data["precipitation"],
            "weather_condition": weather_data["weather_condition"],
            "soil_moisture": "Data unavailable",  # OpenWeatherMap doesn't provide soil moisture
            "pests": "Watch out for region-specific pests depending on the humidity and temperature levels",
        }

        return crop_advice

    def get(self, request):
        crop_name = request.query_params.get('crop')
        city_name = request.query_params.get('city')

        if not crop_name or not city_name:
            return Response({"error": "Both crop name and city are required"}, status=400)

        weather_data = self.get_weather(city_name)

        if weather_data:
            advice = self.get_crop_advice(crop_name, weather_data)
            return Response(advice)
        else:
            return Response({"error": "City not found"}, status=404)
    

