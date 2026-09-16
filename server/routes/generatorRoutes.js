import express from "express";

import {
  generateData,
} from "../controllers/generatorController.js";

import {
  benchmarkData,
} from "../controllers/benchmarkController.js";

import {
  getResults,
} from "../controllers/resultController.js";

const router = express.Router();

router.post(
  "/generate",
  generateData
);

router.post(
  "/benchmark",
  benchmarkData
);

router.get(
  "/results",
  getResults
);

export default router;