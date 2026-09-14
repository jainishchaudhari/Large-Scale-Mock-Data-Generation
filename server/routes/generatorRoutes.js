import express from "express";

import {
  generateData,
} from "../controllers/generatorController.js";

import {
  benchmarkData,
} from "../controllers/benchmarkController.js";

const router = express.Router();

router.post("/generate", generateData);

router.post("/benchmark", benchmarkData);

export default router;