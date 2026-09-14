import { Readable } from "stream";
import { generateRecord } from "./mockGenerator.js";

export const generateStreaming = (schema, totalRecords, onComplete) => {
  const startMemory = process.memoryUsage().rss;
  let peakMemory = startMemory;

  const startTime = performance.now();

  let currentId = 1;

  const stream = new Readable({
    read() {
      if (currentId > totalRecords) {
        this.push(null);
        return;
      }

      const record = {
        id: currentId,
        ...generateRecord(schema),
      };

      currentId++;

      const currentMemory = process.memoryUsage().rss;

      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }

      this.push(JSON.stringify(record) + "\n");
    },
  });

  stream.on("end", () => {
    const endTime = performance.now();

    const generationTime = (
      endTime - startTime
    ).toFixed(2);

    const memoryUsed = (
      (peakMemory - startMemory) /
      1024 /
      1024
    ).toFixed(2);

    if (onComplete) {
      onComplete({
        generationTime,
        memoryUsed,
      });
    }
  });

  return stream;
};