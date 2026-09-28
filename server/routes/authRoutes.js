import express from "express";

import {
  signup,
  login,
  getProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================================
// Public Authentication Routes
// =============================================

router.post("/signup", signup);

router.post("/login", login);

// =============================================
// Protected User Routes
// =============================================

router.get(
  "/profile",
  protect,
  getProfile
);

export default router;