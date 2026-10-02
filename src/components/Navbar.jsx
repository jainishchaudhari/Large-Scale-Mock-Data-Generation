import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoMark from "../assets/logo.svg";

// Same font setup as HomeV2 (move this to index.css once and delete it from both files)
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap');
.font-display{font-family:'Bricolage Grotesque',system-ui,-apple-system,'Segoe UI',sans-serif}
`;

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10]";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = readUser();
  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    ...(token
      ? [
          { to: "/generate", label: "Generate" },
          { to: "/results", label: "Results" },
          { to: "/performance", label: "Performance" },
        ]
      : []),
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu when the route changes
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/login");
  };

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header
      className={`font-display sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-[#080a10]/80 backdrop-blur-xl"
          : "border-transparent bg-[#080a10]"
      }`}
    >
      <style>{css}</style>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ---------- Logo ---------- */}
        <Link to="/" className={`group flex h-16 items-center gap-2.5 rounded-md ${focusRing}`}>
          <img
            src={logoMark}
            alt="MockGen logo"
            className="h-9 w-9 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Mock<span className="text-amber-300">Gen</span>
          </span>
        </Link>

        {/* ---------- Desktop links ---------- */}
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                isActive(l.to) ? "text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive(l.to) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </NavLink>
          ))}
        </div>

        {/* ---------- Desktop auth ---------- */}
        <div className="hidden items-center gap-3 md:flex">
          {token ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                title="Open profile"
                className={`group flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 transition hover:bg-white/5 ${focusRing}`}
              >
                <span className="text-sm text-slate-300 transition group-hover:text-white">
                  Hi, {user?.name || "User"}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-sky-300 text-sm font-bold text-slate-950 ring-2 ring-transparent transition group-hover:ring-white/20">
                  {initial}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 ${focusRing}`}
              >
                Logout
              </button>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/generate"
                  className={`block rounded-lg bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-200 ${focusRing}`}
                >
                  Get started
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white ${focusRing}`}
              >
                Login
              </Link>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signup"
                  className={`block rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 ${focusRing}`}
                >
                  Sign up
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* ---------- Mobile toggle ---------- */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 md:hidden ${focusRing}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <motion.path animate={open ? { d: "M6 6l12 12" } : { d: "M4 7h16" }} />
            <motion.path animate={{ opacity: open ? 0 : 1 }} d="M4 12h16" />
            <motion.path animate={open ? { d: "M6 18L18 6" } : { d: "M4 17h16" }} />
          </svg>
        </button>
      </nav>

      {/* ---------- Mobile panel ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-[#080a10]/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    to={l.to}
                    className={`block rounded-lg px-4 py-3 text-base font-medium transition ${
                      isActive(l.to)
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                {token ? (
                  <>
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-slate-300 hover:bg-white/5"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-sky-300 text-sm font-bold text-slate-950">
                        {initial}
                      </span>
                      Hi, {user?.name || "User"}
                    </button>
                    <Link to="/generate" className="rounded-lg bg-amber-300 py-3 text-center font-semibold text-slate-950">
                      Get started
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-lg border border-white/10 py-3 font-medium text-slate-300 hover:border-red-400/40 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="rounded-lg bg-white py-3 text-center font-semibold text-slate-950">
                      Sign up
                    </Link>
                    <Link to="/login" className="rounded-lg border border-white/10 py-3 text-center font-medium text-slate-300">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;