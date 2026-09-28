import User from "../models/User.js";

export const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Admin Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify admin access",
      error: error.message,
    });
  }
};