import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDetailPage from "./pages/StudentDetailPage";
import FacultyDashboard from "./pages/Facultydashboard";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Role decision route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "faculty"]}>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        {/* Student dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty dashboard */}
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/faculty/student/:id"
  element={
    <ProtectedRoute allowedRoles={["faculty"]}>
      <StudentDetailPage />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
