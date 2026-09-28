import { Navigate } from "react-router-dom";

const AdminOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Admin access allowed
  return children;
};

export default AdminOnlyRoute;