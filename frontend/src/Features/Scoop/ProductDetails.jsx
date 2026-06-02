import React, { useEffect, useState } from "react";
import "./ProductDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useCart } from "../../Components/Context/CartContext";
import { useAuth } from "../../Components/Context/Authcontext";
import LoginModal from "../../Components/Common/LoginModal";

function ProductDetails() {
  const { id } = useParams();
  const [scoop, setScoop] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`scoops/${id}/`)
      .then((res) => setScoop(res.data))
      .catch(console.log);
  }, [id]);

  if (!scoop)
    return (
      <div className="details-loading">
        <span>🍦</span>
        <p>Loading scoop details...</p>
      </div>
    );

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-card">
        <div className="details-image">
          <img
            src={
              scoop.images?.length > 0
                ? scoop.images[0].image
                : "https://via.placeholder.com/300x300?text=🍦"
            }
            alt={scoop.name}
          />
        </div>

        <div className="details-info">
          <div className="details-badges">
            {scoop.is_vegan && <span className="badge vegan">🌱 Vegan</span>}
            {scoop.is_sugar_free && <span className="badge sugar-free">🍃 Sugar Free</span>}
            <span className="badge type-badge">🍦 {scoop.scoop_type}</span>
          </div>

          <h2 className="details-title">{scoop.name}</h2>
          <p className="details-flavour">
            Flavour: <strong>{scoop.flavour_details?.name}</strong>
          </p>
          <p className="details-price">₹{scoop.price}</p>
          <p className="details-description">{scoop.description}</p>

          <div className="details-stock">
            <span
              className={`stock-badge ${
                scoop.stock > 5 ? "stock-high" : scoop.stock > 0 ? "stock-low" : "stock-out"
              }`}
            >
              {scoop.stock > 5 ? "In Stock" : scoop.stock > 0 ? `Only ${scoop.stock} left!` : "Sold Out"}
            </span>
          </div>

          <div className="details-buttons">
            <button
              className="details-btn primary"
              disabled={scoop.stock === 0}
              onClick={() => {
                if (!user) setShowLogin(true);
                else addToCart(scoop);
              }}
            >
              Add to Cart 🛒
            </button>
            <button className="details-btn secondary" onClick={() => navigate("/cart")}>
              View Cart 🍦
            </button>
          </div>
        </div>
      </div>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

export default ProductDetails;
