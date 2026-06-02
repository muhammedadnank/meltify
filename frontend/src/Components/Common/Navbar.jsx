import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../../api/axiosInstance";
import "./Navbar.css";
import ProfileMenu from "../../Pages/ProfileMenu";
import { useCart } from "../Context/CartContext";

function Navbar() {
  const [query, setQuery] = useState("");
  const [flavours, setFlavours] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { cart } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const flavour = params.get("flavour");

  useEffect(() => {
    axios
      .get("flavours/")
      .then((res) => setFlavours(res.data))
      .catch(console.log);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${query}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">🍦 Meltify</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart" className="cart-link">
          🛒 Cart
          {cart.length > 0 && (
            <span className="cart-badge">{cart.length}</span>
          )}
        </Link>

        <div
          className="category-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          <span onClick={() => setShowDropdown(!showDropdown)}>
            Flavours ▾
          </span>

          {showDropdown && (
            <div className="category-menu">
              <Link
                to="/"
                onClick={() => setShowDropdown(false)}
                className={!flavour ? "active-category" : ""}
              >
                All Flavours
              </Link>
              {flavours.map((f) => (
                <Link
                  key={f.id}
                  to={`/?flavour=${f.id}`}
                  onClick={() => setShowDropdown(false)}
                  className={flavour == f.id ? "active-category" : ""}
                >
                  {f.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search scoops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="nav-right">
        <ProfileMenu />
      </div>
    </nav>
  );
}

export default Navbar;
