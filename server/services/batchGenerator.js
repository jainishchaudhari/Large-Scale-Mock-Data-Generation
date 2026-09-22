import { generateRecord } from "./mockGenerator.js";

export const generateBatch = async (
  schema,
  totalRecords,
  batchSize,
  onBatch
) => {
  const startTime = performance.now();

  const startMemory = process.memoryUsage().rss;
  let peakMemory = startMemory;

  let generatedRecords = 0;
  let batchNumber = 0;

  const allData = [];

  while (generatedRecords < totalRecords) {
    batchNumber++;

    const currentBatchSize = Math.min(
      batchSize,
      totalRecords - generatedRecords
    );

    const batchData = [];

    console.log(
      `Generating Batch ${batchNumber} | Records: ${currentBatchSize}`
    );

    for (let i = 0; i < currentBatchSize; i++) {
      const record = {
        id: generatedRecords + i + 1,
        ...generateRecord(schema),
      };

      batchData.push(record);

      const currentMemory = process.memoryUsage().rss;

      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }
    }

    generatedRecords += currentBatchSize;

    // Keep complete dataset for MongoDB storage
    allData.push(...batchData);

    console.log(
      `Batch ${batchNumber} Complete | Total Generated: ${generatedRecords}`
    );

    // Send this batch immediately
    await onBatch({
      batchNumber,
      batchSize: currentBatchSize,
      totalGenerated: generatedRecords,
      totalRecords,
      data: batchData,
    });

    // Give Node.js event loop a chance to send the response
    await new Promise((resolve) => setImmediate(resolve));
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

  console.log("--------------------------------");
  console.log("Mini-Batch Generation Complete");
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Batch Size: ${batchSize}`);
  console.log(`Total Batches: ${batchNumber}`);
  console.log(`Generation Time: ${generationTime} ms`);
  console.log(`Peak Memory Used: ${memoryUsed} MB`);
  console.log("--------------------------------");

  return {
    data: allData,
    generationTime,
    memoryUsed,
    batchSize,
    totalBatches: batchNumber,
  };
};