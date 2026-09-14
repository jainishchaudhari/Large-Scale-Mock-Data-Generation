import express from "express";
import cors from "cors";

import generatorRoutes from "./routes/generatorRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mock Data Generator API is running",
  });
});

app.use("/api", generatorRoutes);

export default app;