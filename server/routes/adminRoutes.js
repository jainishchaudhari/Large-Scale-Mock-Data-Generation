import express from "express";

import {
  getAdminStats,
  getAllUsers,
  getAllGenerations,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// =============================================
// Admin Protected Routes
// =============================================

// Dashboard statistics
router.get(
  "/stats",
  protect,
  adminOnly,
  getAdminStats
);

// All users
router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

// All generations
router.get(
  "/generations",
  protect,
  adminOnly,
  getAllGenerations
);

export default router;