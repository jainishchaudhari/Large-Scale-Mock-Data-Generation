import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch admin statistics"
        );
      }

      setStats(data.stats);
    } catch (error) {
      console.error("Admin Dashboard Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: "U",
    },
    {
      title: "Total Generations",
      value: stats?.totalGenerations ?? 0,
      icon: "G",
    },
    {
      title: "Total Records",
      value: stats?.totalRecords ?? 0,
      icon: "R",
    },
    {
      title: "Batch Generations",
      value: stats?.batchGenerations ?? 0,
      icon: "B",
    },
    {
      title: "Streaming Generations",
      value: stats?.streamingGenerations ?? 0,
      icon: "S",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0d10] text-white">

      {/* Admin Header */}
      <div className="border-b border-red-500/20 bg-[#0f1217]">
        <div className="mx-auto max-w-7xl px-6 py-5">

          <div>
            <div className="mb-1 flex items-center gap-3">

              <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold tracking-wider text-red-400">
                ADMIN PANEL
              </span>

              <span className="text-xs text-slate-500">
                MockGen System Management
              </span>

            </div>

            <h1 className="text-2xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Monitor users, generations and system activity.
            </p>
          </div>

        </div>
      </div>

      {/* Dashboard */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-[#11151b] p-8 text-center text-slate-400">
            Loading admin statistics...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && (
          <>

            {/* =========================================
                Statistics
            ========================================= */}

            <div className="mb-8">

              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  System Overview
                </h2>

                <p className="text-sm text-slate-500">
                  Current MockGen platform statistics
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                {statCards.map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-xl border border-slate-800 bg-[#11151b] p-5 transition hover:border-red-500/40"
                  >

                    <div className="mb-5 flex items-center justify-between">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-sm font-bold text-red-400">
                        {card.icon}
                      </div>

                    </div>

                    <p className="text-sm text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {card.value.toLocaleString()}
                    </p>

                  </div>
                ))}

              </div>

            </div>


            {/* =========================================
                Admin Modules
            ========================================= */}

            <div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Management
                </h2>

                <p className="text-sm text-slate-500">
                  Manage MockGen platform data
                </p>
              </div>


              <div className="grid gap-4 md:grid-cols-2">

                {/* =====================================
                    Users
                ===================================== */}

                <button
                  onClick={() => navigate("/admin/users")}
                  className="group rounded-xl border border-slate-800 bg-[#11151b] p-6 text-left transition hover:border-red-500/40 hover:bg-[#14191f]"
                >

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 font-bold text-red-400">
                    U
                  </div>

                  <h3 className="text-base font-semibold">
                    User Management
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    View and monitor registered MockGen users.
                  </p>

                  <span className="mt-5 inline-block text-sm font-medium text-red-400 transition group-hover:text-red-300">
                    Manage Users →
                  </span>

                </button>


                {/* =====================================
                    Generations
                ===================================== */}

                <button
                  onClick={() =>
                    navigate("/admin/generations")
                  }
                  className="group rounded-xl border border-slate-800 bg-[#11151b] p-6 text-left transition hover:border-red-500/40 hover:bg-[#14191f]"
                >

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 font-bold text-red-400">
                    G
                  </div>

                  <h3 className="text-base font-semibold">
                    Generation Monitoring
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Monitor generation activity across all users.
                  </p>

                  <span className="mt-5 inline-block text-sm font-medium text-red-400 transition group-hover:text-red-300">
                    View Generations →
                  </span>

                </button>

              </div>

            </div>

          </>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;