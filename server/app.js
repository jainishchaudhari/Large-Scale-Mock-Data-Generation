import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import generatorRoutes from "./routes/generatorRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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

app.use("/api", generatorRoutes);

app.use("/api/auth", authRoutes);

export default app;