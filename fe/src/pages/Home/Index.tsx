import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import Welcome from "./components/Welcome";
import Works from "./components/Works";
import PageSection from "../../components/CardSection";
import foxbot from "../../assets/img/foxbot2.png"; // Import the image
import { Link } from "react-router-dom";



const Index = () => {
    const [activeItem, setActiveItem] = useState<number>(0);
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); //
    const navigate = useNavigate(); // Use navigate instead of history


    // Check login status and update loggedInUser state
    const checkLoginStatus = () => {
        const storedUser = localStorage.getItem("username");
        setLoggedInUser(storedUser ? storedUser : null);
    };

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener("storage", checkLoginStatus);
        return () => window.removeEventListener("storage", checkLoginStatus);
    }, []);

    // Open the login modal if the user is not logged in
    const openLoginModal = () => {
        window.dispatchEvent(new Event("openLogin"));
    };

    // Chatbot button click handler
    const handleClick = () => {
        if (loggedInUser) {
            // If the user is logged in, redirect to the Crop Assistance page
            setIsLoading(true);

            // Simulate a delay with setTimeout (e.g., 2 seconds)
            setTimeout(() => {
                navigate("/crop-assistance");
            }, 2000); // 2000ms = 2 second

        } else {
            // If the user is not logged in, open the login modal
            openLoginModal();
        }
    };

    const Items = [
        {
            name: "Welcome to FloraFox",
            component: <Welcome />
        },
        {
            name: "How It Works",
            component: <Works />
        }
    ];






    return (
        <div className="flex flex-col items-center w-full mt-20">
            {/* Main Card Section */}
            <PageSection
                Items={Items}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
            />

            {/* New Content - Placed Below the Card */}
            <div className="w-full flex flex-col items-center mt-16">
                {/* Information Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10 w-full max-w-6xl">
                    <div className="p-5 shadow-lg rounded-lg bg-white bg-opacity-50 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-green-700">Accurate Plant Diagnosis</h2>
                        <p className="text-gray-600">
                            Upload a plant image and get an AI-powered diagnosis in seconds.
                        </p>
                    </div>
                    <div className="p-5 shadow-lg rounded-lg bg-white bg-opacity-50 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-green-700">Weather-Based Advice</h2>
                        <p className="text-gray-600">
                            Receive customized care tips based on your local weather.
                        </p>
                    </div>
                    <div className="p-5 shadow-lg rounded-lg bg-white bg-opacity-50 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-green-700">Buy Plant Care Products</h2>
                        <p className="text-gray-600">
                            Browse and purchase medicines to treat detected plant diseases.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center w-full max-w-4xl px-4 py-6">
                    <h1 className="text-2xl font-bold text-green-800 drop-shadow-md mb-4">
                        Discover More
                    </h1>
                    <div className="flex flex-wrap justify-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-md">
                        {[
                            { href: "/diagnostic", icon: "🌱", text: "Diagnose" },
                            { href: "/store", icon: "🛒", text: "Store" },
                            { href: "/about", icon: "📖", text: "About Us" },
                        ].map((item, index) => (
                            <Link
                                key={index}
                                to={item.href} // Use "to" instead of "href"
                                className="px-4 py-2 text-sm font-semibold text-black bg-white/80 rounded-full shadow hover:bg-white transition-all duration-300 flex items-center gap-2"
                            >
                                <span className="text-lg">{item.icon}</span> {item.text}
                            </Link>
                        ))}
                    </div>
                </div>


            </div>

            {/* Floating Chatbot Button */}
            <div
                className="fixed cursor-pointer z-50"
                style={{
                    bottom: "calc(100vh - 520px)", // Adjust the bottom value (vertical position)
                    right: "calc(100vw - 1450px)"   // Adjust the right value (horizontal position)
                }}
                onClick={handleClick}
            >
                <img
                    src={foxbot}
                    alt="Chatbot"
                    className="w-32 h-32" // Increased size from w-16 to w-32 and h-16 to h-32
                />
            </div>
            {/* Cool Loading Animation (visible only if isLoading is true) */}
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="w-16 h-16 bg-blue-500 rounded-full animate-ping"></div>

                </div>
            )}
        </div>
    );
};

export default Index;
