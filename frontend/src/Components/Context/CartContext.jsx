import { createContext, useContext, useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { useAuth } from "./Authcontext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchCart();
    else setCart([]);
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("cart/");
      setCart(res.data.scoops || []);
    } catch {
      setError("Failed to load your cart. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (scoop) => {
    try {
      setError("");
      await axios.post("cart/add/", { scoop_id: scoop.id, quantity: 1 });
      await fetchCart();
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || "Could not add item to cart.");
    }
  };

  const increaseQty = async (itemId) => {
    try {
      setError("");
      await axios.patch(`cart/update/${itemId}/`, { quantity: 1 });
      await fetchCart();
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || "Could not update quantity.");
    }
  };

  const decreaseQty = async (itemId) => {
    try {
      setError("");
      await axios.patch(`cart/update/${itemId}/`, { quantity: -1 });
      await fetchCart();
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || "Could not update quantity.");
    }
  };

  const removeItem = async (itemId) => {
    try {
      setError("");
      await axios.delete(`cart/remove/${itemId}/`);
      await fetchCart();
    } catch {
      setError("Could not remove item.");
    }
  };

  const clearError = () => setError("");

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, loading, error, addToCart, increaseQty, decreaseQty, removeItem, total, clearError, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
