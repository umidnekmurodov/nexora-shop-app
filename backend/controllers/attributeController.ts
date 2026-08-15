import { Request, Response } from "express";
import { pool } from "../db";

export const getGenders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM genders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Genders could not be fetched" });
  }
};

export const getGenderById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM genders WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gender not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Gender could not be fetched" });
  }
};

export const createGender = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const result = await pool.query(
      "INSERT INTO genders (name, slug) VALUES ($1, $2) RETURNING *",
      [name, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Gender could not be created" });
  }
};

export const updateGender = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const result = await pool.query(
      `UPDATE genders
       SET name = COALESCE($2, name), slug = COALESCE($3, slug)
       WHERE id = $1 RETURNING *`,
      [id, name, slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gender not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Gender could not be updated" });
  }
};

export const deleteGender = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM genders WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gender not found" });
    }
    res.json({ message: "Gender deleted" });
  } catch (error) {
    res.status(500).json({ error: "Gender could not be deleted" });
  }
};

export const getBrands = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM brands ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Brands could not be fetched" });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM brands WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Brand could not be fetched" });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, logo } = req.body;
    const result = await pool.query(
      "INSERT INTO brands (name, logo) VALUES ($1, $2) RETURNING *",
      [name, logo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Brand could not be created" });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;
    const result = await pool.query(
      `UPDATE brands
       SET name = COALESCE($2, name), logo = COALESCE($3, logo)
       WHERE id = $1 RETURNING *`,
      [id, name, logo]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Brand could not be updated" });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM brands WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ error: "Brand could not be deleted" });
  }
};
