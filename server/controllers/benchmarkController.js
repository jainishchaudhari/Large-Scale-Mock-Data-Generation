import { runBenchmark } from "../services/benchmarkService.js";

export const benchmarkData = async (req, res) => {
  try {
    const { schema } = req.body;

    const result = await runBenchmark(schema);

    return res.json({
      success: true,
      results: result,
    });
  } catch (error) {
    console.error("Benchmark Error:", error);

    return res.status(500).json({
      success: false,
      message: "Benchmark failed",
      error: error.message,
    });
  }
};