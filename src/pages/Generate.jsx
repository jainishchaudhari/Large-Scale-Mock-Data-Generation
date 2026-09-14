import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Generate = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState(1000);
  const [format, setFormat] = useState("JSON");
  const [method, setMethod] = useState("Batch");

  const [schema, setSchema] = useState(`{
  "name": "name",
  "email": "email",
  "age": "number",
  "city": "city"
}`);

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    let parsedSchema;

    // =========================
    // VALIDATE JSON SCHEMA
    // =========================
    try {
      parsedSchema = JSON.parse(schema);
    } catch (error) {
      alert("Invalid JSON schema. Please check your schema.");
      return;
    }

    // =========================
    // VALIDATE RECORDS
    // =========================
    const totalRecords = Number(records);

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      alert("Please enter a valid number of records.");
      return;
    }

    // =========================
    // RECORD LIMIT
    // =========================
    if (totalRecords > 10000) {
      alert("Maximum 10,000 records allowed for testing.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CALL BACKEND
      // =========================
      const response = await fetch(
        "http://localhost:5000/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            schema: parsedSchema,
            records: totalRecords,
            method: method,
          }),
        }
      );

      // =========================
      // HANDLE BACKEND ERROR
      // =========================
      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Data generation failed"
        );
      }

      // =========================
      // BATCH GENERATION
      // =========================
      if (method === "Batch") {
        const data = await response.json();

        navigate("/results", {
          state: {
            schema: parsedSchema,
            records: totalRecords,
            format: format,
            method: method,
            generatedData: data.data || [],
            generationTime: data.generationTime || "N/A",
            memoryUsed: data.memoryUsed || "N/A",
          },
        });

        return;
      }

      // =========================
      // STREAMING GENERATION
      // =========================
      if (method === "Streaming") {
        const text = await response.text();

        const generatedData = text
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => JSON.parse(line));

        navigate("/results", {
          state: {
            schema: parsedSchema,
            records: totalRecords,
            format: "JSONL",
            method: method,
            generatedData: generatedData,
            generationTime: "Measured on backend",
            memoryUsed: "Measured on backend",
          },
        });

        return;
      }

    } catch (error) {
      console.error("Generation Error:", error);

      alert(
        error.message ||
        "Unable to connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <main className="px-6 py-12">

        <div className="mx-auto max-w-7xl">

          {/* =========================
              PAGE HEADER
          ========================= */}
          <div className="mb-10">

            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
              Data Generator
            </p>

            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Generate Mock Data
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Define your JSON schema and configure how your mock
              data should be generated.
            </p>

          </div>

          {/* =========================
              MAIN GRID
          ========================= */}
          <div className="grid gap-8 lg:grid-cols-2">

            {/* =========================
                JSON SCHEMA
            ========================= */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold">
                    JSON Schema
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Define the fields for your generated data.
                  </p>

                </div>

                <span className="rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-400">
                  JSON
                </span>

              </div>

              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                spellCheck="false"
                className="h-80 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-300 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />

              <p className="mt-3 text-xs text-slate-500">
                Example: name, email, age, city
              </p>

            </div>

            {/* =========================
                GENERATION SETTINGS
            ========================= */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h2 className="text-xl font-semibold">
                Generation Settings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Configure the size, format and generation method.
              </p>

              {/* =========================
                  NUMBER OF RECORDS
              ========================= */}
              <div className="mt-8">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Number of Records
                </label>

                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={records}
                  onChange={(e) =>
                    setRecords(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Maximum 10,000 records for current testing version.
                </p>

              </div>

              {/* =========================
                  OUTPUT FORMAT
              ========================= */}
              <div className="mt-7">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Output Format
                </label>

                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >

                  <option value="JSON">
                    JSON
                  </option>

                  <option value="JSONL">
                    JSONL
                  </option>

                </select>

              </div>

              {/* =========================
                  GENERATION METHOD
              ========================= */}
              <div className="mt-7">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Generation Method
                </label>

                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >

                  <option value="Batch">
                    Batch
                  </option>

                  <option value="Streaming">
                    Streaming
                  </option>

                </select>

              </div>

              {/* =========================
                  GENERATE BUTTON
              ========================= */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-9 w-full rounded-xl bg-purple-600 py-3.5 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Generating..."
                  : "Generate Data"}

              </button>

            </div>

          </div>

          {/* =========================
              INFO BOX
          ========================= */}
          <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

            <div className="flex gap-3">

              <span className="text-purple-400">
                ℹ
              </span>

              <p className="text-sm leading-6 text-slate-400">

                <span className="font-semibold text-purple-400">
                  Note:
                </span>{" "}

                Data is generated by the Node.js backend using
                Faker.js. Batch and Streaming methods can be
                compared using the Performance page.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Generate;