import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminOnlyRoute from "./components/AdminOnlyRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Generate from "./pages/Generate";
import Results from "./pages/Results";
import Performance from "./pages/Performance";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminGenerations from "./pages/AdminGenerations";

function AppContent() {
  const location = useLocation();

  // Hide normal Navbar on admin pages
  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  return (
    <>
      {/* Normal User Navbar */}
      {!isAdminPage && <Navbar />}

      <Routes>

        {/* =========================================
            Public Pages
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =========================================
            Protected User Pages
        ========================================= */}

        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <Generate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            Admin Pages
        ========================================= */}

        <Route
          path="/admin"
          element={
            <AdminOnlyRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminOnlyRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/admin/generations"
          element={
            <AdminOnlyRoute>
              <AdminLayout>
                <AdminGenerations />
              </AdminLayout>
            </AdminOnlyRoute>
          }
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;