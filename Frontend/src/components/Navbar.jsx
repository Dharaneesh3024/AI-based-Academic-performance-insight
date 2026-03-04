import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  const showBackButton = location.pathname.includes("/student/");
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showBackButton && (
          <button
            className="nav-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        )}
        <h2>AI Academic Insights</h2>
      </div>

      <div className="navbar-right">
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
