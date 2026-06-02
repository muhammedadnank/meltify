import React, { useState } from "react";
import { useCart } from "../../Components/Context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import "./Cart.css";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Digital Wallet" },
];

function CheckoutModal({ total, onClose, onSuccess }) {
  const [form, setForm] = useState({
    delivery_address: "",
    phone_number: "",
    delivery_notes: "",
    payment_method: "cod",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
  }

  function validate() {
    const errs = {};
    if (form.delivery_address.trim().length < 10)
      errs.delivery_address = "Address must be at least 10 characters";
    if (!/^\d{10,}$/.test(form.phone_number))
      errs.phone_number = "Enter a valid 10-digit phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await axios.post("orders/checkout/", form);
      onSuccess(res.data.order);
    } catch (err) {
      const data = err.response?.data;
      setServerError(data?.error || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">🍦 Checkout</h3>
        <div className="modal-total">
          Order total: <span>₹{parseFloat(total).toFixed(2)}</span>
        </div>
        {serverError && <p className="modal-error">{serverError}</p>}
        <div className="field-group">
          <label>Delivery address</label>
          <textarea
            name="delivery_address"
            rows={3}
            placeholder="Full address with pincode"
            value={form.delivery_address}
            onChange={handleChange}
          />
          {errors.delivery_address && (
            <p className="field-error">{errors.delivery_address}</p>
          )}
        </div>
        <div className="field-group">
          <label>Phone number</label>
          <input
            type="tel"
            name="phone_number"
            placeholder="10-digit mobile number"
            value={form.phone_number}
            onChange={handleChange}
          />
          {errors.phone_number && (
            <p className="field-error">{errors.phone_number}</p>
          )}
        </div>
        <div className="field-group">
          <label>Payment method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>Delivery notes (optional)</label>
          <input
            type="text"
            name="delivery_notes"
            placeholder="Ring the bell, leave at door…"
            value={form.delivery_notes}
            onChange={handleChange}
          />
        </div>
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="modal-confirm-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Placing order…" : "Place order 🍦"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box success-box" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">🎉</div>
        <h3 className="modal-title">Order placed!</h3>
        <p className="success-number">#{order.order_number}</p>
        <p className="success-sub">
          We've received your order and will start preparing it soon.
        </p>
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose}>
            Continue shopping
          </button>
          <button
            className="modal-confirm-btn"
            onClick={() => navigate("/orders")}
          >
            View my orders
          </button>
        </div>
      </div>
    </div>
  );
}

function Cart() {
  const { cart, loading, error, increaseQty, decreaseQty, removeItem, total } =
    useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (loading)
    return (
      <div className="cart-loading">
        <span>🛒</span>
        <p>Loading your FrostyCart...</p>
      </div>
    );

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Your FrostyCart</h2>

      {error && <p className="cart-error">{error}</p>}

      {cart.length === 0 ? (
        <div className="cart-empty">
          <span>🍦</span>
          <p>Your cart is empty</p>
          <button onClick={() => navigate("/")}>Browse Scoops</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-image">
                  <img
                    src={
                      item.scoop_images?.length > 0
                        ? item.scoop_images[0].image
                        : "https://via.placeholder.com/80x80?text=🍦"
                    }
                    alt={item.scoop_name}
                  />
                </div>
                <div className="cart-info">
                  <h4>{item.scoop_name}</h4>
                  <p className="cart-meta">
                    {item.scoop_flavour} · {item.scoop_type}
                  </p>
                  <p className="cart-unit-price">₹{item.unit_price} each</p>
                </div>
                <div className="cart-controls">
                  <button onClick={() => decreaseQty(item.id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>
                <div className="cart-right">
                  <p className="cart-subtotal">₹{item.total_price}</p>
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="total-price">₹{parseFloat(total).toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={() => setShowCheckout(true)}>
              Proceed to Checkout 🍦
            </button>
          </div>
        </>
      )}

      {showCheckout && !placedOrder && (
        <CheckoutModal
          total={total}
          onClose={() => setShowCheckout(false)}
          onSuccess={(order) => {
            setShowCheckout(false);
            setPlacedOrder(order);
          }}
        />
      )}

      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
        />
      )}
    </div>
  );
}

export default Cart;
