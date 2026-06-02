import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

const STATUS_COLORS = {
  pending:    { bg: "#fff8e1", color: "#f57f17" },
  confirmed:  { bg: "#e3f2fd", color: "#1565c0" },
  processing: { bg: "#e8f5e9", color: "#2e7d32" },
  shipped:    { bg: "#f3e5f5", color: "#6a1b9a" },
  delivered:  { bg: "#e8f5e9", color: "#1b5e20" },
  cancelled:  { bg: "#fdecea", color: "#c62828" },
};

function StatusBadge({ value }) {
  const style = STATUS_COLORS[value] || { bg: "#f5f5f5", color: "#444" };
  return (
    <span
      className="order-status-badge"
      style={{ background: style.bg, color: style.color }}
    >
      {value}
    </span>
  );
}

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetail = async () => {
    if (detail) { setExpanded((p) => !p); return; }
    setLoadingDetail(true);
    try {
      const res = await axios.get(`orders/${order.id}/`);
      setDetail(res.data);
      setExpanded(true);
    } catch {
      // silently fail — user can retry by clicking again
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await axios.post(`orders/${order.id}/cancel/`);
      onCancel(order.id);
    } catch (err) {
      alert(err.response?.data?.error || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={fetchDetail}>
        <div className="order-card-left">
          <p className="order-number">#{order.order_number}</p>
          <p className="order-date">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <div className="order-card-right">
          <StatusBadge value={order.status} />
          <p className="order-amount">₹{parseFloat(order.final_amount).toFixed(2)}</p>
          <p className="order-items-count">{order.item_count} item{order.item_count !== 1 ? "s" : ""}</p>
        </div>
        <span className="order-expand">{loadingDetail ? "…" : expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && detail && (
        <div className="order-detail">
          <div className="order-items-list">
            {detail.items.map((item) => (
              <div className="order-item-row" key={item.id}>
                <span className="oi-name">{item.scoop_name}</span>
                <span className="oi-meta">{item.flavour_name} · {item.scoop_type}</span>
                <span className="oi-qty">×{item.quantity}</span>
                <span className="oi-price">₹{parseFloat(item.total_price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="order-detail-footer">
            <div className="order-detail-info">
              <p><strong>Address:</strong> {detail.delivery_address}</p>
              <p><strong>Phone:</strong> {detail.phone_number}</p>
              {detail.delivery_notes && (
                <p><strong>Notes:</strong> {detail.delivery_notes}</p>
              )}
              <p>
                <strong>Payment:</strong> {detail.payment?.payment_method?.toUpperCase()} —{" "}
                <StatusBadge value={detail.payment_status} />
              </p>
            </div>

            {order.status === "pending" && (
              <button
                className="cancel-order-btn"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel order"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("orders/")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );
  };

  if (loading)
    return (
      <div className="orders-loading">
        <span>🍦</span>
        <p>Loading your orders…</p>
      </div>
    );

  return (
    <div className="orders-container">
      <h2 className="orders-title">🧾 My Orders</h2>

      {error && <p className="orders-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="orders-empty">
          <span>🍦</span>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")}>Start shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
