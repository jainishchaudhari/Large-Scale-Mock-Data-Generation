import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const result = location.state;

  // --------------------------------
  // Fetch Generation History
  // --------------------------------

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/results",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setHistory(data.results);
        }
      } catch (error) {
        console.error(
          "Failed to fetch generation history:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  // --------------------------------
  // No Data State
  // --------------------------------

  if (!result || !result.data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
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

  // --------------------------------
  // Helper: Display Schema Value
  // --------------------------------

  const formatSchemaValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // --------------------------------
  // Copy JSON
  // --------------------------------

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

  // --------------------------------
  // Download JSON
  // --------------------------------

  const handleDownload = () => {
    const blob = new Blob([jsonData], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `mock-data-${
      result.records || data.length
    }.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // --------------------------------
  // Calculate Batch Information
  // --------------------------------

  const batchSize = Number(result.batchSize || 0);

  const totalBatches =
    result.method === "Batch" && batchSize > 0
      ? Math.ceil(
          Number(result.records || data.length) /
            batchSize
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
              generated and is ready for inspection or
              export.
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

        <section
          className={`mb-8 grid gap-5 sm:grid-cols-2 ${
            result.method === "Batch"
              ? "xl:grid-cols-6"
              : "xl:grid-cols-4"
          }`}
        >

          {/* Records */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Records Generated
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {(
                result.records || data.length
              ).toLocaleString()}
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

          {/* Batch Size */}

          {result.method === "Batch" && (
            <div className="rounded-2xl border border-purple-500/20 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Mini-Batch Size
              </p>

              <h2 className="mt-3 text-3xl font-bold text-purple-400">
                {batchSize.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Records per batch
              </p>
            </div>
          )}

          {/* Total Batches */}

          {result.method === "Batch" && (
            <div className="rounded-2xl border border-purple-500/20 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Total Batches
              </p>

              <h2 className="mt-3 text-3xl font-bold text-purple-400">
                {totalBatches.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Mini-batches generated
              </p>
            </div>
          )}

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
            Mini-Batch Information
        ============================== */}

        {result.method === "Batch" && (
          <section className="mb-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <span className="text-lg">⚙</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Mini-Batch Generation
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The dataset was generated in smaller
                  user-defined batches instead of processing
                  all records as one batch.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Total Records
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {(
                        result.records || data.length
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Batch Size
                    </p>

                    <p className="mt-1 font-semibold text-purple-400">
                      {batchSize.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Total Batches
                    </p>

                    <p className="mt-1 font-semibold text-purple-400">
                      {totalBatches.toLocaleString()}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==============================
            AI Schema Interpretation
        ============================== */}

        {result.originalSchema &&
          result.normalizedSchema && (
            <section className="mb-8 rounded-2xl border border-purple-500/20 bg-slate-900 p-6">

              <div className="mb-5">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-xl font-semibold">
                    AI Schema Interpretation
                  </h2>

                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                    GEMINI AI
                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Gemini analyzed the input fields and
                  identified their semantic meaning before
                  mock data generation.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-4 py-4">
                        Original Field
                      </th>

                      <th className="px-4 py-4">
                        Input Type
                      </th>

                      <th className="px-4 py-4">
                        AI Interpretation
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {Object.entries(
                      result.originalSchema
                    ).map(([field, type]) => (
                      <tr
                        key={field}
                        className="border-b border-slate-800/70"
                      >

                        <td className="px-4 py-4 font-medium text-white">
                          {field}
                        </td>

                        <td className="px-4 py-4">

                          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {formatSchemaValue(type)}
                          </span>

                        </td>

                        <td className="px-4 py-4">

                          <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400">
                            {formatSchemaValue(
                              result.normalizedSchema[
                                field
                              ] || "text"
                            )}
                          </span>

                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </section>
          )}

        {/* ==============================
            Data Preview
        ============================== */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900">

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

          <div className="overflow-hidden p-6">

            <div className="overflow-hidden rounded-xl border border-slate-800">

              <Editor
                height="600px"
                language="json"
                theme="vs-dark"
                value={jsonData}
                options={{
                  readOnly: true,

                  minimap: {
                    enabled: false,
                  },

                  fontSize: 14,

                  lineHeight: 24,

                  padding: {
                    top: 18,
                    bottom: 18,
                  },

                  wordWrap: "on",

                  automaticLayout: true,

                  scrollBeyondLastLine: false,

                  folding: true,

                  renderLineHighlight: "line",

                  renderWhitespace: "selection",

                  contextmenu: true,
                }}
              />

            </div>
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
                Fields and data types submitted for generation.
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
                            {formatSchemaValue(type)}
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
            Generation History
        ============================== */}

        <section className="mb-8">

          <div className="mb-5">

            <h2 className="text-xl font-semibold">
              Generation History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Previous datasets stored in MongoDB.
            </p>

          </div>

          {loadingHistory ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Loading generation history...
              </p>

            </div>

          ) : history.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                No generation history found.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="border-b border-slate-800 bg-slate-950">

                    <tr>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                        Records
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                        Method
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                        Generation Time
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                        Memory
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                        Created
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {history.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-800 last:border-b-0"
                      >

                        <td className="px-6 py-4 text-sm text-white">
                          {item.records.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                            {item.method}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {item.generationTime} ms
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          {item.memoryUsed} MB
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

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
                  : `The dataset was generated using the mini-batch approach. ${(
                      result.records || data.length
                    ).toLocaleString()} records were divided into batches of ${batchSize.toLocaleString()} records and processed sequentially.`}

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