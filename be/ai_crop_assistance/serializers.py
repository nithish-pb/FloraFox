from rest_framework.serializers import ModelSerializer
from rest_framework import serializers



class WeatherSerializer(serializers.Serializer):
    temperature = serializers.FloatField()
    humidity = serializers.FloatField()
    description = serializers.CharField(max_length=200)