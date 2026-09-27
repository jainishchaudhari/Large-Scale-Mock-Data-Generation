import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const benchmarkData = [
  {
    size: 1000,
    dataset: "1K",
    batchTime: 48.66,
    streamingTime: 103.92,
    batchMemory: 3.01,
    streamingMemory: 0.54,
    batchThroughput: 20552,
    streamingThroughput: 9623,
  },
  {
    size: 10000,
    dataset: "10K",
    batchTime: 454.92,
    streamingTime: 527.39,
    batchMemory: 17.17,
    streamingMemory: 0.98,
    batchThroughput: 21982,
    streamingThroughput: 18961,
  },
  {
    size: 100000,
    dataset: "100K",
    batchTime: 6014.89,
    streamingTime: 6495.92,
    batchMemory: 13.53,
    streamingMemory: 1.0,
    batchThroughput: 16625,
    streamingThroughput: 15394,
  },
  {
    size: 1000000,
    dataset: "1M",
    batchTime: 37448.92,
    streamingTime: 47573.40,
    batchMemory: 309.90,
    streamingMemory: 7.25,
    batchThroughput: 26703,
    streamingThroughput: 21020,
  },
];

const formatTime = (time) => {
  if (time < 1000) {
    return `${time.toFixed(2)} ms`;
  }

  return `${(time / 1000).toFixed(2)} s`;
};

const formatMemory = (memory) => {
  return `${memory.toFixed(2)} MB`;
};

const formatThroughput = (throughput) => {
  return `${throughput.toLocaleString()} records/s`;
};

const Performance = () => {
  const largestData =
    benchmarkData[benchmarkData.length - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ==============================
            Header
        ============================== */}

        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">

              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                PERFORMANCE ANALYSIS
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                3 Runs Average
              </span>

            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Performance Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Comparative performance analysis of Batch and
              Streaming JSON mock data generation across
              different dataset sizes.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Test Configuration
            </p>

            <p className="mt-1 font-semibold text-white">
              1K · 10K · 100K · 1M Records
            </p>
          </div>
        </div>

        {/* ==============================
            Benchmark Highlights
        ============================== */}

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Maximum Dataset
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              1M
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Records tested
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              1M Batch Time
            </p>

            <h2 className="mt-3 text-3xl font-bold text-purple-400">
              37.45s
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Average generation time
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              1M Streaming Time
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-400">
              47.57s
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Average generation time
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              1M Streaming Memory
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-400">
              7.25 MB
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Average measured peak memory
            </p>
          </div>

        </section>

        {/* ==============================
            Generation Time
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Generation Time
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Average backend generation time across three
              independent runs.
            </p>
          </div>

          <div className="h-[380px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={benchmarkData}>

                <CartesianGrid
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="dataset"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                  label={{
                    value: "Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#94a3b8",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    formatTime(Number(value)),
                    "",
                  ]}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchTime"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingTime"
                  name="Streaming"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </section>

        {/* ==============================
            Memory Usage
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Observed Memory Delta
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Average measured peak memory reported during
              backend generation. Memory values are
              environment-dependent and may vary because of
              Node.js runtime allocation and garbage collection.
            </p>
          </div>

          <div className="h-[380px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={benchmarkData}>

                <CartesianGrid
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="dataset"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                  label={{
                    value: "Memory (MB)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#94a3b8",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} MB`,
                    "",
                  ]}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchMemory"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingMemory"
                  name="Streaming"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </section>

        {/* ==============================
            Throughput
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Throughput
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Number of records generated per second.
            </p>
          </div>

          <div className="h-[380px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={benchmarkData}>

                <CartesianGrid
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="dataset"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                  }}
                  label={{
                    value: "Records/sec",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#94a3b8",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} records/s`,
                    "",
                  ]}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchThroughput"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingThroughput"
                  name="Streaming"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </section>

        {/* ==============================
            Detailed Benchmark Table
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Detailed Benchmark Results
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Average values calculated from three independent
              benchmark runs for each configuration.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left text-sm">

              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-4">
                    Dataset
                  </th>

                  <th className="px-4 py-4">
                    Method
                  </th>

                  <th className="px-4 py-4">
                    Generation Time
                  </th>

                  <th className="px-4 py-4">
                    Peak Memory
                  </th>

                  <th className="px-4 py-4">
                    Throughput
                  </th>

                </tr>
              </thead>

              <tbody>

                {benchmarkData.flatMap((item) => [
                  {
                    size: item.dataset,
                    method: "Batch",
                    time: item.batchTime,
                    memory: item.batchMemory,
                    throughput: item.batchThroughput,
                  },

                  {
                    size: item.dataset,
                    method: "Streaming",
                    time: item.streamingTime,
                    memory: item.streamingMemory,
                    throughput: item.streamingThroughput,
                  },
                ]).map((row, index) => (

                  <tr
                    key={index}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                  >

                    <td className="px-4 py-4 font-semibold text-white">
                      {row.size}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          row.method === "Batch"
                            ? "bg-purple-500/10 text-purple-300"
                            : "bg-blue-500/10 text-blue-300"
                        }`}
                      >
                        {row.method}
                      </span>

                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatTime(row.time)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatMemory(row.memory)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatThroughput(row.throughput)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </section>

        {/* ==============================
            1M Comparison
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              1M Record Comparison
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Large-scale benchmark comparison at the maximum
              tested dataset size.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Batch */}

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold text-purple-300">
                  Batch
                </h3>

                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                  1M Records
                </span>

              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Time
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatTime(largestData.batchTime)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Memory
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatMemory(
                      largestData.batchMemory
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Throughput
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatThroughput(
                      largestData.batchThroughput
                    )}
                  </p>
                </div>

              </div>

            </div>

            {/* Streaming */}

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold text-blue-300">
                  Streaming
                </h3>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                  1M Records
                </span>

              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Time
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatTime(
                      largestData.streamingTime
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Memory
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatMemory(
                      largestData.streamingMemory
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Throughput
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatThroughput(
                      largestData.streamingThroughput
                    )}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ==============================
            Research Observation
        ============================== */}

        <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <span className="text-lg">
                i
              </span>
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Research Observation
              </h2>

              <p className="mt-2 leading-7 text-slate-400">
                Across the tested dataset sizes, Batch
                generation recorded lower average generation
                time than Streaming at 1M records. Streaming
                recorded substantially lower measured peak
                memory at the same dataset size. Throughput
                varied across dataset sizes, showing that
                performance characteristics depend on workload
                size and generation strategy.
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                The benchmark values represent averages from
                three independent backend runs. Memory
                measurements are runtime-dependent and can
                vary because of Node.js memory allocation and
                garbage collection. Generation time represents
                backend generation time and does not include
                frontend IndexedDB storage time.
              </p>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
};

export default Performance;