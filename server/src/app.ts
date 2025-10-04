import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import gameRoutes from "./routes/game";
import storeRoutes from "./routes/store";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174"], 
  credentials: true 
}));

// Health check (no auth required)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", gameRoutes);
app.use("/api/store", storeRoutes);

export default app;
