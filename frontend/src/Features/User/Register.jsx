import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import "./Register.css";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [RegisterForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    let newErrors = {};
    if (!RegisterForm.username.trim()) newErrors.username = "Username is required";
    if (!RegisterForm.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(RegisterForm.email)) newErrors.email = "Email is invalid";
    if (!RegisterForm.role) newErrors.role = "Please select a role";
    if (!RegisterForm.password) newErrors.password = "Password is required";
    else if (RegisterForm.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!RegisterForm.confirm_password) newErrors.confirm_password = "Please confirm your password";
    else if (RegisterForm.confirm_password !== RegisterForm.password) newErrors.confirm_password = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post("auth/register/", RegisterForm);
      navigate("/login");
    } catch (error) {
      if (error.response?.data) setErrors(error.response.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-logo">🍧</div>
        <h2>Join Meltify</h2>
        <p className="register-sub">Create your account</p>

        <div className="register-grid">
          <div className="field-group">
            <input type="text" name="first_name" placeholder="First Name"
              value={RegisterForm.first_name} onChange={handleChange} />
          </div>
          <div className="field-group">
            <input type="text" name="last_name" placeholder="Last Name"
              value={RegisterForm.last_name} onChange={handleChange} />
          </div>
          <div className="field-group">
            <input type="text" name="username" placeholder="Username"
              value={RegisterForm.username} onChange={handleChange} />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="field-group">
            <input type="email" name="email" placeholder="Email"
              value={RegisterForm.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
        </div>

        {/* Role toggle */}
        <div className="role-section">
          <label className="role-label">I am a...</label>
          <div className="role-toggle">
            {["Customer", "Parlour"].map((r) => (
              <button
                key={r}
                type="button"
                className={`role-btn ${RegisterForm.role === r ? "role-active" : ""}`}
                onClick={() => {
                  setRegisterForm((prev) => ({ ...prev, role: r }));
                  setErrors((prev) => ({ ...prev, role: "" }));
                }}
              >
                {r === "Customer" ? "🛍️ Customer" : "🏪 Parlour Owner"}
              </button>
            ))}
          </div>
          {errors.role && <p className="error">{errors.role}</p>}
        </div>

        <div className="register-grid">
          <div className="field-group">
            <input type="password" name="password" placeholder="Password"
              value={RegisterForm.password} onChange={handleChange} />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="field-group">
            <input type="password" name="confirm_password" placeholder="Confirm Password"
              value={RegisterForm.confirm_password} onChange={handleChange} />
            {errors.confirm_password && <p className="error">{errors.confirm_password}</p>}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account 🍦"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
