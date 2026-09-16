import Generation from "../models/Generation.js";

export const getResults = async (req, res) => {
  try {
    const results = await Generation.find()
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(
      "Fetch Results Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};