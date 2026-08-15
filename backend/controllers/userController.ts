import { Request, Response } from "express";
import { pool } from "../db";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Users could not be fetched" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "User could not be fetched" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
      is_active,
      is_verified,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password, role, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [first_name, last_name, email, phone, password, role || "customer", is_active ?? true, is_verified ?? false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "User could not be created" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const columns: string[] = [];
    const values: any[] = [];

    Object.entries(fields).forEach(([key, value], index) => {
      columns.push(`${key} = $${index + 2}`);
      values.push(value);
    });

    values.unshift(id);

    const result = await pool.query(
      `UPDATE users SET ${columns.join(", ")}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "User could not be updated" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "User could not be deleted" });
  }
};

export const getCarts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM carts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Carts could not be fetched" });
  }
};

export const getCartById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM carts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Cart could not be fetched" });
  }
};

export const createCart = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const result = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Cart could not be created" });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const result = await pool.query(
      `UPDATE carts SET user_id = COALESCE($2, user_id) WHERE id = $1 RETURNING *`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Cart could not be updated" });
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM carts WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.json({ message: "Cart deleted" });
  } catch (error) {
    res.status(500).json({ error: "Cart could not be deleted" });
  }
};

export const getCartItems = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM cart_items ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Cart items could not be fetched" });
  }
};

export const createCartItem = async (req: Request, res: Response) => {
  try {
    const { cart_id, variant_id, quantity } = req.body;
    const result = await pool.query(
      "INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [cart_id, variant_id, quantity ?? 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Cart item could not be created" });
  }
};

export const getReviews = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Reviews could not be fetched" });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM reviews WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Review could not be fetched" });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;
    const result = await pool.query(
      "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, product_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Review could not be created" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const result = await pool.query(
      `UPDATE reviews SET rating = COALESCE($2, rating), comment = COALESCE($3, comment) WHERE id = $1 RETURNING *`,
      [id, rating, comment]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Review could not be updated" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ error: "Review could not be deleted" });
  }
};
