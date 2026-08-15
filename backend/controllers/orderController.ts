import { Request, Response } from "express";
import { pool } from "../db";

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Orders could not be fetched" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Order could not be fetched" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { user_id, status, total, address, phone } = req.body;
    const result = await pool.query(
      "INSERT INTO orders (user_id, status, total, address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, status || "pending", total, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Order could not be created" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, total, address, phone } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status = COALESCE($2, status), total = COALESCE($3, total), address = COALESCE($4, address), phone = COALESCE($5, phone) WHERE id = $1 RETURNING *`,
      [id, status, total, address, phone]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Order could not be updated" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: "Order could not be deleted" });
  }
};

export const getOrderItems = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM order_items ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Order items could not be fetched" });
  }
};

export const createOrderItem = async (req: Request, res: Response) => {
  try {
    const { order_id, variant_id, quantity, price } = req.body;
    const result = await pool.query(
      "INSERT INTO order_items (order_id, variant_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [order_id, variant_id, quantity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Order item could not be created" });
  }
};
