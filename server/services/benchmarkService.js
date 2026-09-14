import { generateBatch } from "./batchGenerator.js";
import { generateStreaming } from "./streamingGenerator.js";
import { generateSync } from "./syncGenerator.js";
import { generateAsync } from "./asyncGenerator.js";

const datasetSizes = [1000, 5000, 10000];

const NUMBER_OF_RUNS = 5;

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
      const stream = generateStreaming(
        schema,
        records,
        (result) => {
          resolve({
            time: Number(result.generationTime),
            memory: Number(result.memoryUsed),
          });
        }
      );

      stream.on("error", reject);

      stream.resume();
    } catch (error) {
      reject(error);
    }
  });
};

const calculateAverage = (values) => {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce(
    (sum, value) => sum + Number(value),
    0
  );

  return total / values.length;
};

const createMetrics = (
  timeValues,
  memoryValues,
  records
) => {
  const averageTime = calculateAverage(
    timeValues
  );

  const averageMemory = calculateAverage(
    memoryValues
  );

  const averageThroughput =
    records / (averageTime / 1000);

  return {
    generationTime: averageTime.toFixed(2),
    memoryUsed: averageMemory.toFixed(2),
    throughput: averageThroughput.toFixed(2),
  };
};

export const runBenchmark = async (
  schema = defaultSchema
) => {
  const results = [];

  for (const records of datasetSizes) {
    console.log(
      `\n================================`
    );

    console.log(
      `Benchmarking ${records} records`
    );

    console.log(
      `Runs: ${NUMBER_OF_RUNS}`
    );

    console.log(
      `================================`
    );

    const batchTimes = [];
    const batchMemory = [];

    const streamingTimes = [];
    const streamingMemory = [];

    const syncTimes = [];
    const syncMemory = [];

    const asyncTimes = [];
    const asyncMemory = [];

    for (
      let run = 1;
      run <= NUMBER_OF_RUNS;
      run++
    ) {
      console.log(
        `\nRun ${run}/${NUMBER_OF_RUNS}`
      );

      // =========================
      // Batch
      // =========================

      const batchResult = generateBatch(
        schema,
        records
      );

      batchTimes.push(
        Number(batchResult.generationTime)
      );

      batchMemory.push(
        Number(batchResult.memoryUsed)
      );

      // =========================
      // Streaming
      // =========================

      const streamingResult =
        await runStreamingBenchmark(
          schema,
          records
        );

      streamingTimes.push(
        streamingResult.time
      );

      streamingMemory.push(
        streamingResult.memory
      );

      // =========================
      // Sync
      // =========================

      const syncResult = generateSync(
        schema,
        records
      );

      syncTimes.push(
        Number(syncResult.generationTime)
      );

      syncMemory.push(
        Number(syncResult.memoryUsed)
      );

      // =========================
      // Async
      // =========================

      const asyncResult =
        await generateAsync(
          schema,
          records
        );

      asyncTimes.push(
        Number(asyncResult.generationTime)
      );

      asyncMemory.push(
        Number(asyncResult.memoryUsed)
      );
    }

    // =========================
    // Average Results
    // =========================

    results.push({
      records,

      runs: NUMBER_OF_RUNS,

      batch: createMetrics(
        batchTimes,
        batchMemory,
        records
      ),

      streaming: createMetrics(
        streamingTimes,
        streamingMemory,
        records
      ),

      sync: createMetrics(
        syncTimes,
        syncMemory,
        records
      ),

      async: createMetrics(
        asyncTimes,
        asyncMemory,
        records
      ),
    });
  }

  return results;
};