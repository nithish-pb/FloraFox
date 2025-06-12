import stripe
from django.conf import settings
from django.http import JsonResponse
from .models import Product, Order, OrderItem, OrderPlacement
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging
from rest_framework.views import APIView
from rest_framework import status
from .serializers import OrderPlacementSerializer
from .serializers import ProductSerializer
from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import AllowAny  # Import this




stripe.api_key = settings.STRIPE_SECRET_KEY


logger = logging.getLogger(__name__)

def product_list(request):
    products = list(Product.objects.values())
    return JsonResponse({'products': products})


@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response({"products": serializer.data})

@api_view(['POST'])
@permission_classes([])
def add_product(request):
    data = request.data.copy()
    if 'image' in request.FILES:
        data['image'] = request.FILES['image']
    
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Product added successfully", "product": serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([])

def update_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Product updated successfully", "product": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([])

def delete_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return Response({"message": "Product deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    logger.info(f"User: {request.user} | Product ID: {product_id}")

    product = get_object_or_404(Product, id=product_id)
    order, created = Order.objects.get_or_create(user=request.user, status='pending')

    order_item, created = OrderItem.objects.get_or_create(order=order, product=product)

    if not created:
        order_item.quantity += 1  
    order_item.save()

    order.update_total_price()
    logger.info(f"Product added: {product.name} | Cart Total: {order.total_price}")

    return JsonResponse({
        "message": "Product added to cart",
        "product_name": product.name,
        "cart_total": order.total_price
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request, product_id, quantity):
    order = get_object_or_404(Order, user=request.user, status='pending')
    order_item = get_object_or_404(OrderItem, order=order, product_id=product_id)

    if quantity > 0:
        order_item.quantity = quantity
        order_item.save()
    else:
        order_item.delete()

    order.update_total_price()
    return Response({"message": "Cart updated", "cart_total": order.total_price})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    order = get_object_or_404(Order, user=request.user, status='pending')
    order_item = get_object_or_404(OrderItem, order=order, product_id=product_id)
    order_item.delete()

    order.update_total_price()
    return Response({"message": "Product removed from cart", "cart_total": order.total_price})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_cart(request):
    order = Order.objects.filter(user=request.user, status='pending').first()

    if not order:
        return JsonResponse({"cart": [], "total": 0})

    cart_items = [
        {
            "product_id": item.product.id,  # Add product_id here
            "product": item.product.name,
            "quantity": item.quantity,
            "subtotal": item.subtotal()
        }
        for item in order.items.all()
    ]

    return JsonResponse({"cart": cart_items, "total": order.total_price})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    order = get_object_or_404(Order, user=request.user, status='pending')
    order.status = 'completed'
    order.save()

    return JsonResponse({"message": "Order placed successfully!"})





class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')  
        user = request.user  # ✅ Ensure user is retrieved from request

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate required fields
        name = request.data.get('name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        pincode = request.data.get('pincode')
        cash_on_delivery = request.data.get('cash_on_delivery', True)

        if not all([name, phone, address, pincode]):
            return Response({"error": "All delivery details must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare order data for serializer
        order_data = {
            "product": product.id,  
            "name": name,
            "phone": phone,
            "address": address,
            "pincode": pincode,
            "cash_on_delivery": cash_on_delivery,
        }

        serializer = OrderPlacementSerializer(data=order_data)

        if serializer.is_valid():
            order = serializer.save(user=user)  # ✅ Assign user explicitly
            return Response({"message": "Order placed successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderListView(ListAPIView):
    permission_classes = [AllowAny]  # No restrictions
    queryset = OrderPlacement.objects.all()
    serializer_class = OrderPlacementSerializer

class UpdateOrderStatusView(UpdateAPIView):
    permission_classes = [AllowAny]  # No restrictions
    queryset = OrderPlacement.objects.all()
    serializer_class = OrderPlacementSerializer
    lookup_field = "id"


class UserOrderListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderPlacementSerializer

    def get_queryset(self):
        return OrderPlacement.objects.filter(user=self.request.user).order_by("-created_at")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = OrderPlacement.objects.get(id=order_id, user=request.user)
        
        if order.status == "Cancelled":
            return Response({"error": "Order is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set status to "Cancelled" and prevent future updates
        order.status = "Cancelled"
        order.save(update_fields=["status"])
        
        return Response({"message": "Order has been cancelled successfully.", "status": order.status}, status=status.HTTP_200_OK)
    
    except OrderPlacement.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    







class CreateStripeCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            product_id = data.get('product_id')
            quantity = int(data.get('quantity', 1))
            name = data.get('name')
            phone = data.get('phone')
            address = data.get('address')
            pincode = data.get('pincode')

            if not request.user.email:
                return Response({"error": "User email not available."}, status=400)

            product = Product.objects.get(id=product_id)

            # Create temporary Stripe customer using logged-in user’s email
            customer = stripe.Customer.create(
                name=name,
                email=request.user.email,  # ✅ use user's email
                phone=phone,
                address={
                    'line1': address,
                    'postal_code': pincode,
                    'country': 'IN',
                },
                shipping={
                    'name': name,
                    'address': {
                        'line1': address,
                        'postal_code': pincode,
                        'country': 'IN',
                    }
                },
            )

            # Create Stripe Checkout session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': product.name,
                            'description': 'Thank you for choosing FloraFox! 🌱',
                        },
                        'unit_amount': int(product.price * 100),
                    },
                    'quantity': quantity,
                }],
                mode='payment',
                customer=customer.id,
                success_url='http://localhost:5173/success',
                cancel_url='http://localhost:5173/cancel',
                metadata={
                    'product_id': product.id,
                    'name': name,
                    'phone': phone,
                    'address': address,
                    'pincode': pincode,
                    'quantity': quantity,
                    'user_id': str(request.user.id)
                }
            )

            return Response({'id': checkout_session.id})

        except Exception as e:
            print("❌ Stripe error:", str(e))
            return Response({'error': str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_order_after_payment(request):
    data = request.data
    product_id = data.get('product_id')
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    pincode = data.get('pincode')
    quantity = data.get('quantity')

    product = Product.objects.get(id=product_id)

    # Save to model
    
    OrderPlacement.objects.create(
        product=product,
        user=request.user,
        name=name,
        phone=phone,
        address=address,
        pincode=pincode,
        cash_on_delivery=False,  # Since it was Stripe
        status='Pending',
    )

    return Response({'message': 'Order placed successfully!'})


class CreatecartStripeCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            product_id = data.get('product_id')
            quantity = int(data.get('quantity', 1))
            name = data.get('name')
            phone = data.get('phone')
            address = data.get('address')
            pincode = data.get('pincode')

            if not request.user.email:
                return Response({"error": "User email not available."}, status=400)

            product = Product.objects.get(id=product_id)

            # Create temporary Stripe customer using logged-in user’s email
            customer = stripe.Customer.create(
                name=name,
                email=request.user.email,  # ✅ use user's email
                phone=phone,
                address={
                    'line1': address,
                    'postal_code': pincode,
                    'country': 'IN',
                },
                shipping={
                    'name': name,
                    'address': {
                        'line1': address,
                        'postal_code': pincode,
                        'country': 'IN',
                    }
                },
            )

            # Create Stripe Checkout session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': product.name,
                            'description': 'Thank you for choosing FloraFox! 🌱',
                        },
                        'unit_amount': int(product.price * 100),
                    },
                    'quantity': quantity,
                }],
                mode='payment',
                customer=customer.id,
                success_url='http://localhost:5173/success',
                cancel_url='http://localhost:5173/cancel',
                metadata={
                    'product_id': product.id,
                    'name': name,
                    'phone': phone,
                    'address': address,
                    'pincode': pincode,
                    'quantity': quantity,
                    'user_id': str(request.user.id)
                }
            )

            return Response({'id': checkout_session.id})

        except Exception as e:
            print("❌ Stripe error:", str(e))
            return Response({'error': str(e)}, status=400)
        
class CreateMultiProductStripeCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            data = request.data

            name = data.get('name')
            phone = data.get('phone')
            address = data.get('address')
            pincode = data.get('pincode')
            cart_items = data.get('cart_items')  # Get items from request

            if not user.email:
                return Response({"error": "User email not available."}, status=400)

            if not cart_items:
                return Response({"error": "Cart is empty."}, status=400)

            line_items = []
            metadata = {
                'user_id': str(user.id),
                'name': name,
                'phone': phone,
                'address': address,
                'pincode': pincode,
            }

            for index, item in enumerate(cart_items):
                product_id = item['product_id']
                quantity = item['quantity']
                product = Product.objects.get(id=product_id)

                line_items.append({
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': product.name,
                            'description': 'Thank you for choosing FloraFox! 🌿',
                        },
                        'unit_amount': int(product.price * 100),
                    },
                    'quantity': quantity,
                })

                metadata[f'product_{index}_id'] = str(product.id)
                metadata[f'product_{index}_quantity'] = str(quantity)

            customer = stripe.Customer.create(
                name=name,
                email=user.email,
                phone=phone,
                address={
                    'line1': address,
                    'postal_code': pincode,
                    'country': 'IN',
                },
                shipping={
                    'name': name,
                    'address': {
                        'line1': address,
                        'postal_code': pincode,
                        'country': 'IN',
                    }
                },
            )

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                customer=customer.id,
                success_url='http://localhost:5173/success-multi',

                cancel_url='http://localhost:5173/cancel',
                metadata=metadata
            )

            return Response({'id': checkout_session.id})

        except Exception as e:
            print("❌ Stripe Cart Error:", str(e))
            return Response({'error': str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_order_after_paymentmulti(request):
    data = request.data
    cart_items = data.get('cart_items', [])
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    pincode = data.get('pincode')

    if not cart_items:
        return Response({'error': 'No products found.'}, status=400)

    for item in cart_items:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            continue  # Skip invalid product

        OrderPlacement.objects.create(
            product=product,
            user=request.user,
            name=name,
            phone=phone,
            address=address,
            pincode=pincode,
            cash_on_delivery=False,
            status='Pending',
        )

    return Response({'message': 'Orders placed successfully!'})