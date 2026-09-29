import { useEffect, useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] =
    useState("");

  // =============================================
  // Fetch Users
  // =============================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch users"
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "Admin Users Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // =============================================
  // Change User Role
  // =============================================

  const handleRoleChange = async (
    userId,
    currentRole,
    userName
  ) => {
    const newRole =
      currentRole === "admin"
        ? "user"
        : "admin";

    const confirmed = window.confirm(
      `Are you sure you want to make ${userName} a ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `role-${userId}`
      );

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update user role"
        );
      }

      // Update local user list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user
        )
      );
    } catch (error) {
      console.error(
        "Role Update Error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading("");
    }
  };


  // =============================================
  // Delete User
  // =============================================

  const handleDeleteUser = async (
    userId,
    userName
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?\n\nThis will also delete all generation history associated with this user.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `delete-${userId}`
      );

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user"
        );
      }

      // Remove user from UI
      setUsers((prevUsers) =>
        prevUsers.filter(
          (user) =>
            user._id !== userId
        )
      );
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      alert(error.message);
    } finally {
      setActionLoading("");
    }
  };


  // =============================================
  // Render
  // =============================================

  return (
    <div className="min-h-full bg-[#0b0d10] text-white">

      {/* =========================================
          Header
      ========================================= */}

      <div className="border-b border-red-500/20 bg-[#0f1217]">

        <div className="px-6 py-6">

          <div className="mb-2 flex items-center gap-3">

            <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold tracking-wider text-red-400">
              ADMIN PANEL
            </span>

            <span className="text-xs text-slate-500">
              User Management
            </span>

          </div>

          <h1 className="text-2xl font-bold">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            View and manage registered MockGen
            users.
          </p>

        </div>

      </div>


      {/* =========================================
          Content
      ========================================= */}

      <main className="p-6">

        {/* Loading */}

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-[#11151b] p-8 text-center text-slate-400">
            Loading users...
          </div>
        )}


        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* Users */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#11151b]">

            {/* =====================================
                Table Header
            ===================================== */}

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div>

                <h2 className="font-semibold">
                  Registered Users
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {users.length.toLocaleString()}{" "}
                  users found
                </p>

              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400">
                {users.length} Users
              </div>

            </div>


            {/* =====================================
                Table
            ===================================== */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px] text-left">

                <thead className="border-b border-slate-800 bg-[#0d1014]">

                  <tr>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Name
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-800">

                  {users.map(
                    (user, index) => {

                      const isActionLoading =
                        actionLoading.includes(
                          user._id
                        );

                      const isAdmin =
                        user.role ===
                        "admin";

                      return (
                        <tr
                          key={user._id}
                          className="transition hover:bg-slate-800/30"
                        >

                          {/* Number */}

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>


                          {/* Name */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400">
                                {user.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </div>

                              <span className="text-sm font-medium text-slate-200">
                                {user.name}
                              </span>

                            </div>

                          </td>


                          {/* Email */}

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {user.email}
                          </td>


                          {/* Role */}

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isAdmin
                                  ? "border border-red-500/30 bg-red-500/10 text-red-400"
                                  : "border border-slate-700 bg-slate-800/60 text-slate-400"
                              }`}
                            >
                              {user.role}
                            </span>

                          </td>


                          {/* Joined */}

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {user.createdAt
                              ? new Date(
                                  user.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </td>


                          {/* Actions */}

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              {/* Make Admin / Make User */}

                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    user._id,
                                    user.role,
                                    user.name
                                  )
                                }
                                disabled={
                                  isActionLoading
                                }
                                className={`rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  isAdmin
                                    ? "border-slate-700 text-slate-400 hover:border-purple-500/40 hover:text-purple-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                }`}
                              >
                                {actionLoading ===
                                `role-${user._id}`
                                  ? "Updating..."
                                  : isAdmin
                                  ? "Make User"
                                  : "Make Admin"}
                              </button>


                              {/* Delete */}

                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    user._id,
                                    user.name
                                  )
                                }
                                disabled={
                                  isActionLoading
                                }
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading ===
                                `delete-${user._id}`
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =====================================
                Empty State
            ===================================== */}

            {users.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No users found.
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};

export default AdminUsers;