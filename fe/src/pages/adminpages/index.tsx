import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";




const AdminPage = () => {


  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username"); // Assuming username is stored in localStorage
    const token = localStorage.getItem("authToken");

    // Redirect to home page if user is not logged in or not "admin"
    if (!token || username !== "admin") {
      navigate("/");
    }
  }, [navigate]);





  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "", category: "Plants", image: null });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);



  const token = localStorage.getItem("authToken");
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "contacts") fetchContacts();
  }, [activeTab]); // ✅ Fetch data based on active tab

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("products/");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`products/delete/${id}/`);
      fetchProducts();
      Swal.fire("Deleted!", "Product has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({ ...product, category: product.category || "Plants", image: product.image || null });
    setImagePreview(product.image ? `http://localhost:8000/media/${product.image}` : null);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setNewProduct({ name: "", description: "", price: "", stock: "", category: "Plants", image: null });

    setImagePreview(null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewProduct({ ...newProduct, image: file });
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", parseFloat(newProduct.price));
      formData.append("stock", newProduct.stock);
      formData.append("category", newProduct.category);

      if (newProduct.image && typeof newProduct.image !== "string") {
        formData.append("image", newProduct.image);
      }
      if (editingProduct) {
        await axiosInstance.put(`products/update/${editingProduct.id}/`, formData);
        Swal.fire("Updated!", "Product has been updated.", "success");
      } else {
        await axiosInstance.post("products/add/", formData);
        Swal.fire("Added!", "Product has been added.", "success");
      }
      setNewProduct({ name: "", description: "", price: "", stock: "", category: "Plants", image: null });
      setEditingProduct(null);
      setImagePreview(null);
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error.response?.data || error.message);
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("orders/");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response && error.response.status === 403) {
        Swal.fire("Access Denied", "You do not have permission to view orders.", "error");
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating Order ID: ${orderId} with Status: ${newStatus}`); // Debugging
      const response = await axiosInstance.patch(`orders/update/${orderId}/`, { status: newStatus });

      console.log("API Response:", response); // Debug API response

      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        Swal.fire("Updated!", "Order status has been updated.", "success");
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error updating order status:", error.response?.data || error.message);
      Swal.fire("Error", "Failed to update order status. Please try again.", "error");
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get("contact/subs/");  // Use axiosInstance with proper headers
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };


  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`contact/${contactId}/`, { status: newStatus });
      if (response.status === 200) {
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === contactId ? { ...contact, status: newStatus } : contact
          )
        );
        Swal.fire("Updated!", "Contact status has been updated.", "success");
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      Swal.fire("Error", "Failed to update contact status.", "error");
    }
  };


  return (

    <div className="p-6 flex relative h-screen">

      <div className="bg-gradient-to-r from-lime-300 to-cyan-400 transition-all duration-300 p-5 space-y-4 fixed left-[12%] top-1/2 -translate-y-1/2 rounded-lg shadow-lg backdrop-blur-md w-56 h-auto border-2 border-white">
        <h2 className="text-2xl font-bold text-center">Admin Panel</h2>

        <button
          className={`block w-full px-5 py-3 text-left text-lg rounded-md ${activeTab === "products" ? "bg-gray-500 text-white" : "hover:bg-gray-200"}`}
          onClick={() => {
            setActiveTab("products");
            setOrders([]);
            fetchProducts();
          }}
        >
          Products
        </button>

        <button
          className={`block w-full px-5 py-3 text-left text-lg rounded-md ${activeTab === "orders" ? "bg-gray-500 text-white" : "hover:bg-gray-200"}`}
          onClick={() => {
            setActiveTab("orders");
            setProducts([]);
            fetchOrders();
          }}
        >
          Orders
        </button>

        <button
          className={`block w-full px-5 py-3 text-left text-lg rounded-md ${activeTab === "contacts" ? "bg-gray-500 text-white" : "hover:bg-gray-200"}`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
      </div>


      <div className="ml-64 flex-1 p-6">

        {activeTab === "products" && (
          <>
            <div className="relative left-[57px] top-[9px] p-5">
              <h1 className="text-3xl font-bold mb-4">Manage Products</h1>
              <button onClick={handleAddProduct} className="px-4 py-2 bg-gradient-to-r from-lime-400 to-green-700 hover:from- hover:to-cyan-600 transition-all duration-300 rounded-lg shadow-md text-white mb-4">
                Add Product
              </button>
              <div className="grid grid-cols-2 gap-4">
                {[...products].reverse().map((product) => (

                  <div key={product.id} className="p-4 border shadow-lg flex justify-between items-center text-lg bg-gradient-to-r from-cyan-400 to-lime-50">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <img src={`http://localhost:8000/media/${product.image}`} alt={product.name} className="w-20 h-20 object-cover" />
                      )}
                      <div>
                        <span className="font-bold text-xl">{product.name}</span>
                        <div className="text-gray-700">₹{product.price}</div>
                        <div className="text-sm text-gray-600">
                          Stock: {product.stock}, Category: {product.category}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => handleEdit(product)} className="px-5 py-1 bg-gradient-to-r from-cyan-700 to- hover:from- hover:to-blue-400 transition-all rounded-lg shadow-md duration-300 text-white">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="px-2 py-1 bg-gradient-to-r from-green-600 to- hover:from- hover:to-red-400 transition-all rounded-lg shadow-md duration-300 text-white ml-2">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-md">
          <div className="bg-white/30 p-6 shadow-xl rounded-lg w-96 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-2 right-3 text-xl font-bold">&times;</button>
            <h3 className="text-lg font-semibold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            <input type="text" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="border p-2 w-full my-2" />
            <input type="text" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="border p-2 w-full my-2" />
            <input type="text" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="border p-2 w-full my-2" />
            <input type="text" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="border p-2 w-full my-2" />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="border p-2 w-full my-2"
            >
              <option value="Plants">Plants</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Tools">Tools</option>
            </select>

            <input type="file" onChange={handleImageChange} className="border p-2 w-full my-2" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover my-2" />}
            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white w-full">Save</button>
          </div>
        </div>
      )}
      {activeTab === "orders" && (
        <div className="relative left-[-0px] top-[30px] p-5">
          <h1 className="text-3xl font-bold mb-3">Manage Orders</h1>
          <div className="grid grid-cols-3 gap-3">
            {orders.length > 0 ? (
              [...orders].reverse().map((order) => (

                <div
                  key={order.id}
                  className={`p-3 border shadow-md text-base  ${order.status === "Delivered" ? "bg-gradient-to-r from-cyan-400 to-lime-100" : order.status === "Cancelled" ? "bg-gray-400" : "bg-gradient-to-r from-red-300 to-lime-100"
                    }`}
                >
                  <p><strong>Product:</strong> {order.product_name || "N/A"}</p>
                  <p><strong>Customer:</strong> {order.name}</p>
                  <p><strong>Address:</strong> {order.address || "No Address Provided"}</p>
                  <p><strong>Pincode:</strong> {order.pincode || "No Pincode Provided"}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Status:</strong>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="ml-2 border p-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </p>
                  <p className="mt-2">
                    <strong>Payment:</strong>{" "}
                    <span
                      className={`font-semibold px-3 py-1 rounded text-sm ${order.cash_on_delivery
                        ? "bg-gradient-to-r from-yellow-300 to-orange-400 text-black"
                        : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                        }`}
                    >
                      {order.cash_on_delivery ? "Cash on Delivery" : "Paid"}
                    </span>

                  </p>
                </div>
              ))
            ) : (
              <p className="text-base">No orders available.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="relative left-[20px] top-[34px] p-4">
          <h1 className="text-3xl font-bold mb-4">Manage Contacts</h1>
          <div className="grid grid-cols-2 gap-4">
            {contacts.length > 0 ? (
              [...contacts].reverse().map((contact) => (

                <div
                  key={contact.id}
                  className={`p-5 border shadow-md text-base w-[480px] ${contact.status === "Viewed" ? "bg-gradient-to-r from-cyan-400 to-lime-100" : "bg-gradient-to-r from-red-300 to-lime-100"
                    }`}
                >
                  <p><strong>Name:</strong> {contact.name}</p>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Description:</strong> {contact.description}</p>
                  <p><strong>Status:</strong>
                    <select
                      value={contact.status || "Not Viewed"}
                      onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                      className="ml-2 border p-1 text-sm"
                    >
                      <option value="Not Viewed">Not Viewed</option>
                      <option value="Viewed">Viewed</option>
                    </select>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-lg">No contact messages available.</p>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminPage;
