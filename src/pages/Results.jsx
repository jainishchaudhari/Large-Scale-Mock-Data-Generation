import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Results = () => {
  const location = useLocation();

  const data = location.state || {
    records: 1000,
    format: "JSON",
    method: "Batch",
    schema: {},
    generatedData: [],
    generationTime: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <main className="px-6 py-12">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
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


          {/* Statistics */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Records Generated
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {Number(data.records).toLocaleString()}
              </h2>
            </div>


            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Generation Time
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.generationTime} ms
              </h2>
            </div>


            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Output Format
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.format}
              </h2>
            </div>


            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">
                Generation Method
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {data.method}
              </h2>
            </div>

          </div>


          {/* Generated Data */}
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


            <pre className="max-h-125 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300">
              {JSON.stringify(data.generatedData, null, 2)}
            </pre>

          </div>


          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              to="/generate"
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-700"
            >
              Generate Again
            </Link>

            <button
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Download Data
            </button>

          </div>

        </div>
      </main>

    </div>
  );
};

export default Results;