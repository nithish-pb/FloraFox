from django.urls import path
from .views import product_list
from .views import add_to_cart, update_cart, remove_from_cart, view_cart, checkout 
from .views import PlaceOrderView
from .views import get_products 
from .views import add_product, update_product, delete_product
from .views import OrderListView, UpdateOrderStatusView
from .views import UserOrderListView
from .views import cancel_order
from .views import CreateStripeCheckoutSession
from .views import save_order_after_payment
from .views import CreatecartStripeCheckoutSession
from .views import CreateMultiProductStripeCheckoutSession
from .views import save_order_after_paymentmulti



urlpatterns = [
    path('products/', product_list, name='product_list'),
    path('products/add/', add_product, name='add_product'),
    path('products/update/<int:product_id>/', update_product, name='update_product'),
    path('products/delete/<int:product_id>/', delete_product, name='delete_product'),
    path('cart/add/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('cart/update/<int:product_id>/<int:quantity>/', update_cart, name='update_cart'),  # PUT
    path('cart/remove/<int:product_id>/', remove_from_cart, name='remove_from_cart'),  # DELETE
    path('cart/', view_cart, name='view_cart'),
    path('cart/checkout/', checkout, name='checkout'),
    path('order/', PlaceOrderView.as_view(), name='place_order'),
    path("products/", get_products, name="get_products"),
     path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/update/<int:id>/', UpdateOrderStatusView.as_view(), name='update_order_status'),
    path('user/orders/', UserOrderListView.as_view(), name='user_orders'),
    path("cancel-order/<int:order_id>/", cancel_order, name="cancel-order"),
    path('create-checkout-session/', CreateStripeCheckoutSession.as_view(), name='create_checkout_session'),
    path('save-order/', save_order_after_payment),
    path('create-cart-checkout-session/', CreatecartStripeCheckoutSession.as_view(), name='create_checkout_session'),
    path('create-fullcart-checkout-session/', CreateMultiProductStripeCheckoutSession.as_view(), name='create_checkout_session'),
    path('save-ordermulti/', save_order_after_paymentmulti),
    
    
    
    
    

]
