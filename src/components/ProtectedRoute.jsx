import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  adminOnly = false,
}) => {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // =============================================
  // Not Logged In
  // =============================================

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // =============================================
  // Admin-Only Route
  // =============================================

  if (
    adminOnly &&
    user?.role !== "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // =============================================
  // Admin Trying To Access Normal User Pages
  // =============================================

  if (
    !adminOnly &&
    user?.role === "admin"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }


  // =============================================
  // Access Allowed
  // =============================================

  return children;
};

export default ProtectedRoute;