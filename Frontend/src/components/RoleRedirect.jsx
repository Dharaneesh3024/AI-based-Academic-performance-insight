import { Navigate } from "react-router-dom";

const RoleRedirect = () => {
  const role = localStorage.getItem("role");

  if (role === "faculty") {
    return <Navigate to="/faculty/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

export default RoleRedirect;
