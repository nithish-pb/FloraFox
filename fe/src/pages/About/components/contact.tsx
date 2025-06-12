import { useState } from "react";
import Input from "../../../components/ui/Input";
import TextArea from "../../../components/ui/TextArea";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa6";
import Button from "../../../components/ui/Button";

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent page reload

        // Get form data
        const formData = new FormData(event.target as HTMLFormElement);
        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const description = formData.get("description")?.toString().trim();

        // Validate input fields
        if (!name || !email || !description) {
            setMessage("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://127.0.0.1:8000/api/contact/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, description }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                setMessage("");
                setShowPopup(true); // Show pop-up
                (event.target as HTMLFormElement).reset(); // Clear form
                setTimeout(() => setShowPopup(false), 3000); // Auto-hide after 3 sec
            } else {
                setMessage(data?.error || "Failed to send message.");
            }
        } catch (error) {
            setLoading(false);
            setMessage("Network error. Please try again.");
            console.error("Error submitting form:", error);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-y-2 ">
                <div className="col-span-2">
                    <form onSubmit={handleSubmit} className="grid gap-2">
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                            <Input 
                                placeholder="Name"
                                name="name"
                                type="text"
                                className="bg-gradient-to-r from-lime-100 to-green-100 border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <Input 
                                placeholder="Email"
                                name="email"
                                type="email"
                                className="bg-gradient-to-r from-lime-100 to-green-100 border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="text-sm">
                            <TextArea 
                                placeholder="Description"
                                name="description"
                                rows={7}
                                className="bg-gradient-to-r from-lime-100 to-green-100 border border-green-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <Button 
                            priority="success"
                            text={loading ? "Sending..." : "Send"}
                            type="submit"
                            className="py-[7px] px-8 text-sm shadow mt-1 bg-gradient-to-r from-lime-200 to-green-400 hover:from-green-400 hover:to-lime-400 transition-all duration-300"
                        />
                    </form>
                    {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
                </div>
            </div>

            {/* Stylish Pop-up Message */}
            {showPopup && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-0 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white/30 bg-opacity-80 border border-gray-200 shadow-xl p-8 rounded-2xl text-center transform scale-95 animate-scaleUp">
            <p className="text-2xl font-bold text-green-600 mb-2">Thank You for your time  !</p>
            <p className="text-gray-700 text-sm">We will reach out to you soon.</p>
            <button 
                onClick={() => setShowPopup(false)} 
                className="mt-4 px-6 py-2 bg-gradient-to-r from-green-400 to-lime-500 text-white rounded-lg shadow-md hover:from-lime-500 hover:to-green-400 transition-all duration-900 ease-in-out transform hover:scale-105"
            >
                Close
            </button>
        </div>
    </div>
)}

        </>
    );
};

export default Contact;
