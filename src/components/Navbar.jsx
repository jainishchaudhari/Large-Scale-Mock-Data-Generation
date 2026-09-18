import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-white"
        >
          Mock<span className="text-purple-500">Gen</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 text-sm md:flex">

          <Link
            to="/"
            className="text-slate-300 transition hover:text-white"
          >
            Home
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
              {/* User Name */}
              <span className="hidden text-sm text-slate-300 sm:block">
                Hi, {user?.name}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-500 hover:text-red-400"
              >
                Logout
              </button>

              {/* Generate */}
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