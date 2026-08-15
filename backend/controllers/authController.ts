import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email va parol kiritilishi shart" });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Bu email bilan foydalanuvchi allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, phone, role, is_active, is_verified, created_at`,
      [first_name || "", last_name || "", email, phone || null, hashedPassword, role || "customer"]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error("❌ Register error:", error);
    res.status(500).json({ error: error.message || "Ro'yxatdan o'tishda xatolik yuz berdi" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email va parol kiritilishi shart" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Email yoki parol noto'g'ri" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _password, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: error.message || "Kirishda xatolik yuz berdi" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }

    const result = await pool.query(
      "SELECT id, first_name, last_name, email, phone, role, is_active, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    }

    res.json({ user: result.rows[0] });
  } catch (error: any) {
    console.error("❌ Me error:", error);
    res.status(500).json({ error: error.message || "Foydalanuvchi ma'lumotlarini olishda xatolik" });
  }
};
