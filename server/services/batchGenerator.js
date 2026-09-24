import { generateRecord } from "./mockGenerator.js";

export const generateBatch = async (
  schema,
  semanticMap,
  totalRecords,
  batchSize,
  country = "India",
  onBatch
) => {
  const startTime = performance.now();

  const startMemory =
    process.memoryUsage().rss;

  let peakMemory = startMemory;

  let generatedRecords = 0;
  let batchNumber = 0;

  const allData = [];

  while (
    generatedRecords < totalRecords
  ) {
    batchNumber++;

    const currentBatchSize =
      Math.min(
        batchSize,
        totalRecords - generatedRecords
      );

    const batchData = [];

    console.log(
      `Generating Batch ${batchNumber} | Records: ${currentBatchSize} | Country: ${country}`
    );

    // -----------------------------------------
    // Generate current batch
    // -----------------------------------------

    for (
      let i = 0;
      i < currentBatchSize;
      i++
    ) {
      const record = {
        id:
          generatedRecords +
          i +
          1,

        ...generateRecord(
          schema,
          semanticMap,
          country
        ),
      };

      batchData.push(record);

      // ---------------------------------------
      // Track peak memory
      // ---------------------------------------

      const currentMemory =
        process.memoryUsage().rss;

      if (
        currentMemory > peakMemory
      ) {
        peakMemory =
          currentMemory;
      }
    }

    generatedRecords +=
      currentBatchSize;

    // -----------------------------------------
    // Keep complete dataset
    // -----------------------------------------

    allData.push(
      ...batchData
    );

    console.log(
      `Batch ${batchNumber} Complete | Total Generated: ${generatedRecords}`
    );

    // -----------------------------------------
    // Send batch immediately
    // -----------------------------------------

    await onBatch({
      batchNumber,
      batchSize:
        currentBatchSize,
      totalGenerated:
        generatedRecords,
      totalRecords,
      data:
        batchData,
    });

    // -----------------------------------------
    // Give Node.js event loop a chance
    // -----------------------------------------

    await new Promise(
      (resolve) =>
        setImmediate(resolve)
    );
  }

  // -------------------------------------------
  // Performance calculation
  // -------------------------------------------

  const endTime =
    performance.now();

  const generationTime = (
    endTime - startTime
  ).toFixed(2);

  const memoryUsed = (
    (peakMemory - startMemory) /
    1024 /
    1024
  ).toFixed(2);

  // -------------------------------------------
  // Performance logs
  // -------------------------------------------

  console.log(
    "--------------------------------"
  );

  console.log(
    "Mini-Batch Generation Complete"
  );

  console.log(
    `Total Records: ${totalRecords}`
  );

  console.log(
    `Batch Size: ${batchSize}`
  );

  console.log(
    `Total Batches: ${batchNumber}`
  );

  console.log(
    `Country: ${country}`
  );

  console.log(
    `Generation Time: ${generationTime} ms`
  );

  console.log(
    `Peak Memory Used: ${memoryUsed} MB`
  );

  console.log(
    "--------------------------------"
  );

  // -------------------------------------------
  // Return result
  // -------------------------------------------

  return {
    data:
      allData,

    generationTime,

    memoryUsed,

    batchSize,

    totalBatches:
      batchNumber,
  };
};