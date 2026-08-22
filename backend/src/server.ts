import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import apiRoutes from "./routes/api";
import { registerSocketHandlers } from "./socket/socketHandler";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pulse_chat";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Configure Socket.io
export const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use("/api", apiRoutes);

// Register Socket handlers
registerSocketHandlers(io);

// Connect to MongoDB & Start Server
async function startServer() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB Atlas successfully!");

    server.listen(PORT, () => {
      console.log(`✓ PulseChat Express Backend is running on http://localhost:${PORT}`);
      console.log(`✓ Health Check: http://localhost:${PORT}/health`);
      console.log(`✓ API Base: http://localhost:${PORT}/api`);
    });
  } catch (err: any) {
    console.error("Failed to connect to MongoDB Atlas:", err.message);
    console.log("Starting server without DB connection for local testing...");
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT} (Database pending)`);
    });
  }
}

startServer();

export default app;
