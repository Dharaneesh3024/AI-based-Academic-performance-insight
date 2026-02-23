import { useState } from "react";
import { signup } from "../services/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css"
const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <select name="role" required onChange={handleChange} defaultValue="">
              <option value="" disabled>Select Your Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <button type="submit">Sign Up</button>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
