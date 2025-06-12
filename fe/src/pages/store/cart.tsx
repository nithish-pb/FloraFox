import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { loadStripe } from "@stripe/stripe-js";

export default function Cart({ isOpen, onClose }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const userToken = localStorage.getItem("token"); // Get token from local storage
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // Holds selected product for Buy Now form
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: "",
        address: "",
        phone: "",
        pincode: "",
        cashOnDelivery: false,
    });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const checkLoginStatus = () => {
        const storedUser = localStorage.getItem("username");
        setLoggedInUser(storedUser ? storedUser : null);
    };
    const stripePromise = loadStripe("pk_test_51MycUDSBYRBP0vUThEG7mUcbwbw6EsvWfyjHv9PpCRf8H5q2prijFBwc1TB8mHAkVYOtAhIYg11Ez1xSwxB9nBtH00Fts2cRZC");

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
        checkLoginStatus();
        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, [isOpen]);

    // Fetch cart items
    const fetchCart = () => {
        axios.get("http://127.0.0.1:8000/store/cart/", {
            headers: { "Authorization": `Token ${userToken}` },
            withCredentials: true, // Allow cookies if needed
        })
            .then((res) => {
                setCartItems(res.data.cart);
                console.log("Fetched cart items:", res.data.cart); // Debugging

            })
            .catch((err) => console.error("Error fetching cart:", err))
            .finally(() => setLoading(false));
    };


    // Update item quantity in the cart
    const updateQuantity = async (product_id, quantity) => {
        try {
            const token = localStorage.getItem("token"); // Get the token from local storage
            const response = await axios.put(
                `http://127.0.0.1:8000/store/cart/update/${product_id}/${quantity}/`,
                {},
                {
                    headers: {
                        Authorization: `Token ${token}`, // Use token for authentication
                    },
                }
            );
            console.log('Cart updated:', response.data);
            fetchCart(); // Refresh cart after update
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    // Remove item from the cart
    const removeFromCart = async (product_id) => {
        try {
            const token = localStorage.getItem("token"); // Get the token from local storage
            const response = await axios.delete(
                `http://127.0.0.1:8000/store/cart/remove/${product_id}/`,
                {
                    headers: {
                        Authorization: `Token ${token}`, // Use token for authentication
                    },
                }
            );
            console.log('Item removed:', response.data);
            fetchCart(); // Refresh cart after removal
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    // Calculate total price
    const calculateTotal = () => {
        if (!cartItems.length) return 0; // Return 0 if no items
        const total = cartItems.reduce((total, item) => {
            // Ensure subtotal is a valid number
            const itemSubtotal = parseFloat(item.subtotal) || 0;
            return total + itemSubtotal;
        }, 0);
        console.log("Calculated total:", total); // Debugging
        return total;
    };

    // Handle "Buy Now" for a single product
    const handleBuyNowForProduct = (product: any) => {
        if (!loggedInUser) {
            window.dispatchEvent(new Event("openLogin"));
        } else {
            console.log("Selected product:", product); // Add this to debug and check the product data
            setSelectedProduct(product);
            setErrorMessage("");
        }
    };

    const handleBuyNow = () => {
        if (!loggedInUser) {
            window.dispatchEvent(new Event("openLogin"));
        } else {
            setSelectedProduct(cartItems); // Set all cart items for checkout
            setErrorMessage("");
        }
    };


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setDeliveryDetails({
            ...deliveryDetails,
            [name]: type === "checkbox" ? checked : value,
        });
    };


    const handleCashOnDeliveryChange = () => {
        setDeliveryDetails({
            ...deliveryDetails,
            cashOnDelivery: !deliveryDetails.cashOnDelivery,
        });
    };



    const handleSubmitDelivery = async (e: React.FormEvent) => {
        e.preventDefault();
        const userToken = localStorage.getItem("token");

        if (!selectedProduct || (Array.isArray(selectedProduct) && selectedProduct.length === 0)) {
            setErrorMessage("No product selected.");
            return;
        }

        if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.phone || !deliveryDetails.pincode) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (!userToken) {
            alert("You need to be logged in to place an order.");
            return;
        }

        if (!deliveryDetails.cashOnDelivery && !deliveryDetails.onlinePayment) {
            alert("Please select a payment method.");
            return;
        }


        try {
            if (deliveryDetails.cashOnDelivery) {
                // ✅ Cash on Delivery for single or multiple products
                const orderPromises = (Array.isArray(selectedProduct) ? selectedProduct : [selectedProduct]).map(item => {
                    const orderData = {
                        product_id: item.product_id,
                        name: `${deliveryDetails.name} (Quantity: ${item.quantity})`,
                        phone: deliveryDetails.phone,
                        address: deliveryDetails.address,
                        pincode: deliveryDetails.pincode,
                        cash_on_delivery: true,
                    };

                    console.log("Sending COD order for:", item.product);

                    return axios.post(`http://127.0.0.1:8000/store/order/`, orderData, {
                        headers: {
                            "Authorization": `Token ${userToken}`,
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    });
                });

                await Promise.all(orderPromises);

                Swal.fire({
                    title: "Success!",
                    text: "Cash on Delivery order placed successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                    background: "#f0fff0",
                    showCloseButton: true,
                    timer: 3000,
                });

                setSelectedProduct(null);
                setDeliveryDetails({ name: "", address: "", phone: "", pincode: "", cashOnDelivery: false });

            } else {
                if (Array.isArray(selectedProduct)) {
                    // ✅ Save to localStorage BEFORE Stripe redirect
                    localStorage.setItem("orderDetails", JSON.stringify({
                        name: deliveryDetails.name,
                        phone: deliveryDetails.phone,
                        address: deliveryDetails.address,
                        pincode: deliveryDetails.pincode,
                        cart_items: selectedProduct
                    }));
                    // ✅ Multiple Products — use full cart Stripe session
                    const stripeResponse = await axios.post(
                        `http://127.0.0.1:8000/store/create-fullcart-checkout-session/`,
                        {
                            name: deliveryDetails.name,
                            phone: deliveryDetails.phone,
                            address: deliveryDetails.address,
                            pincode: deliveryDetails.pincode,
                            cart_items: selectedProduct,  // ✅ send the full product list
                        },
                        {
                            headers: {
                                "Authorization": `Token ${userToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (stripeResponse.data && stripeResponse.data.id) {
                        const orderDetails = {
                            name: deliveryDetails.name,
                            phone: deliveryDetails.phone,
                            address: deliveryDetails.address,
                            pincode: deliveryDetails.pincode,
                            cart_items: selectedProduct,  // selectedProduct is already an array
                        };

                        localStorage.setItem("orderDetails", JSON.stringify(orderDetails)); // ✅ Save full cart details

                        const stripe = await stripePromise;
                        await stripe.redirectToCheckout({ sessionId: stripeResponse.data.id });
                    }
                    else {
                        throw new Error("Stripe session creation failed for cart.");
                    }

                } else {
                    // ✅ Single Product Stripe flow
                    const orderData = {
                        product_id: selectedProduct.product_id,
                        quantity: selectedProduct.quantity,
                        name: `${deliveryDetails.name} (Quantity: ${selectedProduct.quantity})`,
                        phone: deliveryDetails.phone,
                        address: deliveryDetails.address,
                        pincode: deliveryDetails.pincode,
                        cash_on_delivery: false,
                    };

                    localStorage.setItem("orderDetails", JSON.stringify(orderData));

                    const stripeResponse = await axios.post(
                        `http://127.0.0.1:8000/store/create-cart-checkout-session/`,
                        orderData,
                        {
                            headers: {
                                "Authorization": `Token ${userToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (stripeResponse.data && stripeResponse.data.id) {
                        const stripe = await stripePromise;
                        await stripe.redirectToCheckout({ sessionId: stripeResponse.data.id });
                    } else {
                        throw new Error("Stripe session creation failed.");
                    }
                }
            }

        } catch (error: any) {
            console.error("Order Error:", error.response?.data || error.message);
            setErrorMessage(error.response?.data?.error || "Failed to place the order.");
        }
    };


    const handleCancel = () => {
        setSelectedProduct(null);
        setDeliveryDetails({ name: "", address: "", phone: "", pincode: "", cashOnDelivery: false });
    };
    const totalQuantity = Array.isArray(selectedProduct)
        ? selectedProduct.reduce((sum, item) => sum + item.quantity, 0)
        : selectedProduct?.quantity || 1;

    const calculateSelectedTotal = () => {
        if (!Array.isArray(selectedProduct)) return selectedProduct?.subtotal || 0;
        return selectedProduct.reduce((total, item) => total + parseFloat(item.subtotal), 0);
    };



    return (
        <div className={`fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center ${isOpen ? "visible" : "invisible"}`}>
            <div className="bg-white/70 backdrop-blur-lg p-9 rounded-lg w-96 shadow-lg relative">
                <h2 className="text-lg font-bold mb-3">Your Cart</h2>
                <button className="absolute top-3 right-3 text-xl" onClick={onClose}>×</button>

                {loading ? <p>Loading...</p> : cartItems.length > 0 ? (
                    <>
                        {/* Cart Items Container */}
                        <div className="h-72 overflow-y-auto pb-8" style={{ scrollbarWidth: "8px", scrollbarColor: "rgba(0, 0, 0, 0.2) transparent" }}>
                            {cartItems.map((item, index) => (
                                <div key={index} className="border-b py-3 flex justify-between items-center text-md">
                                    <div>
                                        <p className="font-semibold text-xl">{item.product}</p>
                                        <p className="text-lg">₹{item.subtotal} (x{item.quantity})</p>
                                        <div className="flex items-center mt-1">
                                            <button className="px-3 py-1 bg-gray-200 text-xl" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                            <span className="px-3 text-xl">{item.quantity}</span>
                                            <button className="px-3 py-1 bg-gray-200 text-xl" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <button className="mt-2 bg-green-600 text-white py-2 px-5 rounded-lg text-sm" onClick={() => removeFromCart(item.product_id)}>  Remove  </button>
                                        <button className="mt-2 bg-green-600 text-white py-2 px-5 rounded-lg" onClick={() => handleBuyNowForProduct(item)}>
                                            <span className="text-white text-sm">Buy</span><span className="text-black text-sm">Now</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total and Checkout */}
                        <div className="border-t pt-3 mt-4 flex justify-between items-center">
                            <span className="font-bold text-xl">Total</span>
                            <span className="text-xl">₹{calculateTotal()}</span>
                        </div>

                        {/* Fixed footer for Buy Now button */}
                        <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 hover:from-green-400 hover:to-lime-400 transition-all duration-300" onClick={handleBuyNow}>Buy Now</button>
                    </>
                ) : <p>Your cart is empty.</p>}
            </div>
            {selectedProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center pt-20">
                    <form
                        className="bg-white/50 backdrop-blur-lg p-6 pr-4 rounded-lg w-1/3 min-h-[400px] max-h-[80vh] overflow-y-auto pb-8 mx-auto"
                        style={{
                            overflow: "overlay",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
                            backgroundImage: 'url("https://i1.rgstatic.net/ii/profile.image/783784765034497-1563880258127_Q512/Khairuddin-Nur-Syazwin-Khairina.jpg")',
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onSubmit={handleSubmitDelivery}
                    >
                        <h2 className="text-xl font-semibold mb-4">Enter Delivery Details</h2>

                        {/* Display multiple products in the form */}
                        {Array.isArray(selectedProduct) ? (
                            selectedProduct.map((item, index) => (
                                <div key={index} className="mb-4">
                                    <label className="block text-sm font-medium">Product Name</label>
                                    <input
                                        type="text"
                                        value={item.product}
                                        disabled
                                        className="w-full p-2 border rounded-md bg-gray-100"
                                        style={{ fontSize: "0.8rem" }}
                                    />
                                    <label className="block text-sm font-medium">Price</label>
                                    <input
                                        type="text"
                                        value={`₹${item.subtotal}`}
                                        disabled
                                        className="w-full p-2 border rounded-md bg-gray-100"
                                        style={{ fontSize: "0.8rem" }}
                                    />
                                </div>

                            ))
                        ) : (
                            <>
                                <label className="block text-sm font-medium">Product Name</label>
                                <input
                                    type="text"
                                    value={selectedProduct?.product}
                                    disabled
                                    className="w-full p-2 border rounded-md bg-gray-100"
                                    style={{ fontSize: "0.8rem" }}
                                />
                                <label className="block text-sm font-medium">Price</label>
                                <input
                                    type="text"
                                    value={`₹${selectedProduct?.subtotal}`}
                                    disabled
                                    className="w-full p-2 border rounded-md bg-gray-100"
                                    style={{ fontSize: "0.8rem" }}
                                />
                            </>
                        )}

                        <div className="border-t pt-3 mt-4 flex justify-between items-center">
                            <span className="font-bold text-xl">Total Price</span>
                            <span className="text-xl">₹{calculateSelectedTotal()}</span>
                        </div>



                        {/* Delivery details fields */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border rounded-md"
                                style={{ fontSize: "0.8rem" }}
                                value={deliveryDetails.name}
                                onChange={handleFormChange}
                                placeholder="Enter your name"
                                required
                            />

                            {/* Show quantity along with Product IDs */}
                            <div className="hidden">
                                <div className="text-xs text-gray-600 mt-1">
                                    {Array.isArray(selectedProduct) ? (
                                        selectedProduct.map((item) => (
                                            <p key={item.product_id}>
                                                Product ID: {item.product_id} | Quantity: {item.quantity}
                                            </p>
                                        ))
                                    ) : (
                                        <p>Product ID: {selectedProduct?.product_id} | Quantity: {selectedProduct?.quantity || 1}</p>
                                    )}
                                </div>
                            </div>


                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Address</label>
                            <input
                                type="text"
                                name="address"
                                className="w-full p-2 border rounded-md"
                                style={{ fontSize: "0.8rem" }} // Increase text size
                                value={deliveryDetails.address}
                                onChange={handleFormChange}
                                placeholder="Enter your address"
                                required
                            />
                        </div>
                        {/* Added pincode input */}
                        <div className="flex gap-4 mt-8">
                            <label className="block text-sm font-medium">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                className="w-full p-2 border rounded-md"
                                style={{ fontSize: "0.8rem" }} // Increase text size
                                value={deliveryDetails.pincode || ""}
                                onChange={handleFormChange}
                                placeholder="Enter your pincode"
                                required
                            />

                            <label className="block text-sm font-medium">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                className="w-full p-2 border rounded-md"
                                style={{ fontSize: "0.8rem" }} // Increase text size
                                value={deliveryDetails.phone}
                                onChange={handleFormChange}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-6 mb-4 mt-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="cashOnDelivery"
                                    checked={deliveryDetails.cashOnDelivery}
                                    onChange={handleCashOnDeliveryChange}
                                    className="mr-2"
                                />
                                <label className="block text-sm font-medium">Cash on Delivery</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="onlinePayment"
                                    checked={!deliveryDetails.cashOnDelivery && deliveryDetails.onlinePayment}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setDeliveryDetails({
                                            ...deliveryDetails,
                                            cashOnDelivery: false,
                                            onlinePayment: checked,
                                        });
                                    }}
                                    className="mr-2"
                                />
                                <label className="block text-sm font-medium">Online Payment</label>
                            </div>
                        </div>


                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                        {/* Sticky Footer for Buttons */}
                        <div
                            className="sticky bottom-0 left-0 w-full backdrop-blur-lg py-3 flex justify-center items-center gap-4 border-t border-gray-300 shadow-md rounded-lg"
                            style={{
                                backgroundImage: `url("https://i1.rgstatic.net/ii/profile.image/783784765034497-1563880258127_Q512/Khairuddin-Nur-Syazwin-Khairina.jpg")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        >
                            <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-16 py-4 rounded-md bg-gradient-to-r from-blue-400 to-cyan-700 hover:from-red-500 hover:to-orange-400 transition-all duration-300">Cancel</button>
                            <button type="submit" className="bg-blue-500 text-white px-16 py-4 rounded-md bg-gradient-to-r from-blue-400 to-cyan-700 hover:from-green-500 hover:to-lime-400 transition-all duration-300">Submit</button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
}