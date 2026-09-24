import { Readable } from "stream";
import { generateRecord } from "./mockGenerator.js";

export const generateStreaming = (
  schema,
  semanticMap,
  totalRecords,
  country = "India",
  onComplete
) => {
  const startMemory =
    process.memoryUsage().rss;

  let peakMemory = startMemory;

  const startTime =
    performance.now();

  let currentId = 1;
  let completed = false;

  const stream = new Readable({
    read() {
      if (currentId > totalRecords) {
        if (!completed) {
          completed = true;

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

          this.push(
            JSON.stringify({
              __metadata: true,
              generationTime,
              memoryUsed,
            }) + "\n"
          );

          if (onComplete) {
            onComplete({
              generationTime,
              memoryUsed,
            });
          }
        }

        this.push(null);
        return;
      }

      // --------------------------------
      // Generate one record
      // --------------------------------

      const record = {
        id: currentId,

        ...generateRecord(
          schema,
          semanticMap,
          country
        ),
      };

      currentId++;

      // --------------------------------
      // Track memory
      // --------------------------------

      const currentMemory =
        process.memoryUsage().rss;

      if (
        currentMemory > peakMemory
      ) {
        peakMemory = currentMemory;
      }

      // --------------------------------
      // Send JSONL record
      // --------------------------------

      this.push(
        JSON.stringify(record) + "\n"
      );
    },
  });

  return stream;
};