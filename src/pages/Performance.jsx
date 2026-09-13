import Navbar from "../components/Navbar";

const Performance = () => {
  const performanceData = [
    {
      size: "1,000",
      batchTime: "120 ms",
      streamingTime: "145 ms",
      batchMemory: "18 MB",
      streamingMemory: "11 MB",
    },
    {
      size: "10,000",
      batchTime: "580 ms",
      streamingTime: "620 ms",
      batchMemory: "42 MB",
      streamingMemory: "16 MB",
    },
    {
      size: "100,000",
      batchTime: "4.8 s",
      streamingTime: "5.1 s",
      batchMemory: "185 MB",
      streamingMemory: "28 MB",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-12">

        <div className="mx-auto max-w-7xl">

          {/* Page Header */}
          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
              Performance Analysis
            </p>

            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Generation Performance
            </h1>

            <p className="mt-4 max-w-3xl text-slate-400">
              Compare batch and streaming approaches for large-scale
              JSON mock data generation.
            </p>

          </div>


          {/* ================= Summary Cards ================= */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Dataset Size */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Largest Dataset
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                100K
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Records tested
              </p>

            </div>


            {/* Batch Time */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Batch Time
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                4.8 s
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                For 100K records
              </p>

            </div>


            {/* Streaming Time */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Streaming Time
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                5.1 s
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                For 100K records
              </p>

            </div>


            {/* Memory */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Streaming Memory
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                28 MB
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                For 100K records
              </p>

            </div>

          </div>


          {/* ================= Comparison ================= */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Batch vs Streaming
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Performance comparison across different dataset sizes.
              </p>

            </div>


            {/* Table */}
            <div className="overflow-x-auto">

              <table className="w-full min-w-175 text-left">

                <thead>
                  <tr className="border-b border-slate-800 text-sm text-slate-400">

                    <th className="px-4 py-4 font-medium">
                      Dataset
                    </th>

                    <th className="px-4 py-4 font-medium">
                      Batch Time
                    </th>

                    <th className="px-4 py-4 font-medium">
                      Streaming Time
                    </th>

                    <th className="px-4 py-4 font-medium">
                      Batch Memory
                    </th>

                    <th className="px-4 py-4 font-medium">
                      Streaming Memory
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {performanceData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-800 last:border-0"
                    >

                      <td className="px-4 py-5 font-semibold">
                        {item.size}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.batchTime}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.streamingTime}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.batchMemory}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {item.streamingMemory}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* ================= Performance Cards ================= */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2">

            {/* Batch */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Batch Generation
                </h2>

                <span className="rounded-md bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                  Batch
                </span>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Batch generation creates multiple records in memory
                before producing the final output.
              </p>


              <div className="mt-6 space-y-4">

                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">
                    Generation Speed
                  </span>

                  <span className="text-sm font-semibold">
                    High
                  </span>
                </div>


                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">
                    Memory Usage
                  </span>

                  <span className="text-sm font-semibold">
                    High
                  </span>
                </div>


                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    Suitable For
                  </span>

                  <span className="text-sm font-semibold">
                    Smaller datasets
                  </span>
                </div>

              </div>

            </div>


            {/* Streaming */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Streaming Generation
                </h2>

                <span className="rounded-md bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                  Streaming
                </span>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Streaming generates and writes records progressively,
                reducing the amount of data held in memory.
              </p>


              <div className="mt-6 space-y-4">

                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">
                    Generation Speed
                  </span>

                  <span className="text-sm font-semibold">
                    Moderate
                  </span>
                </div>


                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">
                    Memory Usage
                  </span>

                  <span className="text-sm font-semibold">
                    Low
                  </span>
                </div>


                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">
                    Suitable For
                  </span>

                  <span className="text-sm font-semibold">
                    Large datasets
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* ================= Research Note ================= */}
          <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

            <div className="flex gap-3">

              <span className="text-purple-400">
                ℹ
              </span>

              <p className="text-sm leading-6 text-slate-400">

                <span className="font-semibold text-purple-400">
                  Research Note:
                </span>{" "}

                These values are sample performance data for the
                frontend prototype. Actual execution time, memory
                usage and throughput will be measured using the
                Node.js backend during experimentation.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Performance;