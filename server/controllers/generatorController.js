import { generateBatch } from "../services/batchGenerator.js";
import { generateStreaming } from "../services/streamingGenerator.js";

export const generateData = (req, res) => {
  try {
    const { schema, records, method = "Batch" } = req.body;

    // =========================
    // VALIDATE SCHEMA
    // =========================
    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid schema is required",
      });
    }

    // =========================
    // VALIDATE RECORDS
    // =========================
    const totalRecords = Number(records);

    if (
      !Number.isInteger(totalRecords) ||
      totalRecords < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Records must be a positive integer",
      });
    }

    // =========================
    // TESTING LIMIT
    // =========================
    if (totalRecords > 10000) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10,000 records allowed for testing",
      });
    }

    // =========================
    // BATCH GENERATION
    // =========================
    if (method === "Batch") {
      const result = generateBatch(
        schema,
        totalRecords
      );

      return res.json({
        success: true,
        method: "Batch",
        records: totalRecords,
        generationTime: `${result.generationTime} ms`,
        memoryUsed: `${result.memoryUsed} MB`,
        data: result.data,
      });
    }

    // =========================
    // STREAMING GENERATION
    // =========================
    if (method === "Streaming") {
      const stream = generateStreaming(
        schema,
        totalRecords,
        (result) => {
          console.log(
            "Streaming Generation Complete"
          );

          console.log(
            `Records: ${totalRecords}`
          );

          console.log(
            `Generation Time: ${result.generationTime} ms`
          );

          console.log(
            `Peak Memory Used: ${result.memoryUsed} MB`
          );
        }
      );

      // JSONL response
      res.setHeader(
        "Content-Type",
        "application/x-ndjson"
      );

      // Enable chunked transfer
      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      );

      // Handle stream error
      stream.on("error", (error) => {
        console.error(
          "Streaming Error:",
          error
        );

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message:
              "Streaming generation failed",
          });
        } else {
          res.end();
        }
      });

      // Send stream to client
      stream.pipe(res);

      return;
    }

    // =========================
    // INVALID METHOD
    // =========================
    return res.status(400).json({
      success: false,
      message: "Invalid generation method",
    });

  } catch (error) {
    console.error(
      "Generation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Data generation failed",
      error: error.message,
    });
  }
};