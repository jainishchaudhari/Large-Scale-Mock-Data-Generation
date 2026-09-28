import { NavLink, useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-red-500/20 bg-red-500/10 text-red-400"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-[#0b0d10] text-white">

      {/* =========================================
          Admin Sidebar
      ========================================= */}

      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0f1217] md:flex md:flex-col">

        {/* Admin Brand */}
        <div className="border-b border-slate-800 px-5 py-6">

          <div className="text-lg font-bold tracking-tight">
            MOCK<span className="text-red-400">GEN</span>
          </div>

          <div className="mt-2 inline-flex rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-red-400">
            ADMIN PANEL
          </div>

        </div>


        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Management
          </p>


          {/* Dashboard */}
          <NavLink
            to="/admin"
            end
            className={navClass}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-xs">
              D
            </span>

            Dashboard
          </NavLink>


          {/* Users */}
          <NavLink
            to="/admin/users"
            className={navClass}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-xs">
              U
            </span>

            Users
          </NavLink>


          {/* Generations */}
          <NavLink
            to="/admin/generations"
            className={navClass}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-xs">
              G
            </span>

            Generations
          </NavLink>

        </nav>


        {/* =========================================
            Logout
        ========================================= */}

        <div className="border-t border-slate-800 p-4">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >

            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-xs">
              ↪
            </span>

            Logout

          </button>

        </div>

      </aside>


      {/* =========================================
          Main Admin Content
      ========================================= */}

      <main className="min-w-0 flex-1">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;