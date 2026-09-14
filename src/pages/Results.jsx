import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const result = location.state;

  /* --------------------------------
     No Data State
  -------------------------------- */

  if (!result || !result.data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <span className="text-2xl">!</span>
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              No Generated Data
            </h1>

            <p className="mt-3 text-slate-400">
              Generate mock data first to view the results.
            </p>

            <button
              onClick={() => navigate("/generate")}
              className="mt-6 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold transition hover:bg-purple-700"
            >
              Go to Generator
            </button>

          </div>
        </main>
      </div>
    );
  }

  const data = result.data;

  const jsonData = JSON.stringify(data, null, 2);

  /* --------------------------------
     Copy JSON
  -------------------------------- */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonData);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /* --------------------------------
     Download JSON
  -------------------------------- */

  const handleDownload = () => {
    const blob = new Blob(
      [jsonData],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `mock-data-${result.records || data.length}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ==============================
            Header
        ============================== */}

        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
              GENERATION COMPLETE
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Generated Results
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Your mock dataset has been successfully
              generated and is ready for inspection or export.
            </p>

          </div>

          <button
            onClick={() => navigate("/generate")}
            className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-purple-500/50 hover:text-white"
          >
            ← Generate Again
          </button>

        </div>

        {/* ==============================
            Statistics
        ============================== */}

        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Records */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Records Generated
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {(result.records || data.length).toLocaleString()}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Total mock records
            </p>

          </div>

          {/* Method */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Generation Method
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {result.method || "Batch"}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Selected generation strategy
            </p>

          </div>

          {/* Time */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Generation Time
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {result.generationTime || "N/A"}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Time required to generate data
            </p>

          </div>

          {/* Memory */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Memory Delta
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {result.memoryUsed || "N/A"}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Observed RSS memory change
            </p>

          </div>

        </section>

        {/* ==============================
            Data Preview
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900">

          {/* Section Header */}

          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-xl font-semibold">
                JSON Data Preview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Preview of the generated mock dataset.
              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={handleCopy}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-purple-500/50 hover:text-white"
              >
                {copied ? "Copied!" : "Copy JSON"}
              </button>

              <button
                onClick={handleDownload}
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Download JSON
              </button>

            </div>

          </div>

          {/* JSON */}

          <div className="max-h-[600px] overflow-auto p-6">

            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-300">
              <code>
                {jsonData}
              </code>
            </pre>

          </div>

        </section>

        {/* ==============================
            Schema Used
        ============================== */}

        {result.schema && (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">

              <h2 className="text-xl font-semibold">
                Schema Used
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fields and data types used for generation.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead>

                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                    <th className="px-4 py-4">
                      Field
                    </th>

                    <th className="px-4 py-4">
                      Data Type
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {Object.entries(result.schema).map(
                    ([field, type]) => (
                      <tr
                        key={field}
                        className="border-b border-slate-800/70"
                      >

                        <td className="px-4 py-4 font-medium text-white">
                          {field}
                        </td>

                        <td className="px-4 py-4">

                          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {type}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* ==============================
            Research Note
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
                Generation Summary
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">

                {result.method === "Streaming"
                  ? "The dataset was generated progressively using the streaming approach. Records are produced and transmitted incrementally rather than being returned as one large in-memory array."
                  : "The dataset was generated using the batch approach. Generated records are collected in memory and returned as a complete JSON dataset."}

              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Performance measurements are environment-dependent.
                Memory values represent observed RSS changes during
                execution and may vary because of Node.js runtime
                allocation and garbage collection.
              </p>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
};

export default Results;