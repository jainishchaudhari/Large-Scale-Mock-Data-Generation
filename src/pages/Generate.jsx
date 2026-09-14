import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

const Generate = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState(1000);
  const [method, setMethod] = useState("Batch");

  const [fields, setFields] = useState([
    { name: "name", type: "name" },
    { name: "email", type: "email" },
    { name: "age", type: "number" },
    { name: "city", type: "city" },
    { name: "country", type: "country" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dataTypes = [
    "name",
    "email",
    "number",
    "city",
    "country",
    "phone",
    "company",
    "address",
    "boolean",
  ];

  /* -----------------------------
     Add New Field
  ----------------------------- */

  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        type: "name",
      },
    ]);
  };

  /* -----------------------------
     Remove Field
  ----------------------------- */

  const removeField = (index) => {
    if (fields.length === 1) {
      return;
    }

    setFields(fields.filter((_, i) => i !== index));
  };

  /* -----------------------------
     Update Field
  ----------------------------- */

  const updateField = (index, key, value) => {
    const updatedFields = [...fields];

    updatedFields[index] = {
      ...updatedFields[index],
      [key]: value,
    };

    setFields(updatedFields);
  };

  /* -----------------------------
     Generate Data
  ----------------------------- */

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

    const validFields = fields.filter((field) => field.name.trim() !== "");

    if (validFields.length === 0) {
      setError("Please add at least one valid field.");
      return;
    }

    const duplicateNames = validFields
      .map((field) => field.name.trim())
      .filter((name, index, array) => array.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
      setError("Field names must be unique.");
      return;
    }

    const schema = {};

    validFields.forEach((field) => {
      schema[field.name.trim()] = field.type;
    });

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  /* -----------------------------
     UI
  ----------------------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

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
              Schema Section
          ========================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Schema Definition</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define the fields for each generated record.
                </p>
              </div>

              <button
                onClick={addField}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-700"
              >
                + Add Field
              </button>
            </div>

            {/* Field Header */}

            <div className="mb-3 hidden grid-cols-[1fr_180px_45px] gap-4 px-1 text-xs uppercase tracking-wider text-slate-500 sm:grid">
              <span>Field Name</span>
              <span>Data Type</span>
              <span></span>
            </div>

            {/* Fields */}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:grid-cols-[1fr_180px_45px]"
                >
                  {/* Field Name */}

                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500"
                  />

                  {/* Data Type */}

                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-500"
                  >
                    {dataTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  {/* Remove */}

                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length === 1}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 transition hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Remove field"
                  >
                    ×
                  </button>
                </div>
              ))}
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

        {/* =========================
            Information
        ========================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <span className="text-lg">i</span>
            </div>

            <div>
              <h3 className="font-semibold text-white">Supported Data Types</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                name, email, number, city, country, phone, company, address and
                boolean are currently supported by the Faker.js generator.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Generate;
