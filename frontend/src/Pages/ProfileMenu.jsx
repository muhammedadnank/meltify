import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Components/Context/Authcontext";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <div className="profile-container" ref={menuRef}>
      <div
        className="profile-icon"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        {user ? (user.username || "U")[0].toUpperCase() : "👤"}
      </div>

      {open && (
        <div className="profile-dropdown">
          {user ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar-lg">
                  {(user.username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="username">Hi, {user.username}!</p>
                  <p className="user-role">
                    {user.role === "Parlour" ? "🏪 Parlour Owner" : "🛍️ Customer"}
                  </p>
                </div>
              </div>

              <div className="profile-divider" />

              <button onClick={() => { setOpen(false); navigate("/"); }}>🏠 Home</button>
              <button onClick={() => { setOpen(false); navigate("/cart"); }}>🛒 My Cart</button>
              <button onClick={() => { setOpen(false); navigate("/orders"); }}>🧾 My Orders</button>

              <div className="profile-divider" />

              <button className="logout" onClick={handleLogout}>🚪 Sign Out</button>
            </>
          ) : (
            <>
              <p className="guest-text">Welcome, Guest! 🍦</p>
              <button onClick={() => { setOpen(false); navigate("/login"); }}>Sign In</button>
              <button onClick={() => { setOpen(false); navigate("/register"); }}>Create Account</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
