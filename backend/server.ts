import express from "express";
import { pool } from "./db";

import userRoutes from "./rotes/userRoutes";
import catalogRoutes from "./rotes/catalogRoutes";
import orderRoutes from "./rotes/orderRoutes";
import authRoutes from "./rotes/authRoutes";
import attributeRoutes from "./rotes/attributeRoutes";

import cors from "cors";

const app = express();

// Allow all localhost origins (5173, 5174, 127.0.0.1)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", catalogRoutes); // Public browsing + Admin CRUD
app.use("/api", attributeRoutes);
app.use("/api", orderRoutes);

// Kutilmagan xatoliklarda process o'chib ketmasligini ta'minlash
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason);
});

async function start() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected");

    // 0.0.0.0 orqali barcha tarmoq interfeyslarida (localhost, 127.0.0.1, IPv6) eshitish
    app.listen(3000, "0.0.0.0", () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

start();