import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const role = localStorage.getItem("role");


  return (
    <h1>
  {role === "faculty" ? "Faculty Dashboard" : "Student Dashboard"}
</h1>
  );
};

export default DashboardPage;
