import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch profile"
          );
        }

        setProfile(data);
      } catch (error) {
        console.error(
          "Profile Fetch Error:",
          error
        );

        setError(
          error.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ===========================================
  // Logout
  // ===========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ===========================================
  // Loading
  // ===========================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-24">
          <p className="text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ===========================================
  // Error
  // ===========================================

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-400">
              Unable to load profile
            </h2>

            <p className="text-sm text-slate-300">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = profile?.user;
  const stats = profile?.stats;

  // ===========================================
  // Format Joined Date
  // ===========================================

  const joinedDate = user?.createdAt
    ? new Date(
        user.createdAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // ===========================================
  // Profile UI
  // ===========================================

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-400">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your account information and
            generation activity.
          </p>
        </div>

        {/* Profile Information */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          {/* User Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <div className="mb-6 flex items-center gap-4">

              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/20 text-2xl font-bold text-purple-400 ring-1 ring-purple-500/30">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.name || "User"}
                </h2>

                <p className="text-sm text-slate-400">
                  MockGen User
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-5">

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Full Name
                </p>

                <p className="text-sm text-slate-200">
                  {user?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email Address
                </p>

                <p className="text-sm text-slate-200">
                  {user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Account Created
                </p>

                <p className="text-sm text-slate-200">
                  {joinedDate}
                </p>
              </div>

            </div>
          </div>

          {/* Account Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-2 text-lg font-semibold">
              Account
            </h2>

            <p className="mb-6 text-sm leading-6 text-slate-400">
              Manage your current session and
              account access.
            </p>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              Logout
            </button>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">

          <h2 className="mb-5 text-xl font-semibold">
            Generation Statistics
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Generations */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total Generations
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-400">
                {(
                  stats?.totalGenerations || 0
                ).toLocaleString()}
              </p>
            </div>

            {/* Total Records */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total Records
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-400">
                {(
                  stats?.totalRecords || 0
                ).toLocaleString()}
              </p>
            </div>

            {/* Batch */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Batch Generations
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-400">
                {(
                  stats?.batchGenerations || 0
                ).toLocaleString()}
              </p>
            </div>

            {/* Streaming */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Streaming Generations
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-400">
                {(
                  stats?.streamingGenerations || 0
                ).toLocaleString()}
              </p>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-2 text-xl font-semibold">
            Quick Actions
          </h2>

          <p className="mb-6 text-sm text-slate-400">
            Continue working with MockGen.
          </p>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate("/generate")
              }
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Generate Data
            </button>

            <button
              onClick={() =>
                navigate("/results")
              }
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-purple-500/50 hover:bg-slate-700"
            >
              View Results
            </button>

            <button
              onClick={() =>
                navigate("/performance")
              }
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-purple-500/50 hover:bg-slate-700"
            >
              Performance
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;