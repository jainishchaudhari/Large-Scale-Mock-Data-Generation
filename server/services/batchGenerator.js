import { generateRecord } from "./mockGenerator.js";

export const generateBatch = (schema, totalRecords) => {
  const startTime = performance.now();

  const startMemory = process.memoryUsage().rss;
  let peakMemory = startMemory;

  const data = [];

  for (let i = 0; i < totalRecords; i++) {
    const record = {
      id: i + 1,
      ...generateRecord(schema),
    };

    data.push(record);

    // Check peak memory
    const currentMemory = process.memoryUsage().rss;

    if (currentMemory > peakMemory) {
      peakMemory = currentMemory;
    }
  }

  const endTime = performance.now();

  const generationTime = (
    endTime - startTime
  ).toFixed(2);

  const memoryUsed = (
    (peakMemory - startMemory) /
    1024 /
    1024
  ).toFixed(2);

  console.log("Batch Generation Complete");
  console.log(`Records: ${totalRecords}`);
  console.log(`Generation Time: ${generationTime} ms`);
  console.log(`Peak Memory Used: ${memoryUsed} MB`);

  return {
    data,
    generationTime,
    memoryUsed,
  };
};