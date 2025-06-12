from django.db import models
from django.conf import settings
from django.contrib.auth.models import User  # Add this import


class Product(models.Model):
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='product_images/')
    stock = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)  # Fix: Auto set creation time

    category = models.CharField(max_length=50, choices=[
        ('Plants', 'Plants'),
        ('Pesticides', 'Pesticides'),
        ('Fertilizers', 'Fertilizers'),
        ('Tools', 'Tools'),
    ], default='Plants')

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),  # Acts as the cart
        ('completed', 'Completed'),  # Order is placed
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def update_total_price(self):
        """Update total price based on OrderItems."""
        self.total_price = sum(item.subtotal() for item in self.items.all())
        self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)


    def subtotal(self):
        return self.product.price * self.quantity


class OrderPlacement(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    pincode = models.CharField(max_length=6)
    cash_on_delivery = models.BooleanField(default=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order for {self.product.name} by {self.user.username}"