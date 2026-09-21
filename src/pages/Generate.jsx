import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

const Generate = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState(1000);
  const [method, setMethod] = useState("Batch");

  const [schemaText, setSchemaText] = useState(`{
  "name": "string",
  "email": "string",
  "age": "number",
  "city": "string",
  "country": "string"
}`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(schemaText);

      setSchemaText(JSON.stringify(parsed, null, 2));

      setError("");
    } catch (err) {
      setError("Cannot format invalid JSON. Please fix the JSON syntax first.");
    }
  };

  const handleGenerate = async () => {
    setError("");

    const totalRecords = Number(records);

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      setError("Please enter a valid number of records.");
      return;
    }

    if (totalRecords > 10000) {
      setError("Maximum 10,000 records are allowed for testing.");
      return;
    }

    let schema;

    try {
      schema = JSON.parse(schemaText);
    } catch (err) {
      setError("Invalid JSON format. Please check your schema.");
      return;
    }

    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      setError("Schema must be a valid JSON object.");
      return;
    }

    const fields = Object.keys(schema);

    if (fields.length === 0) {
      setError("Please add at least one field to the schema.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schema,
          records: totalRecords,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate mock data.");
      }

      /*
        Streaming response is NDJSON.
        Batch response is normal JSON.
      */

      if (method === "Streaming") {
        const text = await response.text();

        const lines = text.trim().split("\n").filter(Boolean);

        const parsedLines = lines.map((line) => JSON.parse(line));

        const metadata = parsedLines.find((item) => item.__metadata === true);

        const generatedData = parsedLines.filter(
          (item) => item.__metadata !== true,
        );

        navigate("/results", {
          state: {
            data: generatedData,
            records: totalRecords,
            method,
            schema,
            generationTime: metadata ? `${metadata.generationTime} ms` : null,
            memoryUsed: metadata ? `${metadata.memoryUsed} MB` : null,
          },
        });

        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Generation failed.");
      }

      navigate("/results", {
        state: {
          data: result.data,
          records: result.records,
          method: result.method,
          schema,
          originalSchema: result.originalSchema,
          normalizedSchema: result.normalizedSchema,
          generationTime: result.generationTime,
          memoryUsed: result.memoryUsed,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to generate data. Make sure the backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}

        <div className="mb-10">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
            DATA GENERATOR
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Generate Mock Data
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Define your schema, select the dataset size and generation strategy,
            then generate realistic JSON mock data.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* =========================
              Schema Editor
          ========================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            {/* Editor Header */}

            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Schema Definition</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Define the fields using JSON format.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={formatJson}
                    className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-purple-500 hover:text-purple-400"
                  >
                    Format JSON
                  </button>

                  <span className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                    JSON
                  </span>
                </div>
              </div>
            </div>

            {/* Monaco Editor */}

            <div className="overflow-hidden">
              <Editor
                height="430px"
                language="json"
                theme="vs-dark"
                value={schemaText}
                onChange={(value) => {
                  setSchemaText(value || "");
                  setError("");
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  fontSize: 14,
                  lineHeight: 24,
                  padding: {
                    top: 18,
                    bottom: 18,
                  },
                  tabSize: 2,
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  renderLineHighlight: "line",
                  folding: true,
                  suggestOnTriggerCharacters: true,
                }}
              />
            </div>

            {/* Editor Footer */}

            <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-4">
              <p className="text-xs leading-5 text-slate-500">
                Example:{" "}
                <span className="text-slate-400">
                  {'{ "name": "string", "age": "number" }'}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Supported types: name, email, number, city, country, phone,
                company, address, boolean
              </p>
            </div>
          </section>

          {/* =========================
              Configuration
          ========================= */}

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Generation Settings</h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure the benchmark workload.
            </p>

            {/* Records */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Number of Records
              </label>

              <input
                type="number"
                min="1"
                max="10000"
                value={records}
                onChange={(e) => setRecords(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Maximum 10,000 records for testing.
              </p>
            </div>

            {/* Method */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Generation Method
              </label>

              <div className="mt-3 space-y-3">
                {/* Batch */}

                <button
                  onClick={() => setMethod("Batch")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    method === "Batch"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Batch</span>

                    {method === "Batch" && (
                      <span className="text-xs text-purple-400">Selected</span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates and stores all records in memory.
                  </p>
                </button>

                {/* Streaming */}

                <button
                  onClick={() => setMethod("Streaming")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    method === "Streaming"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Streaming</span>

                    {method === "Streaming" && (
                      <span className="text-xs text-purple-400">Selected</span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates records progressively using a stream.
                  </p>
                </button>
              </div>
            </div>

            {/* Generate */}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating Data..." : "Generate Mock Data"}
            </button>
          </section>
        </div>

        {/* Information */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <span className="text-lg">i</span>
            </div>

            <div>
              <h3 className="font-semibold text-white">JSON Schema Input</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter field names and their basic types in JSON format. MockGen
                uses AI-assisted schema interpretation to identify the semantic
                meaning of fields before generating realistic mock data.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Generate;
