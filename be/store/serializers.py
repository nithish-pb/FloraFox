from rest_framework import serializers
from .models import OrderPlacement
from .models import Product

class OrderPlacementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)  # ✅ Add product name

    class Meta:
        model = OrderPlacement
        fields = ['id', 'product', 'product_name', 'user', 'name', 'phone', 'address', 'pincode', 'cash_on_delivery', 'status', 'created_at']
        read_only_fields = ['user', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'  # Ensure all fields are included
