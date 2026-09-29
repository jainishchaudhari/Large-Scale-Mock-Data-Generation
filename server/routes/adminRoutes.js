import express from "express";

import {
  getAdminStats,
  getAllUsers,
  getAllGenerations,
  updateUserRole,
  deleteUser,
  deleteGeneration,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();


// =============================================
// Admin Protected Routes
// =============================================


// =============================================
// Dashboard Statistics
// =============================================

router.get(
  "/stats",
  protect,
  adminOnly,
  getAdminStats
);


// =============================================
// Get All Users
// =============================================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);


// =============================================
// Update User Role
// =============================================

router.patch(
  "/users/:userId/role",
  protect,
  adminOnly,
  updateUserRole
);


// =============================================
// Delete User
// =============================================

router.delete(
  "/users/:userId",
  protect,
  adminOnly,
  deleteUser
);


// =============================================
// Get All Generations
// =============================================

router.get(
  "/generations",
  protect,
  adminOnly,
  getAllGenerations
);


// =============================================
// Delete Generation
// =============================================

router.delete(
  "/generations/:generationId",
  protect,
  adminOnly,
  deleteGeneration
);


export default router;