import { generateBatch } from "../services/batchGenerator.js";
import { generateStreaming } from "../services/streamingGenerator.js";
import Generation from "../models/Generation.js";

export const generateData = async (req, res) => {
  try {
    const {
      schema,
      records,
      method = "Batch",
    } = req.body;

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

    if (totalRecords > 10000) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 10,000 records allowed for testing",
      });
    }

    if (method === "Batch") {
      const result = generateBatch(
        schema,
        totalRecords
      );

      const generation = await Generation.create({
        schema,
        records: totalRecords,
        method: "Batch",
        generationTime: Number(
          result.generationTime
        ),
        memoryUsed: Number(
          result.memoryUsed
        ),
        data: result.data,
      });

      return res.json({
        success: true,
        id: generation._id,
        method: "Batch",
        records: totalRecords,
        generationTime: `${result.generationTime} ms`,
        memoryUsed: `${result.memoryUsed} MB`,
        data: result.data,
      });
    }

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

      res.setHeader(
        "Content-Type",
        "application/x-ndjson"
      );

      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      );

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

      stream.pipe(res);

      return;
    }

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