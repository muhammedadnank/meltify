import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Components/Context/Authcontext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }

  function validate() {
    let newErrors = {};
    if (!loginForm.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) newErrors.email = "Email is invalid";
    if (!loginForm.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const loginRes = await axios.post(
        "auth/login/",
        loginForm
      );
      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("refresh", loginRes.data.refresh);

      const profileRes = await axios.get(
        "auth/profile/"
      );
      login(profileRes.data);
      navigate("/");
    } catch {
      setServerError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-bg-emoji">🍦</div>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-logo">🍨</div>
        <h2>Welcome to Meltify</h2>
        <p className="login-sub">Sign in to your scoop account</p>

        {serverError && <p className="error">{serverError}</p>}

        <div className="field-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="field-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In 🍨"}
        </button>

        <p className="register-link">
          New here? <Link to="/register">Create Account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
