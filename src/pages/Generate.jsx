import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

const Generate = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState(1000);
  const [method, setMethod] = useState("Batch");
  const [batchSize, setBatchSize] = useState(100);

  // ==========================================
  // Country / Data Locale
  // ==========================================

  const [country, setCountry] = useState("India");

  const [schemaText, setSchemaText] = useState(`{
  "name": "string",
  "email": "string",
  "age": "number",
  "city": "string",
  "country": "string"
}`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // Format JSON
  // ==========================================

  const formatJson = () => {
    try {
      const parsed = JSON.parse(schemaText);

      setSchemaText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError(
        "Cannot format invalid JSON. Please fix the JSON syntax first."
      );
    }
  };

  // ==========================================
  // Generate Data
  // ==========================================

  const handleGenerate = async () => {
    setError("");

    const totalRecords = Number(records);
    const selectedBatchSize = Number(batchSize);

    // ==========================================
    // Records Validation
    // ==========================================

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      setError("Please enter a valid number of records.");
      return;
    }

    if (totalRecords > 10000) {
      setError("Maximum 10,000 records are allowed for testing.");
      return;
    }

    // ==========================================
    // Batch Size Validation
    // ==========================================

    if (method === "Batch") {
      if (
        !Number.isInteger(selectedBatchSize) ||
        selectedBatchSize < 1
      ) {
        setError("Please enter a valid batch size.");
        return;
      }

      if (selectedBatchSize > totalRecords) {
        setError(
          "Batch size cannot be greater than the total number of records."
        );
        return;
      }
    }

    // ==========================================
    // Schema Validation
    // ==========================================

    let schema;

    try {
      schema = JSON.parse(schemaText);
    } catch (err) {
      setError("Invalid JSON format. Please check your schema.");
      return;
    }

    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema)
    ) {
      setError("Schema must be a valid JSON object.");
      return;
    }

    const fields = Object.keys(schema);

    if (fields.length === 0) {
      setError("Please add at least one field to the schema.");
      return;
    }

    // ==========================================
    // API Request
    // ==========================================

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            schema,
            records: totalRecords,
            method,

            batchSize:
              method === "Batch"
                ? selectedBatchSize
                : null,

            // Country will be connected to backend
            // in the next step.
            country,
          }),
        }
      );

      if (!response.ok) {
        let message = "Failed to generate mock data.";

        try {
          const errorData = await response.json();

          if (errorData.message) {
            message = errorData.message;
          }
        } catch (err) {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      // ==========================================
      // BATCH GENERATION
      // Progressive NDJSON Reading
      // ==========================================

      if (method === "Batch") {
        if (!response.body) {
          throw new Error(
            "Streaming response is not supported by this browser."
          );
        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        const generatedData = [];

        let completeMetadata = null;

        // ------------------------------------------
        // Read backend response chunk-by-chunk
        // ------------------------------------------

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines = buffer.split("\n");

          // Keep incomplete line for next chunk
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }

            try {
              const item = JSON.parse(line);

              // ------------------------------------
              // Individual Batch Received
              // ------------------------------------

              if (item.type === "batch") {
                console.log(
                  `Batch ${item.batchNumber} received`
                );

                console.log(
                  `Records in batch: ${item.batchSize}`
                );

                console.log(
                  `Total generated: ${item.totalGenerated}`
                );

                // Add received batch immediately
                generatedData.push(...item.data);
              }

              // ------------------------------------
              // Generation Complete
              // ------------------------------------

              if (item.type === "complete") {
                console.log(
                  "All batches received."
                );

                completeMetadata = item;
              }
            } catch (parseError) {
              console.error(
                "Invalid NDJSON line:",
                line
              );
            }
          }
        }

        // ==========================================
        // Process Last Remaining Buffer
        // ==========================================

        if (buffer.trim()) {
          try {
            const item = JSON.parse(buffer);

            if (item.type === "batch") {
              generatedData.push(...item.data);
            }

            if (item.type === "complete") {
              completeMetadata = item;
            }
          } catch (parseError) {
            console.error(
              "Invalid final NDJSON data:",
              buffer
            );
          }
        }

        // ==========================================
        // Navigate to Results
        // ==========================================

        if (!completeMetadata) {
          throw new Error(
            "Generation completed without final metadata."
          );
        }

        navigate("/results", {
          state: {
            data: generatedData,

            records:
              completeMetadata.records ||
              generatedData.length,

            method: "Batch",

            schema,

            country,

            batchSize:
              completeMetadata.batchSize ||
              selectedBatchSize,

            totalBatches:
              completeMetadata.totalBatches,

            originalSchema:
              completeMetadata.originalSchema,

            normalizedSchema:
              completeMetadata.normalizedSchema,

            generationTime:
              completeMetadata.generationTime,

            memoryUsed:
              completeMetadata.memoryUsed,

            id: completeMetadata.id,
          },
        });

        return;
      }

      // ==========================================
      // STREAMING GENERATION
      // ==========================================

      if (method === "Streaming") {
        if (!response.body) {
          throw new Error(
            "Streaming response is not supported by this browser."
          );
        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        const generatedData = [];

        let metadata = null;

        // ------------------------------------------
        // Read streaming response
        // ------------------------------------------

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines = buffer.split("\n");

          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }

            try {
              const item = JSON.parse(line);

              // Normal generated record
              if (!item.__metadata) {
                generatedData.push(item);
              }

              // Metadata
              if (item.__metadata === true) {
                metadata = item;
              }
            } catch (parseError) {
              console.error(
                "Invalid streaming JSON:",
                line
              );
            }
          }
        }

        // ------------------------------------------
        // Process final buffer
        // ------------------------------------------

        if (buffer.trim()) {
          try {
            const item = JSON.parse(buffer);

            if (!item.__metadata) {
              generatedData.push(item);
            }

            if (item.__metadata === true) {
              metadata = item;
            }
          } catch (parseError) {
            console.error(
              "Invalid final streaming data:",
              buffer
            );
          }
        }

        // ==========================================
        // Navigate to Results
        // ==========================================

        navigate("/results", {
          state: {
            data: generatedData,

            records:
              totalRecords ||
              generatedData.length,

            method: "Streaming",

            schema,

            country,

            originalSchema:
              metadata?.originalSchema,

            normalizedSchema:
              metadata?.normalizedSchema,

            generationTime: metadata
              ? `${metadata.generationTime} ms`
              : null,

            memoryUsed: metadata
              ? `${metadata.memoryUsed} MB`
              : null,
          },
        });

        return;
      }

      // ==========================================
      // Invalid Method
      // ==========================================

      throw new Error("Invalid generation method.");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to generate data. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* =====================================
            Header
        ===================================== */}

        <div className="mb-10">

          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
            DATA GENERATOR
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Generate Mock Data
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Define your schema, select the dataset size and
            generation strategy, then generate realistic JSON
            mock data.
          </p>

        </div>

        {/* =====================================
            Error
        ===================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">

          {/* ===================================
              Schema Editor
          =================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-6 py-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold">
                    Schema Definition
                  </h2>

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

            <div className="overflow-hidden">

              <Editor
                height="360px"
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

            <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-4">

              <p className="text-xs leading-5 text-slate-500">

                Example:{" "}

                <span className="text-slate-400">
                  {'{ "name": "string", "age": "number" }'}
                </span>

              </p>

              <p className="mt-1 text-xs text-slate-600">
                Supported types: name, email, number, city,
                country, phone, company, address, boolean
              </p>

            </div>

          </section>

          {/* ===================================
              Generation Settings
          =================================== */}

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Generation Settings
            </h2>

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
                onChange={(e) =>
                  setRecords(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Maximum 10,000 records for testing.
              </p>

            </div>

            {/* Country / Data Locale */}

            <div className="mt-7">

              <label className="text-sm font-medium text-slate-300">
                Country / Data Locale
              </label>

              <select
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              >
                <option value="India">
                  🇮🇳 India
                </option>

                <option value="United States">
                  🇺🇸 United States
                </option>

                <option value="United Kingdom">
                  🇬🇧 United Kingdom
                </option>

                <option value="Germany">
                  🇩🇪 Germany
                </option>

                <option value="Canada">
                  🇨🇦 Canada
                </option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Select the country for country-specific
                realistic mock data.
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

                    <span className="font-semibold">
                      Batch
                    </span>

                    {method === "Batch" && (
                      <span className="text-xs text-purple-400">
                        Selected
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates and delivers records progressively
                    in user-defined mini-batches.
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

                    <span className="font-semibold">
                      Streaming
                    </span>

                    {method === "Streaming" && (
                      <span className="text-xs text-purple-400">
                        Selected
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates records progressively using a
                    continuous stream.
                  </p>

                </button>

              </div>

            </div>

            {/* Mini Batch */}

            {method === "Batch" && (
              <div className="mt-7">

                <label className="text-sm font-medium text-slate-300">
                  Mini-Batch Size
                </label>

                <input
                  type="number"
                  min="1"
                  max={records}
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Number of records generated and delivered
                  together in each batch.
                </p>

                <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2.5">

                  <p className="text-xs text-purple-300">

                    {records} records with batch size{" "}

                    {batchSize || 0}

                    {" → approximately "}

                    {batchSize > 0
                      ? Math.ceil(
                          Number(records) /
                            Number(batchSize)
                        )
                      : 0}

                    {" batches will be delivered progressively."}

                  </p>

                </div>

              </div>
            )}

            {/* Generate */}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? method === "Batch"
                  ? "Generating Batches..."
                  : "Streaming Data..."
                : "Generate Mock Data"}
            </button>

          </section>

        </div>

        {/* =====================================
            Information
        ===================================== */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">

              <span className="text-lg">
                i
              </span>

            </div>

            <div>

              <h3 className="font-semibold text-white">
                JSON Schema Input
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter field names and their basic types in JSON
                format. MockGen uses AI-assisted schema
                interpretation to identify the semantic meaning
                of fields before generating realistic mock data.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                In Batch mode, records are generated in
                configurable mini-batches and each completed
                batch is sent to the client immediately. This
                allows the received batch to be processed while
                the remaining batches are still being generated.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Generate;