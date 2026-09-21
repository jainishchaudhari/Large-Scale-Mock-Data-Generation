import express from "express";

import { generateData } from "../controllers/generatorController.js";
import { benchmarkData } from "../controllers/benchmarkController.js";
import { getResults } from "../controllers/resultController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateData);

router.post("/benchmark", protect, benchmarkData);

router.get("/results", protect, getResults);

export default router;