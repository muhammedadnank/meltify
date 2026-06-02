import axios from "../../api/axiosInstance";
import React, { useEffect, useState } from "react";
import "./Product.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Components/Context/CartContext";
import { useAuth } from "../../Components/Context/Authcontext";
import LoginModal from "../../Components/Common/LoginModal";

function Product() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const flavour = params.get("flavour");
  const search = params.get("search");

  useEffect(() => {
    const fetchScoops = async () => {
      try {
        setLoading(true);
        let url = "scoops/";
        if (flavour) url += `?flavour=${flavour}`;
        const res = await axios.get(url);
        const scoops = res.data.results || res.data;
        const filtered = search
          ? scoops.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
          : scoops;
        setData(filtered);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchScoops();
  }, [flavour, search]);

  if (loading)
    return (
      <div className="loading-screen">
        <span className="loading-emoji">🍦</span>
        <p>Scooping your ice creams...</p>
      </div>
    );

  return (
    <div className="product-container">
      {search && (
        <p className="search-label">
          Results for <strong>"{search}"</strong> — {data.length} found
        </p>
      )}

      <div className="product-flex">
        {data.length === 0 ? (
          <div className="empty-state">
            <span>🍦</span>
            <p>No scoops found</p>
          </div>
        ) : (
          data.map((item) => (
            <div className="product-card" key={item.id}>
              {/* IMAGE */}
              <div className="image-wrapper">
                <img
                  src={
                    item.images?.length > 0
                      ? item.images[0].image
                      : "https://via.placeholder.com/200x200?text=🍦"
                  }
                  alt={item.name}
                />
                {item.is_vegan && <span className="badge vegan">🌱 Vegan</span>}
                {item.is_sugar_free && <span className="badge sugar-free">🍃 Sugar Free</span>}
              </div>

              {/* RIGHT */}
              <div className="right-section">
                <div className="top-row">
                  <div className="product-info">
                    <h3 className="product-name">{item.name}</h3>
                    <p className="product-flavour">
                      {item.flavour_details?.name} · {item.scoop_type}
                    </p>

                    <div className="stock-wrapper">
                      <span
                        className={`stock-badge ${
                          item.stock > 5
                            ? "stock-high"
                            : item.stock > 0
                            ? "stock-low"
                            : "stock-out"
                        }`}
                      >
                        {item.stock > 5
                          ? "In Stock"
                          : item.stock > 0
                          ? `Only ${item.stock} left!`
                          : "Sold Out"}
                      </span>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="add-btn"
                      disabled={item.stock === 0}
                      onClick={() => {
                        if (!user) setShowLogin(true);
                        else addToCart(item);
                      }}
                    >
                      {item.stock === 0 ? "Sold Out" : "Add to Cart 🛒"}
                    </button>

                    <button
                      className="view-btn"
                      onClick={() => navigate(`/scoop/${item.id}`)}
                    >
                      View Details
                    </button>

                    <p className="product-price">₹{item.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

export default Product;
