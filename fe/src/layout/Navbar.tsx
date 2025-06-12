import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Item from "../components/Item";
import foxLogo from "/src/assets/img/foxlg.png";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Cart from "../pages/store/cart";
import Badge from "@mui/material/Badge";
import Swal from 'sweetalert2';
import { useLocation } from "react-router-dom";


const ItemList = ["Home", "About", "Diagnose", "Store"];
const DropdownItems = ["Home", "About", "Diagnose"];

const Navbar = () => {
  const [activeItem, setActiveItem] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openOrders, setOpenOrders] = useState(false);
  const [orders, setOrders] = useState([]);





  // State for user signup inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const navigate = useNavigate();





  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedToken = localStorage.getItem("token");

    console.log("Checking Local Storage after refresh...");
    console.log("Stored User:", storedUser);
    console.log("Stored Token:", storedToken);

    if (storedUser) {
      setLoggedInUser(storedUser);
    }
    if (storedToken) {
      console.log("Token after refresh:", storedToken);  // ✅ Logs token after refresh
    }

    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(storedCart.length);
  }, []);



  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (openOrders) {
      const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch("http://localhost:8000/api/user/orders/", {
            headers: { Authorization: `Token ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, [openOrders]);

  const cancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmCancel = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      customClass: {
        popup: "swal2-popup", // Apply this class
      },
      didOpen: () => {
        document.querySelector(".swal2-container")?.setAttribute("style", "z-index: 9999 !important;");
      },
    });

    if (!confirmCancel.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/api/cancel-order/${orderId}/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "Cancelled" } : order
          )
        );

        await Swal.fire({
          title: "Cancelled!",
          text: "Order cancelled successfully! For online transactions, your refund will be processed within 2 days.",
          icon: "success",
          confirmButtonColor: "#4CAF50",
          customClass: {
            popup: "swal2-popup", // Apply this class
          },
          didOpen: () => {
            document.querySelector(".swal2-container")?.setAttribute("style", "z-index: 9999 !important;");
          },
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: data.error || "Failed to cancel order.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };





  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  useEffect(() => {
    const OpenLogin = () => setOpenLogin(true); // Function to show modal

    window.addEventListener("openLogin", OpenLogin);
    return () => window.removeEventListener("openLogin", OpenLogin);
  }, []);




  // Login API Call
  const handleLogin = async () => {
    const response = await fetch("http://localhost:8000/user/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json(); // Assuming the response contains a token
      console.log(data)
      localStorage.setItem("token", data.token); // Store the token
      localStorage.setItem("username", username); // Store the username

      const userRole = username === "admin" ? "admin" : "user"; // Default role logic
      localStorage.setItem("userRole", userRole);


      setLoggedInUser(username);
      setOpenLogin(false);
      setOpenWelcome(true);

      if (username === "admin") {  // Redirect if admin logs in
        window.location.href = "/admin";
      }

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed!',
        text: 'Please check your credentials and try again.',
        toast: true, // Small, non-intrusive alert
        position: 'top', // Positioned at the top of the screen
        padding: '20px', // Adjust the padding for space
        showConfirmButton: false,
        timer: 3000, // Auto-close after 3 seconds
        background: '#dc3545', // Red background for error
        color: '#fff', // White text
        timerProgressBar: true, // Progress bar
        customClass: {
          container: 'swal2-top-start swal2-noanimation', // Custom class for positioning
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) {
            container.style.top = '100px'; // Adjust vertical position
            container.style.left = '50%'; // Center horizontally
            container.style.transform = 'translateX(-50%)'; // Center alignment
          }
        },
      });
    }
  };



  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (event.currentTarget) {
      setUserAnchorEl(event.currentTarget); // Ensures proper positioning
    }
    event.stopPropagation(); // Prevents clicks from triggering unwanted behaviors
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  // Signup API call
  const handleSignUp = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Password Validation Failed!',
        text: 'Password must be at least 6 characters long, with at least one uppercase letter, one lowercase letter, and one number.',
        toast: true, // Small, non-intrusive alert
        position: 'top', // Positioned at the top of the screen
        padding: '20px', // Adjust the padding for space
        showConfirmButton: false,
        timer: 4000, // Auto-close after 4 seconds
        background: '#dc3545', // Red background for error
        color: '#fff', // White text
        timerProgressBar: true, // Progress bar
        customClass: {
          container: 'swal2-top-start swal2-noanimation', // Custom class for positioning
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) {
            container.style.top = '20px'; // Adjust vertical position
            container.style.left = '50%'; // Center horizontally
            container.style.transform = 'translateX(-50%)'; // Center alignment
          }
        },
      });
      return;
    }

    const response = await fetch("http://localhost:8000/user/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success', // 'Success' should be lowercase 'success'
        title: 'SignUp successful',
        toast: true,
        position: 'top',
        padding: '20px',
        confirmButtonText: "OK",
        timer: 3000,
        background: "#2fdb3c", // Strong success green
        color: "#ffffff", // White text for contrast
        timerProgressBar: true,
        customClass: {
          container: 'swal2-top-start swal2-noanimation',
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) {
            container.style.top = '100px';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
          }
        },
      });

      setOpenSignUp(false);
      setOpenLogin(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sign-up Failed!',
        text: 'Username or Email already exists with another account.',
        toast: true, // Small, non-intrusive alert
        position: 'top', // Positioned at the top of the screen
        padding: '20px', // Adjust the padding for space
        showConfirmButton: false,
        timer: 3000, // Auto-close after 3 seconds
        background: '#dc3545', // Red background for error
        color: '#fff', // White text
        timerProgressBar: true, // Progress bar
        customClass: {
          container: 'swal2-top-start swal2-noanimation', // Custom class for positioning
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) {
            container.style.top = '70px'; // Adjust vertical position
            container.style.left = '50%'; // Center horizontally
            container.style.transform = 'translateX(-50%)'; // Center alignment
          }
        },
      });
    }
  };
  const location = useLocation();


  return (
    <nav
      className={`fixed inset-x-2 top-5 flex justify-between items-center px-10 md:px-20 py-2 
       rounded-full z-50 transition-all 
      ${scrolling ? "bg-green-200 bg-opacity-60 backdrop-blur-lg" : ""}`}
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <img
          src={foxLogo}
          alt="Fox Logo"
          className={`transition-all duration-300 ${scrolling ? "w-14" : "w-16"}`}
        />
        <div className="font-bold text-lg text-black transition-all duration-300 hover:text-green-500">
          FloraFox
        </div>
      </div>

      <ul className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-10 font-semibold text-black">
        {ItemList.map((item, index) => {
          const itemPath = item.toLowerCase() === "home"
            ? "/"
            : item.toLowerCase() === "diagnose"
              ? "/diagnostic"
              : `/${item.toLowerCase()}`;

          return (
            <Item
              key={index}
              isActive={location.pathname === itemPath} // Highlights based on route
              name={item}
              index={index}
              setActiveItem={setActiveItem}
              className={`transition-all cursor-pointer hover:text-green-500 ${location.pathname === itemPath ? "text-green-600 font-bold" : ""
                }`}
              onClick={() => navigate(itemPath)}
            />
          );
        })}
      </ul>

      <div className="flex items-center gap-4">
        {loggedInUser ? (
          <div className="relative flex items-center gap-2">
            <span className="text-black font-semibold">{loggedInUser}</span>
            <div className="relative flex items-center gap-2">

              <IconButton onClick={handleUserMenuOpen} className="text-black">
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
                onMouseLeave={handleUserMenuClose} // Close menu when mouse leaves
                MenuListProps={{ onMouseLeave: handleUserMenuClose }} // Ensures the menu list also triggers closing
                sx={{
                  "& .MuiPaper-root": {
                    background: "rgba(82, 80, 80, 0)",
                    backdropFilter: "blur(20px)",
                    color: "green",
                  },
                }}
              >
                <MenuItem onClick={() => { navigate("/store"); handleMenuClose(); }}>Store</MenuItem>
                <MenuItem onClick={() => { navigate("/crop-assistance"); handleMenuClose(); }}>Get Farming Advice</MenuItem>
                {loggedInUser === "admin" && (
                  <MenuItem
                    onClick={() => {
                      navigate("/admin");
                      handleMenuClose();
                    }}
                    style={{
                      background: "linear-gradient(to right, rgba(244, 123, 123, 0.41), rgba(134, 235, 235, 0.5))",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      color: "white",
                      fontWeight: "bold",
                      transition: "all 0.3s ease-in-out", // Smooth transition effect
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(to right, rgba(244, 50, 50, 0.9), rgba(70, 200, 200, 0.9))";
                      e.target.style.transform = "scale(1.05)"; // Slightly enlarges on hover
                      e.target.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)"; // Adds a shadow effect
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "linear-gradient(to right, rgba(244, 123, 123, 0.41), rgba(134, 235, 235, 0.5))";
                      e.target.style.transform = "scale(1)"; // Restores original size
                      e.target.style.boxShadow = "none"; // Removes shadow
                    }}
                  >
                    Admin Panel
                  </MenuItem>
                )}

                <MenuItem onClick={() => { setOpenOrders(true); handleMenuClose(); }}>
                  Your Orders
                </MenuItem>



                <MenuItem
                  onClick={() => {
                    Swal.fire({
                      title: "Confirm Logout",
                      text: "Are you sure you want to log out?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Yes, Logout",
                      cancelButtonText: "Cancel",
                      background: "linear-gradient(to right, #e0f7e9, #c4f1f9)", // Light green-cyan gradient
                      color: "#333", // Dark text for readability
                      customClass: {
                        popup: "rounded-xl p-5", // Rounded modal
                        confirmButton: "swal-confirm-btn",
                        cancelButton: "swal-cancel-btn",
                      },
                      didOpen: () => {
                        document.querySelector(".swal-confirm-btn")?.setAttribute("style", `
          background: linear-gradient(to right, #8ed081, #58c0b9); 
          color: white; 
          padding: 8px 16px; 
          border-radius: 12px; 
          border: none;
        `);
                        document.querySelector(".swal-cancel-btn")?.setAttribute("style", `
          background: linear-gradient(to right, #fbc2eb, #a6c1ee); 
          color: black; 
          padding: 8px 16px; 
          border-radius: 12px; 
          border: none;
        `);
                      }
                    }).then((result) => {
                      if (result.isConfirmed) {
                        setLoggedInUser(null);
                        localStorage.removeItem("username");
                        localStorage.removeItem("token");

                        setUsername("");
                        setPassword("");

                        // ✅ Ensure login modal is closed
                        setOpenLogin(false);

                        handleMenuClose();

                        Swal.fire({
                          icon: "success",
                          title: "Logged out!",
                          background: "linear-gradient(to right, #e6f9e6, #d1f2f9)", // Softer green-cyan gradient
                          color: "#2e7d32",
                          timer: 2000,
                          showConfirmButton: false
                        });

                        setTimeout(() => window.location.reload(), 1000);
                      }
                    });
                  }}
                  style={{
                    background: "linear-gradient(to right,rgba(45, 204, 201, 0.35),rgba(209, 241, 247, 0.4))", // Light green-cyan background

                  }}
                >
                  Logout
                </MenuItem>



              </Menu>
            </div>

          </div>
        ) : (
          <IconButton onClick={() => setOpenLogin(true)} className="text-black transition-transform hover:scale-110">
            <AccountCircleIcon />
          </IconButton>
        )}

        {/* Cart Button */}
        {/* Show cart icon only if the user is logged in */}
        {loggedInUser && (
          <IconButton onClick={() => setCartOpen(true)} className="text-black">
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}



        <IconButton onClick={handleMenuOpen} className="text-black transition-transform hover:scale-110">
          <MenuIcon />
        </IconButton>
      </div>


      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onMouseLeave={handleUserMenuClose} // Close menu when mouse leaves
        MenuListProps={{ onMouseLeave: handleMenuClose }} // Ensures the menu list also triggers closing
        sx={{
          "& .MuiPaper-root": {
            background: "rgba(82, 80, 80, 0.09)",
            backdropFilter: "blur(20px)",
            color: "green",
            border: "1px solid rgba(69, 237, 207, 0.89)",
          },
        }}
      >
        {DropdownItems.map((text) => (
          <MenuItem
            key={text}
            onClick={() => {
              setActiveItem(DropdownItems.indexOf(text));
              const route =
                text.toLowerCase() === "diagnose" ? "/diagnostic" : text.toLowerCase() === "home" ? "/" : `/${text.toLowerCase()}`;
              navigate(route);
              handleMenuClose();
            }}
            className="hover:bg-gray-700 transition"
          >
            {text}
          </MenuItem>
        ))}
      </Menu>

      {/* Login Modal */}
      <Modal open={openLogin} onClose={() => setOpenLogin(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 bg-opacity-60 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-2 border rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" />
          <button onClick={handleLogin} className="w-full bg-green-500 text-black py-2 rounded bg-gradient-to-r from-lime-400 to-green-400 hover:from-green-400 hover:to-lime-400 transition-all duration-300">Login</button>
          <p className="text-center mt-3 text-sm">
            Don't have an account?{" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => { setOpenLogin(false); setOpenSignUp(true); }}>
              Sign up
            </span>
          </p>
        </Box>
      </Modal>

      {/* Welcome Modal */}
      <Modal open={openWelcome} onClose={() => setOpenWelcome(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 text-center bg-opacity-100 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-green-600">Welcome, {loggedInUser}!</h2>
          <p className="text-gray-600 mt-2">You have successfully logged in.</p>
          <button
            onClick={() => {
              setOpenWelcome(false);
              setTimeout(() => window.location.reload(), 300); // Small delay before reload
            }}
            className="mt-4 bg-green-500 text-black py-2 px-4 rounded bg-gradient-to-r from-lime-400 to-green-400 hover:from-green-400 hover:to-lime-400 transition-all duration-300"
          >
            Continue
          </button>
        </Box>
      </Modal>


      {/* Sign Up Modal */}
      <Modal open={openSignUp} onClose={() => setOpenSignUp(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-80 bg-opacity-60 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-2 border rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-2 border rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" />
          <button onClick={handleSignUp} className="w-full bg-green-500 text-black py-2 rounded bg-gradient-to-r from-lime-400 to-green-400 hover:from-green-400 hover:to-lime-400 transition-all duration-300">Sign Up</button>
          <p className="text-center mt-3 text-sm">
            Already have an account?{" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => { setOpenSignUp(false); setOpenLogin(true); }}>
              Login
            </span>
          </p>
        </Box>
      </Modal>
      <Modal open={openOrders} onClose={() => setOpenOrders(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/40 bg-opacity-80 backdrop-blur-lg p-6 rounded-lg shadow-lg w-3/4 max-w-lg max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
          {orders.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto " style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255, 255, 255, 0.3) transparent" }}>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`border p-4 mb-2 rounded-lg shadow ${order.status === "Cancelled"
                    ? "bg-gradient-to-br from-gray-400 to-red-50"
                    : "bg-gradient-to-br from-green-200 to-white/60"

                    }`}
                >

                  <p className="text-lg"><strong>Product:</strong> {order.product_name || order.product?.name}</p>

                  <p className="text-sm"><strong>Name:</strong> {order.name}</p>
                  <p className="text-sm"><strong>Phone:</strong> {order.phone}</p>
                  <p className="text-sm"><strong>Address:</strong> {order.address}</p>
                  <p className="text-sm"><strong>Pincode:</strong> {order.pincode}</p>
                  <p className="text-sm"><strong>Payment Method:</strong> {order.cash_on_delivery ? "Cash on Delivery" : "Online Payment"}</p>
                  <p className="text-sm"><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-lg font-semibold flex justify-between items-center">
                    <strong>Status:</strong>
                    <span className={`${order.status === "Cancelled" ? "text-red-500 font-bold" : ""}`}>
                      {order.status}
                    </span>
                  </p>


                  {order.status !== "Cancelled" && order.status !== "Delivered" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="mt-2 bg-gradient-to-br from-red-500 to-yellow-400 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Go order something first -_-.</p>
          )}
          <button
            onClick={() => setOpenOrders(false)}
            className="mt-4 bg-gradient-to-br from-green-700 to-yellow-400 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </Box>
      </Modal>




      {/* Cart Modal */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

    </nav>
  );
};

export default Navbar;
