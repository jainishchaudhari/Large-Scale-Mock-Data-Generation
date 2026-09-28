import { useEffect, useState } from "react";

const AdminGenerations = () => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGenerations = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/generations",
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
            "Failed to fetch generation history"
        );
      }

      setGenerations(data.generations || []);
    } catch (error) {
      console.error(
        "Admin Generations Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  return (
    <div className="min-h-full bg-[#0b0d10] text-white">

      {/* ==============================
          Header
      ============================== */}

      <div className="border-b border-red-500/20 bg-[#0f1217]">
        <div className="px-6 py-6">

          <div className="mb-2 flex items-center gap-3">

            <span className="rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold tracking-wider text-red-400">
              ADMIN PANEL
            </span>

            <span className="text-xs text-slate-500">
              Generation Monitoring
            </span>

          </div>

          <h1 className="text-2xl font-bold">
            Generation Activity
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor mock data generation activity across
            all users.
          </p>

        </div>
      </div>


      {/* ==============================
          Content
      ============================== */}

      <main className="p-6">

        {/* Loading */}

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-[#11151b] p-8 text-center text-slate-400">
            Loading generation activity...
          </div>
        )}


        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
            {error}
          </div>
        )}


        {/* Data */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#11151b]">

            {/* Table Header */}

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div>

                <h2 className="font-semibold">
                  Generation History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {generations.length.toLocaleString()}{" "}
                  generation records found
                </p>

              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400">
                {generations.length} Runs
              </div>

            </div>


            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead className="border-b border-slate-800 bg-[#0d1014]">

                  <tr>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Records
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Method
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Format
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Generation Time
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Memory
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-800">

                  {generations.map(
                    (generation, index) => {

                      const user =
                        generation.userId;

                      return (
                        <tr
                          key={generation._id}
                          className="transition hover:bg-slate-800/30"
                        >

                          {/* Number */}

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>


                          {/* User */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400">
                                {user?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "U"}
                              </div>

                              <div>

                                <p className="text-sm font-medium text-slate-200">
                                  {user?.name ||
                                    "Unknown User"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {user?.email ||
                                    "No email"}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Records */}

                          <td className="px-5 py-4 text-sm font-medium text-slate-200">
                            {(
                              generation.records ||
                              0
                            ).toLocaleString()}
                          </td>


                          {/* Method */}

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                generation.method ===
                                "Streaming"
                                  ? "border border-blue-500/30 bg-blue-500/10 text-blue-400"
                                  : "border border-purple-500/30 bg-purple-500/10 text-purple-400"
                              }`}
                            >
                              {generation.method ||
                                "-"}
                            </span>

                          </td>


                          {/* Format */}

                          <td className="px-5 py-4">

                            <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-400">
                              {generation.outputFormat ||
                                generation.format ||
                                "-"}
                            </span>

                          </td>


                          {/* Generation Time */}

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {generation.generationTime !=
                            null
                              ? `${generation.generationTime} ms`
                              : "-"}
                          </td>


                          {/* Memory */}

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {generation.memoryUsed !=
                            null
                              ? `${generation.memoryUsed} MB`
                              : "-"}
                          </td>


                          {/* Date */}

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {generation.createdAt
                              ? new Date(
                                  generation.createdAt
                                ).toLocaleString()
                              : "-"}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* Empty State */}

            {generations.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No generation activity found.
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default AdminGenerations;