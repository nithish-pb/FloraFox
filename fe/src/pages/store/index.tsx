import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { loadStripe } from "@stripe/stripe-js";

export default function Store() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null); // Holds selected product for Buy Now form
    const categories = ["Plants", "Pesticides", "Fertilizers", "Tools"];
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: "",
        address: "",
        phone: "",
        pincode: "",
        cashOnDelivery: false,
    });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const stripePromise = loadStripe("pk_test_51MycUDSBYRBP0vUThEG7mUcbwbw6EsvWfyjHv9PpCRf8H5q2prijFBwc1TB8mHAkVYOtAhIYg11Ez1xSwxB9nBtH00Fts2cRZC");


    const checkLoginStatus = () => {
        const storedUser = localStorage.getItem("username");
        setLoggedInUser(storedUser ? storedUser : null);
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/store/products/")
            .then((res) => {
                console.log("API Response:", res.data);
                setProducts(res.data.products);
            })
            .catch((err) => console.error("Error fetching products:", err))
            .finally(() => setLoading(false));

        checkLoginStatus();
        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, []);

    const filteredProducts = (products || []).filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategory ? product.category === selectedCategory : true)
    );


    const handleAddToCart = async (productId: number) => {
        const userToken = localStorage.getItem("token");
        if (!userToken) {
            alert("You need to be logged in to add items to the cart.");
            return;
        }

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/store/cart/add/${productId}/`,
                {},
                {
                    headers: {
                        "Authorization": `Token ${userToken}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'Your product was added successfully!',
                showConfirmButton: false,
                timer: 1500,  // Auto-close after 1.5 seconds
                toast: true,  // Makes it appear as a toast notification
                position: 'top-end',  // Appears at the top-right corner
                background: '#28a745', // Subtle green background
                color: '#fff',  // White text for contrast
            });
        } catch (error) {
            alert("Failed to add product to cart.");
        }
    };


    const handleBuyNow = (product: any) => {
        if (!loggedInUser) {
            window.dispatchEvent(new Event("openLogin"));
        } else {
            setSelectedProduct(product);
            setQuantity(1);
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
    const handleQuantityChange = (amount: number) => {
        setQuantity((prev) => Math.max(1, prev + amount)); // Ensure at least 1
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

        if (!selectedProduct) {
            setErrorMessage("No product selected.");
            return;
        }

        // Validate form fields
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


        const orderData = {
            product_id: selectedProduct.id,
            quantity: quantity,
            name: `${deliveryDetails.name} (Quantity: ${quantity})`,
            phone: deliveryDetails.phone,
            address: deliveryDetails.address,
            pincode: deliveryDetails.pincode,
            cash_on_delivery: deliveryDetails.cashOnDelivery,
        };

        try {
            if (deliveryDetails.cashOnDelivery) {
                // ✅ For Cash on Delivery: create order immediately
                const response = await axios.post(
                    `http://127.0.0.1:8000/store/order/`,
                    orderData,
                    {
                        headers: {
                            "Authorization": `Token ${userToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                Swal.fire({
                    title: 'Success!',
                    text: 'Order placed successfully!',
                    icon: 'success',
                    confirmButtonText: 'Cool!',
                    background: '#f0fff0',
                    showCloseButton: true,
                    timer: 3000,
                });

                setSelectedProduct(null);
                setDeliveryDetails({ name: "", address: "", phone: "", pincode: "", cashOnDelivery: false });

            } else {
                // ✅ Store delivery details temporarily in localStorage before redirecting
                localStorage.setItem('orderDetails', JSON.stringify({
                    product_id: selectedProduct.id,
                    quantity: quantity,
                    name: `${deliveryDetails.name} (Quantity: ${quantity})`,
                    phone: deliveryDetails.phone,
                    address: deliveryDetails.address,
                    pincode: deliveryDetails.pincode,
                }));
                // ✅ For Online Payment: redirect to Stripe Checkout
                const stripeResponse = await axios.post(
                    `http://127.0.0.1:8000/store/create-checkout-session/`,
                    orderData,
                    {
                        headers: {
                            "Authorization": `Token ${userToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (stripeResponse.data && stripeResponse.data.id) {
                    const stripe = await stripePromise; // ← You must have initialized this at the top
                    await stripe.redirectToCheckout({ sessionId: stripeResponse.data.id });
                } else {
                    throw new Error("Stripe session creation failed.");
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
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event) => {
        setMousePosition({
            x: event.clientX,
            y: event.clientY + window.scrollY // Adjust for scrolling
        });
    };

    const handleMouseEnter = (event, product) => {
        setHoveredProduct(product);
        setMousePosition({
            x: event.clientX,
            y: event.clientY + window.scrollY
        });
    };

    return (
        <div className="flex gap-6 p-6 mt-16">
            <div className="w-[250px] flex-shrink-0 p-5 bg-white/30 backdrop-blur-md rounded-lg shadow-md h-[calc(100vh-64px)]">
                <h2 className="text-xl font-semibold mb-5">Categories</h2>
                <ul className="space-y-2">
                    <li className={`text-base cursor-pointer hover:text-blue-600 ${selectedCategory === null ? "font-bold text-blue-600" : ""}`} onClick={() => setSelectedCategory(null)}>All</li>
                    {categories.map(category => (
                        <li key={category} className={`text-base cursor-pointer hover:text-blue-600 ${selectedCategory === category ? "font-bold text-blue-600" : ""}`} onClick={() => setSelectedCategory(category)}>{category}</li>
                    ))}
                </ul>
                <input type="text" placeholder="Search products..." className="mt-4 w-full p-2 text-base border rounded-md" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="border-l border-gray-300 h-[calc(100vh-64px)] "></div>

            <div className="w-3/4 relative" onMouseMove={handleMouseMove}>
                <h1 className="text-2xl font-bold mb-5 text-center">Store</h1>
                {loading ? (
                    <p className="text-center text-lg">Loading products...</p>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-5 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="border bg-white/60 backdrop-blur-md p-3 rounded-lg shadow-md flex flex-col items-center relative"
                                onMouseEnter={(e) => handleMouseEnter(e, product)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                <img src={`http://127.0.0.1:8000/media/${product.image}`} alt={product.name} className="w-full h-32 object-cover rounded-sm" />
                                <div className="bg-white/60 p-2 rounded-lg mt-1.5 text-center w-full">
                                    <h3 className="text-base font-semibold truncate">{product.name}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                                    <p className="text-sm font-bold mt-1">₹{product.price}</p>
                                    <div className="flex flex-col gap-3 mt-4 w-full">
                                        {loggedInUser && (
                                            <button className="bg-gray-300 text-lg px-3 py-2 rounded-md" onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                                        )}
                                        <button className="bg-blue-500 text-black text-lg px-3 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-green-500 hover:from-green-500 hover:to-lime-400 transition-all duration-300" onClick={() => handleBuyNow(product)}>Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-lg">No products available.</p>
                )}
                {hoveredProduct && (
                    <div
                        className="absolute bg-white/90 shadow-lg p-4 rounded-lg w-80 z-50 transition-opacity duration-300"
                        style={{
                            left: `${mousePosition.x - 700}px`,
                            top: `${mousePosition.y - 400}px`,
                            position: "absolute",
                        }}
                    >
                        <img src={`http://127.0.0.1:8000/media/${hoveredProduct.image}`} alt={hoveredProduct.name} className="w-full h-40 object-cover rounded-md" />
                        <h3 className="text-lg font-semibold mt-2">{hoveredProduct.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{hoveredProduct.description}</p>
                        <p className="text-sm font-bold mt-1">Category: {hoveredProduct.category}</p>
                        <p className="text-lg font-bold mt-2">₹{hoveredProduct.price}</p>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-start justify-center pt-20 ">
                    <form className="bg-white/50 backdrop-blur-lg p-4 rounded-lg w-1/3 " style={{ backgroundImage: 'url("https://i1.rgstatic.net/ii/profile.image/783784765034497-1563880258127_Q512/Khairuddin-Nur-Syazwin-Khairina.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }} onSubmit={handleSubmitDelivery}>
                        <h2 className="text-xl font-semibold mb-4">Enter Delivery Details</h2>

                        {/* Product details auto-filled */}
                        <div className="mb-4 flex justify-center">
                            <img src={`http://127.0.0.1:8000/media/${selectedProduct.image}`} alt={selectedProduct.name} className="w-28 h-28 object-cover rounded-sm" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium">Product Name</label>
                            <input
                                type="text"
                                value={selectedProduct.name}
                                disabled
                                className="w-full p-2 border rounded-md bg-gray-100"
                                style={{ fontSize: "0.8rem" }} // Increase text size
                            />

                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Price</label>
                            <input
                                type="text"
                                value={`₹${selectedProduct.price * quantity}`}
                                disabled
                                className="w-full p-2 border rounded-md bg-gray-100"
                                style={{ fontSize: "0.8rem" }} // Increase text size
                            />
                        </div>
                        {/* Product quantity selector */}

                        {/* Display the subtotal */}
                        <div className="mb-4 flex items-center">
                            <button type="button" className="bg-cyan-200 px-3 py-1 rounded-md text-2xl font-bold" onClick={() => handleQuantityChange(-1)}>-</button>
                            <span className="mx-4 text-lg">{quantity}</span>
                            <button type="button" className="bg-cyan-200 px-3 py-1 rounded-md text-2xl font-bold" onClick={() => handleQuantityChange(1)}>+</button>
                        </div>



                        {/* Delivery details fields */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border rounded-md"
                                style={{ fontSize: "0.8rem" }} // Increase text size
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

                        <div className="flex justify-center items-center gap-4 mt-4">
                            <button type="button" onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-cyan-700 hover:from-red-500 hover:to-orange-400 transition-all duration-300">Cancel</button>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-cyan-700 hover:from-green-500 hover:to-lime-400 transition-all duration-300">Submit</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
