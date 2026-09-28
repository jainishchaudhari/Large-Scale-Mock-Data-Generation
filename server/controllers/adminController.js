import User from "../models/User.js";
import Generation from "../models/Generation.js";

// =============================================
// Admin Dashboard Statistics
// =============================================

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const generationStats = await Generation.aggregate([
      {
        $group: {
          _id: null,

          totalGenerations: {
            $sum: 1,
          },

          totalRecords: {
            $sum: "$records",
          },

          batchGenerations: {
            $sum: {
              $cond: [
                {
                  $eq: ["$method", "Batch"],
                },
                1,
                0,
              ],
            },
          },

          streamingGenerations: {
            $sum: {
              $cond: [
                {
                  $eq: ["$method", "Streaming"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = generationStats[0] || {
      totalGenerations: 0,
      totalRecords: 0,
      batchGenerations: 0,
      streamingGenerations: 0,
    };

    return res.json({
      success: true,

      stats: {
        totalUsers,

        totalGenerations:
          stats.totalGenerations,

        totalRecords:
          stats.totalRecords,

        batchGenerations:
          stats.batchGenerations,

        streamingGenerations:
          stats.streamingGenerations,
      },
    });
  } catch (error) {
    console.error(
      "Admin Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};

// =============================================
// Get All Users
// =============================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "name email role createdAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Get All Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// =============================================
// Get All Generations
// =============================================

export const getAllGenerations = async (
  req,
  res
) => {
  try {
    const generations =
      await Generation.find()
        .populate(
          "userId",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      generations,
    });
  } catch (error) {
    console.error(
      "Get All Generations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch generation history",
      error: error.message,
    });
  }
};