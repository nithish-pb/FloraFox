import { useState } from "react";
import axios from "axios";

export default function AddProduct() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: null,
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: any) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            await axios.post("http://127.0.0.1:8000/store/products/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Product added successfully!");
        } catch (err) {
            console.error("Error adding product:", err);
        }
    };

    return (
        <div>
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Product Name" onChange={handleChange} required />
                <textarea name="description" placeholder="Description" onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
                <input type="number" name="stock" placeholder="Stock" onChange={handleChange} required />
                <input type="file" name="image" onChange={handleFileChange} required />
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
}
