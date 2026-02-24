import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css"
const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send both email and rollNo as the same identifier to the backend
      const loginData = {
        email: formData.identifier,
        rollNo: formData.identifier,
        password: formData.password
      };
      const res = await login(loginData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("rollNo", res.data.rollNo || "");

      alert("Login successful");
      navigate("/dashboard");
    }
    catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="identifier"
            placeholder="Email or Roll Number"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <button type="submit">Login</button>
          <p>
            Don’t have an account? <a href="/signup">Signup</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
