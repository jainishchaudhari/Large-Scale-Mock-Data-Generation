import User from "../models/User.js";
import Generation from "../models/Generation.js";

// =============================================
// Admin Dashboard Statistics
// =============================================

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const generationStats =
      await Generation.aggregate([
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
                    $eq: [
                      "$method",
                      "Batch",
                    ],
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
                    $eq: [
                      "$method",
                      "Streaming",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const stats =
      generationStats[0] || {
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
      message:
        "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};


// =============================================
// Get All Users
// =============================================

export const getAllUsers = async (
  req,
  res
) => {
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


// =============================================
// Update User Role
// =============================================

export const updateUserRole = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (
      !["user", "admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Prevent admin from changing own role
    if (
      userId === req.userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own role",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    return res.json({
      success: true,

      message:
        "User role updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update User Role Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user role",
      error: error.message,
    });
  }
};


// =============================================
// Delete User
// =============================================

export const deleteUser = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting own account
    if (
      userId === req.userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete all generation metadata
    // belonging to this user
    await Generation.deleteMany({
      userId: user._id,
    });

    // Delete the user
    await User.findByIdAndDelete(
      userId
    );

    return res.json({
      success: true,

      message:
        "User and associated generation history deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete user",
      error: error.message,
    });
  }
};


// =============================================
// Delete Generation
// =============================================

export const deleteGeneration = async (
  req,
  res
) => {
  try {
    const { generationId } = req.params;

    const generation =
      await Generation.findById(
        generationId
      );

    if (!generation) {
      return res.status(404).json({
        success: false,
        message:
          "Generation not found",
      });
    }

    await Generation.findByIdAndDelete(
      generationId
    );

    return res.json({
      success: true,

      message:
        "Generation record deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Generation Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete generation record",

      error: error.message,
    });
  }
};