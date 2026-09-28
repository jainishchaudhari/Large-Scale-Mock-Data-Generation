import { Link, useNavigate } from "react-router-dom";
import logo3 from "../assets/logo3.png";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="h-16 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex h-16 items-center"
        >
          <img
            src={logo3}
            alt="MockGen"
            className="h-15 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 text-sm md:flex">

          <Link
            to="/"
            className="text-slate-300 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-slate-300 transition hover:text-white"
          >
            About
          </Link>

          {token && (
            <>
              <Link
                to="/generate"
                className="text-slate-300 transition hover:text-white"
              >
                Generate
              </Link>

              <Link
                to="/results"
                className="text-slate-300 transition hover:text-white"
              >
                Results
              </Link>

              <Link
                to="/performance"
                className="text-slate-300 transition hover:text-white"
              >
                Performance
              </Link>
            </>
          )}

        </div>

        {/* Authentication */}
        <div className="flex items-center gap-3">

          {token ? (
            <>
              {/* User Profile */}
              <button
                onClick={() => navigate("/profile")}
                title="Open Profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-800"
              >
                {/* User Name */}
                <span className="text-sm text-slate-300 transition hover:text-purple-400">
                  Hi, {user?.name || "User"}
                </span>

                {/* Profile Icon */}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                    />
                  </svg>
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-500 hover:text-red-400"
              >
                Logout
              </button>

              {/* Get Started */}
              <Link
                to="/generate"
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Login
              </Link>

              {/* Sign Up */}
              <Link
                to="/signup"
                className="rounded-lg border border-purple-500 px-4 py-2 text-sm font-semibold text-purple-400 transition hover:bg-purple-500 hover:text-white"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;