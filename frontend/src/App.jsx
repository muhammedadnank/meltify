import "./App.css";
import Login from "./Features/User/Login";
import Register from "./Features/User/Register";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import ProductDetails from "./Features/Scoop/ProductDetails";
import Navbar from "./Components/Common/Navbar";
import { AuthProvider } from "./Components/Context/Authcontext";
import Cart from "./Features/Cart/Cart";
import Orders from "./Pages/Orders";
import { CartProvider } from "./Components/Context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/scoop/:id"  element={<ProductDetails />} />
          <Route path="/cart"       element={<Cart />} />
          <Route path="/orders"     element={<Orders />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
