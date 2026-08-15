import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 20000, // Neon drop qilishidan oldin idle clientlarni 20s da tozalash
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

// Neon Cloud idle ulanishni yopganda process o'chib qolmasligi uchun handler
pool.on("error", (err) => {
  console.error("⚠️ Database pool idle client xatoligi (boshqarildi):", err.message);
});