import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Admin is locked inside Admin Panel
  if (token && user?.role === "admin") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return children;
};

export default PublicRoute;