import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const role = localStorage.getItem("role");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  const rootPaths = ["/student/dashboard", "/faculty/dashboard", "/dashboard", "/login", "/signup", "/"];
  const showBackButton = !rootPaths.includes(location.pathname);
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showBackButton && (
          <button
            className="nav-back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
        )}
        <h2>AI Insights</h2>
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-right ${isMobileMenuOpen ? "active" : ""}`}>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="role-badge">
          {role === "faculty" ? "Faculty" : "Student"}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
