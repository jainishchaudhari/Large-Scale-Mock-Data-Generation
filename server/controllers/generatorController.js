import { interpretSchema } from "../services/aiSchemaInterpreter.js";
import { fallbackSchema } from "../services/schemaFallback.js";

import { generateBatch } from "../services/batchGenerator.js";
import { generateStreaming } from "../services/streamingGenerator.js";
import Generation from "../models/Generation.js";

const allowedTypes = new Set([
  "name",
  "email",
  "age",
  "city",
  "country",
  "phone",
  "address",
  "company",
  "date",
  "number",
  "boolean",
  "text",
]);

const isValidNormalizedSchema = (candidate, originalSchema) => {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  const originalFields = Object.keys(originalSchema);
  const normalizedFields = Object.keys(candidate);

  if (originalFields.length !== normalizedFields.length) {
    return false;
  }

  return originalFields.every(
    (field) =>
      Object.prototype.hasOwnProperty.call(candidate, field) &&
      allowedTypes.has(candidate[field]),
  );
};

export const generateData = async (req, res) => {
  try {
    const { schema, records, method = "Batch" } = req.body;

    // ==============================
    // Schema Validation
    // ==============================

    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      return res.status(400).json({
        success: false,
        message: "Valid schema is required",
      });
    }

    // ==============================
    // Records Validation
    // ==============================

    const totalRecords = Number(records);

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      return res.status(400).json({
        success: false,
        message: "Records must be a positive integer",
      });
    }

    if (totalRecords > 10000) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10,000 records allowed for testing",
      });
    }

    // ==============================
    // AI Schema Interpretation
    // ==============================

    let normalizedSchema;

    try {
      normalizedSchema = await interpretSchema(schema);

      console.log("AI normalized schema:", normalizedSchema);

      // Validate Gemini output
      if (!isValidNormalizedSchema(normalizedSchema, schema)) {
        console.warn("Invalid AI schema output. Using rule-based fallback.");

        normalizedSchema = fallbackSchema(schema);
      }
    } catch (error) {
      console.warn("Gemini unavailable. Using rule-based fallback.");

      normalizedSchema = fallbackSchema(schema);

      console.log("Fallback normalized schema:", normalizedSchema);
    }

    // ==============================
    // Batch Generation
    // ==============================

    if (method === "Batch") {
      const result = generateBatch(normalizedSchema, totalRecords);

      const generation = await Generation.create({
        userId: req.userId,

        // Store original user schema
        schema,

        records: totalRecords,

        method: "Batch",

        generationTime: Number(result.generationTime),

        memoryUsed: Number(result.memoryUsed),

        data: result.data,
      });

      return res.json({
        success: true,
        id: generation._id,
        method: "Batch",
        records: totalRecords,

        originalSchema: schema,
        normalizedSchema,

        generationTime: `${result.generationTime} ms`,

        memoryUsed: `${result.memoryUsed} MB`,

        data: result.data,
      });
    }

    // ==============================
    // Streaming Generation
    // ==============================

    if (method === "Streaming") {
      const stream = generateStreaming(
        normalizedSchema,
        totalRecords,
        (result) => {
          console.log("Streaming Generation Complete");

          console.log(`Records: ${totalRecords}`);

          console.log(`Generation Time: ${result.generationTime} ms`);

          console.log(`Peak Memory Used: ${result.memoryUsed} MB`);
        },
      );

      res.setHeader("Content-Type", "application/x-ndjson");

      res.setHeader("Transfer-Encoding", "chunked");

      stream.on("error", (error) => {
        console.error("Streaming Error:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Streaming generation failed",
          });
        } else {
          res.end();
        }
      });

      stream.pipe(res);

      return;
    }

    // ==============================
    // Invalid Method
    // ==============================

    return res.status(400).json({
      success: false,
      message: "Invalid generation method",
    });
  } catch (error) {
    console.error("Generation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Data generation failed",
      error: error.message,
    });
  }
};
