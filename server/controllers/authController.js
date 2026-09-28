import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Generation from "../models/Generation.js";

// =============================================
// Signup
// =============================================

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create JWT token immediately after signup
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Signup Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message,
    });
  }
};


// =============================================
// Login
// =============================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


// =============================================
// Get Logged-in User Profile
// =============================================

export const getProfile = async (
  req,
  res
) => {
  try {
    // -----------------------------------------
    // Find logged-in user
    // -----------------------------------------

    const user = await User.findById(
      req.userId
    ).select(
      "name email role createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // -----------------------------------------
    // Calculate generation statistics
    // -----------------------------------------

    const generationStats =
      await Generation.aggregate([
        {
          $match: {
            userId: user._id,
          },
        },

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


    // -----------------------------------------
    // Default statistics
    // -----------------------------------------

    const stats =
      generationStats[0] || {
        totalGenerations: 0,
        totalRecords: 0,
        batchGenerations: 0,
        streamingGenerations: 0,
      };


    // -----------------------------------------
    // Send profile response
    // -----------------------------------------

    return res.json({
      success: true,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },

      stats: {
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
      "Get Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch profile",
      error: error.message,
    });
  }
};