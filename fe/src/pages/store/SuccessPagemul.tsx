import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const SuccessPagemul = () => {
    const hasSaved = useRef(false); // ✅ Prevents double call
    const navigate = useNavigate();

    useEffect(() => {
        if (hasSaved.current) return;

        const orderData = JSON.parse(localStorage.getItem('orderDetails') || '{}');
        const token = localStorage.getItem('token'); // JWT or Token

        if (orderData && token) {
            axios.post("http://127.0.0.1:8000/api/save-ordermulti/", orderData, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            })
                .then(res => {
                    console.log("✅ Order saved successfully:", res.data);
                    localStorage.removeItem("orderDetails");
                })
                .catch(err => {
                    console.error("❌ Failed to save order:", err.response?.data || err.message);
                });
        }

        hasSaved.current = true;
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/store");
        }, 3000); // 3 seconds

        return () => clearTimeout(timer); // cleanup if unmount
    }, [navigate]);





    return (

        <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center border border-green-200">
            <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-3xl text-green-600">✓</span>
                </div>
            </div>
            <h1 className="text-3xl font-extrabold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-700 mb-1 text-lg">Thank you for your order.</p>
            <p className="text-gray-500 mb-4 text-sm">We’ll process it shortly and keep you updated.</p>
            <a
                href="/store"
                className="inline-block mt-4 px-6 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition duration-200"
            >
                Back to Store
            </a>
        </div>

    );

};

export default SuccessPagemul;
