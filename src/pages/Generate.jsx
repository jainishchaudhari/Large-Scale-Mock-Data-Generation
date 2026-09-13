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

  const handleGenerate = () => {
    const startTime = performance.now();

    let parsedSchema;

    // Validate JSON schema
    try {
      parsedSchema = JSON.parse(schema);
    } catch (error) {
      alert("Invalid JSON schema. Please check your schema.");
      return;
    }

    // Validate number of records
    const totalRecords = Number(records);

    if (!totalRecords || totalRecords < 1) {
      alert("Please enter a valid number of records.");
      return;
    }

    // Dummy generated data
    const generatedData = [];

    // Only generate 10 records for frontend preview
    for (let i = 0; i < Math.min(totalRecords, 10); i++) {
      generatedData.push({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        age: 20 + i,
        city: "Ahmedabad",
      });
    }

    const endTime = performance.now();

    const generationTime = (endTime - startTime).toFixed(2);

    // Navigate to Results page
    navigate("/results", {
      state: {
        schema: parsedSchema,
        records: totalRecords,
        format: format,
        method: method,
        generatedData: generatedData,
        generationTime: generationTime,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= Navbar ================= */}
      <Navbar />

      {/* ================= Main Content ================= */}
      <main className="px-6 py-12">

        <div className="mx-auto max-w-7xl">

          {/* ================= Page Header ================= */}
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


          {/* ================= Main Grid ================= */}
          <div className="grid gap-8 lg:grid-cols-2">

            {/* ================= Schema Editor ================= */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              {/* Card Header */}
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


              {/* Schema Input */}
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


            {/* ================= Generation Settings ================= */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h2 className="text-xl font-semibold">
                Generation Settings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Configure the size, format and generation method.
              </p>


              {/* ================= Number of Records ================= */}
              <div className="mt-8">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Number of Records
                </label>

                <input
                  type="number"
                  min="1"
                  value={records}
                  onChange={(e) => setRecords(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Example: 1,000, 10,000 or 100,000 records
                </p>

              </div>


              {/* ================= Output Format ================= */}
              <div className="mt-7">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Output Format
                </label>

                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="JSON">JSON</option>
                  <option value="JSONL">JSONL</option>
                </select>

              </div>


              {/* ================= Generation Method ================= */}
              <div className="mt-7">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Generation Method
                </label>

                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Batch">Batch</option>
                  <option value="Streaming">Streaming</option>
                </select>

              </div>


              {/* ================= Generate Button ================= */}
              <button
                onClick={handleGenerate}
                className="mt-9 w-full rounded-xl bg-purple-600 py-3.5 font-semibold transition hover:bg-purple-700 active:scale-[0.99]"
              >
                Generate Data
              </button>

            </div>

          </div>


          {/* ================= Information Box ================= */}
          <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">

            <div className="flex gap-3">

              <span className="text-purple-400">
                ℹ
              </span>

              <p className="text-sm leading-6 text-slate-400">

                <span className="font-semibold text-purple-400">
                  Note:
                </span>{" "}

                The current interface uses dummy generation logic.
                Faker.js and backend processing will be connected later.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Generate;