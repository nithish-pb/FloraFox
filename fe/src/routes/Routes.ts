import Home from "../pages/Home/Index";
import About from "../pages/About/Index";
import Diagnostic from "../pages/Diagnostic/Index";
import CropAssistance from "../pages/cropAssistance/index";
import Store from "../pages/store";
import AdminPage from "../pages/adminpages";  // Import the admin page
import Success from "../pages/store/SuccessPage";
import Successmulti from "../pages/store/SuccessPagemul"; // ✅ this must match the export name




const ROUTES = Object.freeze([
    {
        name: "Diagnostic",
        key: "diagnose",
        route: "/diagnostic",
        component: Diagnostic,
        protected: false,
    },
    {
        name: "Home",
        key: "home",
        route: "/",
        component: Home,
        protected: false,
    },
    {
        name: "About",
        key: "about",
        route: "/about",
        component: About,
        protected: false,
    },
    {
        name: "Crop Assistance",  // Add a new route entry
        key: "crop_assistance",
        route: "/crop-assistance",  // Define the path
        component: CropAssistance,  // Reference the CropAssistance component
        protected: false,
    },

    {
        name: "Store",  // ✅ Add Store route here
        key: "store",
        route: "/store",
        component: Store,
        protected: false,
    },
    {
        name: "Admin",
        key: "admin",
        route: "/admin",
        component: AdminPage,
        protected: true,  // You can set this to true if only admins should access it
    },
    {
        name: "Success",
        key: "success",
        route: "/success",
        component: Success,
        protected: false,
    },
    {
        name: "SuccessMulti",
        key: "success-multi",
        route: "/success-multi",
        component: Successmulti, // ✅ this must match the export name
        protected: false,
    }



])

export function findRouteByName(name: string) {
    return ROUTES.find(route => route.key == name)
}

export function findRouteByPath(path: string) {
    return ROUTES.find(route => route.route == path)
}

export default ROUTES