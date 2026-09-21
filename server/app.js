import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import generatorRoutes from "./routes/generatorRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { interpretSchema } from "./services/aiSchemaInterpreter.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mock Data Generator API is running",
  });
});

// ==============================
// Gemini API Test
// ==============================

app.get("/api/test-gemini", async (req, res) => {
  try {
    const result = await interpretSchema({
      fullName: "string",
      emailAddress: "string",
      userAge: "number",
      homeCity: "string",
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gemini Test Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.use("/api", generatorRoutes);

app.use("/api/auth", authRoutes);

export default app;