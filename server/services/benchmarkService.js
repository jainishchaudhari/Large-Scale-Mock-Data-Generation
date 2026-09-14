import { generateBatch } from "./batchGenerator.js";
import { generateStreaming } from "./streamingGenerator.js";

const datasetSizes = [1000, 5000, 10000];

const defaultSchema = {
  name: "name",
  email: "email",
  age: "number",
  city: "city",
  country: "country",
};

const runStreamingBenchmark = (schema, records) => {
  return new Promise((resolve, reject) => {
    try {
      const stream = generateStreaming(schema, records, (result) => {
        resolve({
          time: Number(result.generationTime),
          memory: Number(result.memoryUsed),
        });
      });

      stream.on("error", reject);

      // Consume the stream completely
      stream.resume();
    } catch (error) {
      reject(error);
    }
  });
};

export const runBenchmark = async (schema = defaultSchema) => {
  const results = [];

  for (const records of datasetSizes) {
    console.log(`\nBenchmarking ${records} records...`);

    // -------------------------
    // Batch
    // -------------------------
    const batchResult = generateBatch(schema, records);

    // -------------------------
    // Streaming
    // -------------------------
    const streamingResult = await runStreamingBenchmark(schema, records);

    results.push({
      records,

      batch: {
        generationTime: batchResult.generationTime,
        memoryUsed: batchResult.memoryUsed,
        throughput: (
          records /
          (Number(batchResult.generationTime) / 1000)
        ).toFixed(2),
      },

      streaming: {
        generationTime: streamingResult.time.toFixed(2),

        memoryUsed: streamingResult.memory.toFixed(2),

        throughput: (records / (streamingResult.time / 1000)).toFixed(2),
      },
    });
  }

  return results;
};
