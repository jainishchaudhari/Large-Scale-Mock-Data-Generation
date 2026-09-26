import { interpretSchema } from "../services/aiSchemaInterpreter.js";
import { fallbackSchema } from "../services/schemaFallback.js";

import { generateBatch } from "../services/batchGenerator.js";
import { generateStreaming } from "../services/streamingGenerator.js";

import Generation from "../models/Generation.js";

// ---------------------------------------------
// Allowed semantic types
// ---------------------------------------------

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

// ---------------------------------------------
// Recursive semantic-map validation
// ---------------------------------------------

const isValidSemanticMap = (
  semanticMap,
  originalSchema,
  parentPath = ""
) => {
  if (
    !semanticMap ||
    typeof semanticMap !== "object" ||
    Array.isArray(semanticMap)
  ) {
    return false;
  }

  for (
    const [field, definition] of Object.entries(
      originalSchema
    )
  ) {
    const currentPath = parentPath
      ? `${parentPath}.${field}`
      : field;

    // -----------------------------------------
    // Nested object
    // -----------------------------------------

    if (
      definition &&
      typeof definition === "object" &&
      definition.type === "object" &&
      definition.properties
    ) {
      const nestedMap =
        semanticMap[currentPath] ||
        semanticMap[field];

      const hasNestedDotPaths =
        Object.keys(semanticMap).some(
          (key) =>
            key.startsWith(
              `${currentPath}.`
            )
        );

      if (hasNestedDotPaths) {
        if (
          !isValidSemanticMap(
            semanticMap,
            definition.properties,
            currentPath
          )
        ) {
          return false;
        }
      } else if (
        nestedMap &&
        typeof nestedMap === "object"
      ) {
        if (
          !isValidSemanticMap(
            nestedMap,
            definition.properties,
            ""
          )
        ) {
          return false;
        }
      }

      continue;
    }

    // -----------------------------------------
    // Array
    // -----------------------------------------

    if (
      definition &&
      typeof definition === "object" &&
      definition.type === "array" &&
      definition.items
    ) {
      // ---------------------------------------
      // Array of objects
      // ---------------------------------------

      if (
        definition.items.type === "object" &&
        definition.items.properties
      ) {
        const hasArrayDotPaths =
          Object.keys(semanticMap).some(
            (key) =>
              key.startsWith(
                `${currentPath}.`
              )
          );

        if (hasArrayDotPaths) {
          if (
            !isValidSemanticMap(
              semanticMap,
              definition.items.properties,
              `${currentPath}[]`
            )
          ) {
            return false;
          }
        }

        continue;
      }

      // ---------------------------------------
      // Array of primitive values
      // ---------------------------------------

      const semanticType =
        semanticMap[currentPath] ||
        semanticMap[field];

      if (
        semanticType !== undefined &&
        !allowedTypes.has(
          semanticType
        )
      ) {
        return false;
      }

      continue;
    }

    // -----------------------------------------
    // Normal field
    // -----------------------------------------

    const semanticType =
      semanticMap[currentPath] ??
      semanticMap[field];

    if (
      semanticType === undefined
    ) {
      return false;
    }

    if (
      !allowedTypes.has(
        semanticType
      )
    ) {
      return false;
    }
  }

  return true;
};

// =============================================
// Generate Data
// =============================================

export const generateData = async (
  req,
  res
) => {
  try {
    // -----------------------------------------
    // Get request data
    // -----------------------------------------

    const {
      schema,
      records,
      method = "Batch",
      batchSize = 100,
      country = "India",
    } = req.body;

    // -----------------------------------------
    // Validate schema
    // -----------------------------------------

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

    // -----------------------------------------
    // Validate record count
    // -----------------------------------------

    const totalRecords =
      Number(records);

    if (
      !Number.isInteger(
        totalRecords
      ) ||
      totalRecords < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Records must be a positive integer",
      });
    }

    // -----------------------------------------
    // Validate batch size
    // -----------------------------------------

    const selectedBatchSize =
      Number(batchSize);

    if (
      method === "Batch"
    ) {
      if (
        !Number.isInteger(
          selectedBatchSize
        ) ||
        selectedBatchSize < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Batch size must be a positive integer",
        });
      }

      if (
        selectedBatchSize >
        totalRecords
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Batch size cannot be greater than total records",
        });
      }
    }

    // =========================================
    // AI SCHEMA INTERPRETATION
    // =========================================

    let normalizedSchema;

    try {
      normalizedSchema =
        await interpretSchema(schema);

      console.log(
        "AI semantic map:",
        normalizedSchema
      );

      if (
        !isValidSemanticMap(
          normalizedSchema,
          schema
        )
      ) {
        console.warn(
          "Invalid AI semantic map. Using rule-based fallback."
        );

        normalizedSchema =
          fallbackSchema(schema);

        console.log(
          "Rule-based fallback semantic map:",
          normalizedSchema
        );
      }
    } catch (error) {
      const errorMessage =
        error?.message || "";

      const isRateLimit =
        error?.status === 429 ||
        error?.statusCode === 429 ||
        errorMessage.includes("429") ||
        errorMessage
          .toLowerCase()
          .includes("rate limit") ||
        errorMessage
          .toLowerCase()
          .includes("quota") ||
        errorMessage
          .toLowerCase()
          .includes("limit exceeded");

      if (isRateLimit) {
        console.warn(
          "⚠️ AI limit exceeded. Using rule-based fallback."
        );
      } else {
        console.warn(
          "⚠️ AI unavailable. Using rule-based fallback."
        );
      }

      normalizedSchema =
        fallbackSchema(schema);

      console.log(
        "Fallback semantic map:",
        normalizedSchema
      );
    }

    // =========================================
    // Validate final semantic map
    // =========================================

    if (
      !isValidSemanticMap(
        normalizedSchema,
        schema
      )
    ) {
      console.warn(
        "Invalid semantic map after fallback."
      );

      return res.status(400).json({
        success: false,
        message:
          "Unable to interpret schema fields",
      });
    }

    // =========================================
    // MINI-BATCH GENERATION
    // =========================================

    if (
      method === "Batch"
    ) {
      console.log(
        `Starting Mini-Batch Generation | Total: ${totalRecords} | Batch Size: ${selectedBatchSize} | Country: ${country}`
      );

      // ---------------------------------------
      // NDJSON response headers
      // ---------------------------------------

      res.setHeader(
        "Content-Type",
        "application/x-ndjson"
      );

      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
      );

      res.setHeader(
        "Connection",
        "keep-alive"
      );

      // ---------------------------------------
      // Large datasets should not send the
      // complete generated data to browser.
      //
      // <= 10K:
      //     send batch data to frontend
      //
      // > 10K:
      //     send progress + metadata only
      // ---------------------------------------

      const sendBatchData = true;

      let clientDisconnected = false;

      // ---------------------------------------
      // Detect client disconnect
      // ---------------------------------------

      res.on(
        "close",
        () => {
          clientDisconnected = true;

          console.log(
            "Client connection closed."
          );
        }
      );

      try {
        // -------------------------------------
        // Generate batches
        // -------------------------------------

        const result =
          await generateBatch(
            schema,
            normalizedSchema,
            totalRecords,
            selectedBatchSize,
            country,
            async (batch) => {
              if (
                clientDisconnected
              ) {
                return;
              }

              const batchResponse = {
                type: "batch",

                batchNumber:
                  batch.batchNumber,

                batchSize:
                  batch.batchSize,

                totalGenerated:
                  batch.totalGenerated,

                totalRecords:
                  batch.totalRecords,

                data: sendBatchData
                  ? batch.data
                  : [],
              };

              const canContinue =
                res.write(
                  JSON.stringify(
                    batchResponse
                  ) + "\n"
                );

              console.log(
                `Batch ${batch.batchNumber} sent to client | Records: ${batch.batchSize} | Total: ${batch.totalGenerated}`
              );

              // ---------------------------------
              // If Node response buffer is full,
              // wait for drain before continuing.
              // ---------------------------------

              if (!canContinue) {
                await new Promise(
                  (resolve) => {
                    res.once(
                      "drain",
                      resolve
                    );
                  }
                );
              }
            }
          );

        // -------------------------------------
        // Stop if client disconnected
        // -------------------------------------

        if (
          clientDisconnected
        ) {
          console.log(
            "Stopping response because client disconnected."
          );

          return;
        }

        // -------------------------------------
        // MongoDB storage
        // -------------------------------------

        // MongoDB BSON has a 16 MB document limit.
        //
        // For small runs we store generated data.
        // For large benchmark runs we store only
        // metadata because the generated data can
        // be much larger than MongoDB's document limit.

        const shouldStoreData =
          totalRecords <= 10000;

        const generation =
          await Generation.create({
            userId:
              req.userId,

            schema,

            records:
              totalRecords,

            method:
              "Batch",

            generationTime:
              Number(
                result.generationTime
              ),

            memoryUsed:
              Number(
                result.memoryUsed
              ),

            data:
              shouldStoreData
                ? result.data
                : [],
          });

        console.log(
          "Generation metadata saved to MongoDB."
        );

        // -------------------------------------
        // Final completion metadata
        // -------------------------------------

        const completionResponse = {
          type: "complete",

          success: true,

          id:
            generation._id,

          method:
            "Batch",

          records:
            totalRecords,

          batchSize:
            result.batchSize,

          totalBatches:
            result.totalBatches,

          originalSchema:
            schema,

          normalizedSchema,

          country,

          generationTime:
            `${result.generationTime} ms`,

          memoryUsed:
            `${result.memoryUsed} MB`,

          dataStored:
            shouldStoreData,

          dataReturned:
            sendBatchData,
        };

        console.log(
          "Sending final completion metadata to client..."
        );

        res.write(
          JSON.stringify(
            completionResponse
          ) + "\n"
        );

        console.log(
          "Final completion metadata sent."
        );

        res.end();

      } catch (error) {
        console.error(
          "Mini-Batch Generation Error:",
          error
        );

        if (
          !res.headersSent
        ) {
          return res.status(500).json({
            success: false,
            message:
              "Mini-batch generation failed",
          });
        }

        res.end();
      }

      return;
    }

    // =========================================
    // STREAMING GENERATION
    // =========================================

    if (
      method === "Streaming"
    ) {
      console.log(
        `Starting Streaming Generation | Total: ${totalRecords} | Country: ${country}`
      );

      const stream =
        generateStreaming(
          schema,
          normalizedSchema,
          totalRecords,
          country,
          (result) => {
            console.log(
              "Streaming Generation Complete"
            );

            console.log(
              `Records: ${totalRecords}`
            );

            console.log(
              `Country: ${country}`
            );

            console.log(
              `Generation Time: ${result.generationTime} ms`
            );

            console.log(
              `Peak Memory Used: ${result.memoryUsed} MB`
            );
          }
        );

      // ---------------------------------------
      // NDJSON response headers
      // ---------------------------------------

      res.setHeader(
        "Content-Type",
        "application/x-ndjson"
      );

      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
      );

      // ---------------------------------------
      // Streaming error handling
      // ---------------------------------------

      stream.on(
        "error",
        (error) => {
          console.error(
            "Streaming Error:",
            error
          );

          if (
            !res.headersSent
          ) {
            res.status(500).json({
              success: false,
              message:
                "Streaming generation failed",
            });
          } else {
            res.end();
          }
        }
      );

      // ---------------------------------------
      // Pipe stream to response
      // ---------------------------------------

      stream.pipe(res);

      return;
    }

    // =========================================
    // INVALID METHOD
    // =========================================

    return res.status(400).json({
      success: false,
      message:
        "Invalid generation method",
    });

  } catch (error) {
    // -----------------------------------------
    // Global error handler
    // -----------------------------------------

    console.error(
      "Generation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Data generation failed",
      error:
        error.message,
    });
  }
};