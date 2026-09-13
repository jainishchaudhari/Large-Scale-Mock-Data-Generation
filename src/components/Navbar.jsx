import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
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
        </div>

        {/* Button */}
        <Link
          to="/generate"
          className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Get Started
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;