import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/game";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: ["http://localhost:5173"], 
  credentials: true 
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", gameRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
