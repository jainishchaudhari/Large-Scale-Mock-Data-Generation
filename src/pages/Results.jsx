import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Results = () => {
  const location = useLocation();

  const data = location.state || {
    records: 0,
    format: "JSON",
    method: "Batch",
    schema: {},
    generatedData: [],
    generationTime: "N/A",
    memoryUsed: "N/A",
  };

  // =========================
  // DOWNLOAD DATA
  // =========================
  const handleDownload = () => {
    if (!data.generatedData || data.generatedData.length === 0) {
      alert("No generated data available to download.");
      return;
    }

    let fileContent;
    let fileType;
    let fileExtension;

    // =========================
    // JSON
    // =========================
    if (data.format === "JSON") {
      fileContent = JSON.stringify(
        data.generatedData,
        null,
        2
      );

      fileType = "application/json";
      fileExtension = "json";
    }

    // =========================
    // JSONL
    // =========================
    else {
      fileContent = data.generatedData
        .map((record) => JSON.stringify(record))
        .join("\n");

      fileType = "application/x-ndjson";
      fileExtension = "jsonl";
    }

    // =========================
    // CREATE FILE
    // =========================
    const blob = new Blob(
      [fileContent],
      { type: fileType }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `mock-data-${data.records}.${fileExtension}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <main className="px-6 py-12">

        <div className="mx-auto max-w-7xl">

          {/* =========================
              HEADER
          ========================= */}
          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
              Generation Complete
            </p>

            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Generation Results
            </h1>

            <p className="mt-4 text-slate-400">
              Review the generated mock data and generation statistics.
            </p>

          </div>


          {/* =========================
              STATISTICS
          ========================= */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

            {/* RECORDS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Records Generated
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {Number(data.records).toLocaleString()}
              </h2>

            </div>


            {/* GENERATION TIME */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Generation Time
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.generationTime}
              </h2>

            </div>


            {/* MEMORY */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Peak Memory
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.memoryUsed || "N/A"}
              </h2>

            </div>


            {/* FORMAT */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Output Format
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.format}
              </h2>

            </div>


            {/* METHOD */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Generation Method
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.method}
              </h2>

            </div>

          </div>


          {/* =========================
              GENERATED DATA
          ========================= */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Generated Data
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Preview of the generated mock records.
                </p>

              </div>

              <span className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {data.format}
              </span>

            </div>


            {/* DATA PREVIEW */}
            {data.generatedData &&
            data.generatedData.length > 0 ? (

              <pre className="max-h-[500px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                {JSON.stringify(
                  data.generatedData,
                  null,
                  2
                )}
              </pre>

            ) : (

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">

                <p className="text-slate-500">
                  No generated data available.
                </p>

              </div>

            )}

          </div>


          {/* =========================
              ACTIONS
          ========================= */}
          <div className="mt-8 flex flex-wrap gap-4">

            {/* GENERATE AGAIN */}
            <Link
              to="/generate"
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-700"
            >
              Generate Again
            </Link>


            {/* DOWNLOAD */}
            <button
              onClick={handleDownload}
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Download Data
            </button>

          </div>


          {/* =========================
              INFO
          ========================= */}
          <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

            <div className="flex gap-3">

              <span className="text-purple-400">
                ℹ
              </span>

              <p className="text-sm leading-6 text-slate-400">

                Generated data is produced by the Node.js backend
                using Faker.js. Generation time and memory usage
                are measured during backend processing.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Results;