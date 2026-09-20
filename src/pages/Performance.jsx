import { useEffect, useState } from "react";

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


const Performance = () => {
  const [benchmarkData, setBenchmarkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/benchmark",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              schema: {
                name: "name",
                email: "email",
                age: "number",
                city: "city",
                country: "country",
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch benchmark data");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Benchmark failed"
          );
        }

        const formattedData = result.results.map((item) => ({
          size: item.records,

          batchTime: Number(item.batch.generationTime),
          streamingTime: Number(
            item.streaming.generationTime
          ),
          syncTime: Number(item.sync.generationTime),
          asyncTime: Number(item.async.generationTime),

          batchMemory: Number(item.batch.memoryUsed),
          streamingMemory: Number(
            item.streaming.memoryUsed
          ),
          syncMemory: Number(item.sync.memoryUsed),
          asyncMemory: Number(item.async.memoryUsed),

          batchThroughput: Number(
            item.batch.throughput
          ),
          streamingThroughput: Number(
            item.streaming.throughput
          ),
          syncThroughput: Number(
            item.sync.throughput
          ),
          asyncThroughput: Number(
            item.async.throughput
          ),

          runs: item.runs,
        }));

        setBenchmarkData(formattedData);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load benchmark data. Make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmark();
  }, []);

  /* --------------------------------
     Dataset & Chart Data
  -------------------------------- */

  const largestDataset = benchmarkData.length
    ? Math.max(...benchmarkData.map((d) => d.size))
    : 0;

  const largestData = benchmarkData.find(
    (item) => item.size === largestDataset
  );

  const chartData = benchmarkData.map((item) => ({
    ...item,
    dataset: `${item.size.toLocaleString()} records`,
  }));

  /* --------------------------------
     Research Observation
  -------------------------------- */

  let researchObservation = "";

  if (benchmarkData.length && largestData) {
    const observations = benchmarkData.map((item) => {
      const methods = [
        {
          name: "Batch",
          time: item.batchTime,
          throughput: item.batchThroughput,
        },
        {
          name: "Streaming",
          time: item.streamingTime,
          throughput: item.streamingThroughput,
        },
        {
          name: "Sync",
          time: item.syncTime,
          throughput: item.syncThroughput,
        },
        {
          name: "Async",
          time: item.asyncTime,
          throughput: item.asyncThroughput,
        },
      ];

      const fastest = methods.reduce((a, b) =>
        b.time < a.time ? b : a
      );

      return `${item.size.toLocaleString()} records: ${fastest.name} was fastest at ${fastest.time.toFixed(
        2
      )} ms`;
    });

    const largestMethods = [
      {
        name: "Batch",
        throughput: largestData.batchThroughput,
      },
      {
        name: "Streaming",
        throughput: largestData.streamingThroughput,
      },
      {
        name: "Sync",
        throughput: largestData.syncThroughput,
      },
      {
        name: "Async",
        throughput: largestData.asyncThroughput,
      },
    ];

    const highestThroughput = largestMethods.reduce(
      (a, b) =>
        b.throughput > a.throughput ? b : a
    );

    researchObservation =
      `${observations.join(". ")}. At ${largestDataset.toLocaleString()} records, ` +
      `${highestThroughput.name} achieved the highest throughput ` +
      `of ${highestThroughput.throughput.toFixed(
        0
      )} records/sec. ` +
      `These results indicate that performance varies with dataset size rather than a single method consistently dominating all workloads.`;
  }

  /* --------------------------------
     Loading State
  -------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500" />

            <p className="text-slate-300">
              Running performance benchmark...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              5 runs × 4 methods × 3 dataset sizes
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------
     Error State
  -------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <h2 className="text-xl font-semibold">
              Benchmark Error
            </h2>

            <p className="mt-3 text-slate-400">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-purple-700"
            >
              Retry Benchmark
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------
     Main Dashboard
  -------------------------------- */

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
                5 Runs Average
              </span>

            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Performance Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Comparative analysis of Batch, Streaming,
              Synchronous and Asynchronous JSON mock data
              generation strategies.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Test Configuration
            </p>

            <p className="mt-1 font-semibold text-white">
              1K · 5K · 10K Records
            </p>
          </div>
        </div>

        {/* ==============================
            Benchmark Highlights
        ============================== */}

        <section className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* Dataset-wise fastest cards */}

          {benchmarkData.map((item) => {
            const methods = [
              {
                name: "Batch",
                time: item.batchTime,
              },
              {
                name: "Streaming",
                time: item.streamingTime,
              },
              {
                name: "Sync",
                time: item.syncTime,
              },
              {
                name: "Async",
                time: item.asyncTime,
              },
            ];

            const fastest = methods.reduce(
              (a, b) =>
                b.time < a.time ? b : a
            );

            return (
              <div
                key={item.size}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-purple-500/40"
              >
                <div className="flex items-center justify-between">

                  <p className="text-sm text-slate-400">
                    {item.size.toLocaleString()} Records
                  </p>

                  <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400">
                    Fastest
                  </span>

                </div>

                <h3 className="mt-4 text-2xl font-bold text-white">
                  {fastest.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {fastest.time.toFixed(2)} ms
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Lowest generation time for this dataset
                </p>
              </div>
            );
          })}

          {/* Highest Throughput */}

          {largestData && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-purple-500/40">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Peak Throughput
                </p>

                <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                  Highest
                </span>

              </div>

              <h3 className="mt-4 text-2xl font-bold text-white">
                {(() => {
                  const methods = [
                    {
                      name: "Batch",
                      value:
                        largestData.batchThroughput,
                    },
                    {
                      name: "Streaming",
                      value:
                        largestData.streamingThroughput,
                    },
                    {
                      name: "Sync",
                      value:
                        largestData.syncThroughput,
                    },
                    {
                      name: "Async",
                      value:
                        largestData.asyncThroughput,
                    },
                  ];

                  return methods.reduce(
                    (a, b) =>
                      b.value > a.value ? b : a
                  ).name;
                })()}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {(() => {
                  const values = [
                    largestData.batchThroughput,
                    largestData.streamingThroughput,
                    largestData.syncThroughput,
                    largestData.asyncThroughput,
                  ];

                  return Math.max(...values).toFixed(0);
                })()}{" "}
                records/sec
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Best throughput at{" "}
                {largestDataset.toLocaleString()} records
              </p>

            </div>
          )}

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
              Lower values indicate faster generation.
            </p>
          </div>

          <div className="h-[360px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

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
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchTime"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingTime"
                  name="Streaming"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="syncTime"
                  name="Sync"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="asyncTime"
                  name="Async"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </section>

        {/* ==============================
            Memory
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Observed Memory Delta
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Observed change in Node.js RSS during
              generation. Values are environment-dependent
              and may be affected by runtime allocation and
              garbage collection.
            </p>
          </div>

          <div className="h-[360px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

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
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchMemory"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingMemory"
                  name="Streaming"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="syncMemory"
                  name="Sync"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="asyncMemory"
                  name="Async"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
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
              Higher values indicate more records generated
              per second.
            </p>
          </div>

          <div className="h-[360px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

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
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="batchThroughput"
                  name="Batch"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="streamingThroughput"
                  name="Streaming"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="syncThroughput"
                  name="Sync"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="asyncThroughput"
                  name="Async"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ r: 4 }}
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
              Average values across 5 independent runs.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead>

                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-4">
                    Dataset
                  </th>

                  <th className="px-4 py-4">
                    Method
                  </th>

                  <th className="px-4 py-4">
                    Time
                  </th>

                  <th className="px-4 py-4">
                    Memory Delta
                  </th>

                  <th className="px-4 py-4">
                    Throughput
                  </th>

                </tr>

              </thead>

              <tbody>

                {benchmarkData
                  .flatMap((item) => [
                    {
                      size: item.size,
                      method: "Batch",
                      time: item.batchTime,
                      memory: item.batchMemory,
                      throughput:
                        item.batchThroughput,
                    },
                    {
                      size: item.size,
                      method: "Streaming",
                      time: item.streamingTime,
                      memory:
                        item.streamingMemory,
                      throughput:
                        item.streamingThroughput,
                    },
                    {
                      size: item.size,
                      method: "Sync",
                      time: item.syncTime,
                      memory: item.syncMemory,
                      throughput:
                        item.syncThroughput,
                    },
                    {
                      size: item.size,
                      method: "Async",
                      time: item.asyncTime,
                      memory: item.asyncMemory,
                      throughput:
                        item.asyncThroughput,
                    },
                  ])
                  .map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-800/70 transition hover:bg-slate-800/40"
                    >

                      <td className="px-4 py-4 font-medium text-white">
                        {row.size.toLocaleString()}
                      </td>

                      <td className="px-4 py-4">

                        <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200">
                          {row.method}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {row.time.toFixed(2)} ms
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {row.memory.toFixed(2)} MB
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {row.throughput.toFixed(0)} records/s
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

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
                {researchObservation}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Results are environment-dependent and
                represent averages across 5 benchmark runs.
                Memory measurements represent observed RSS
                changes during execution and may vary because
                of Node.js runtime allocation and garbage
                collection. The asynchronous implementation
                uses periodic event-loop yielding and should
                not be interpreted as true multithreaded or
                parallel processing.
              </p>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
};

export default Performance;