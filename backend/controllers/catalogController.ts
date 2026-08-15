import { Request, Response } from "express";
import { pool } from "../db";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Categories could not be fetched" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Category could not be fetched" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parent_id, image } = req.body;
    const result = await pool.query(
      "INSERT INTO categories (name, slug, parent_id, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, slug, parent_id, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Category could not be created" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id, image } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($2, name), slug = COALESCE($3, slug), parent_id = COALESCE($4, parent_id), image = COALESCE($5, image)
       WHERE id = $1 RETURNING *`,
      [id, name, slug, parent_id, image]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Category could not be updated" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Category could not be deleted" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { gender, category, brand, size, color, search, minPrice, maxPrice, is_active } = req.query;

    let query = `
      SELECT 
        p.*, 
        c.slug AS category_slug, 
        c.name AS category_name,
        COALESCE(
          (
            SELECT json_agg(pi.image_url ORDER BY pi.is_main DESC, pi.id)
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::json
        ) AS images,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_main DESC, pi.id 
          LIMIT 1
        ) AS main_image,
        COALESCE(
          (
            SELECT json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name))
            FROM product_variants pv
            JOIN sizes s ON s.id = pv.size_id
            WHERE pv.product_id = p.id
          ),
          '[]'::json
        ) AS sizes,
        COALESCE(
          (
            SELECT json_agg(DISTINCT jsonb_build_object('id', cl.id, 'name', cl.name, 'hex', cl.hex))
            FROM product_variants pv
            JOIN colors cl ON cl.id = pv.color_id
            WHERE pv.product_id = p.id
          ),
          '[]'::json
        ) AS colors
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const values: any[] = [];
    let index = 1;

    if (gender) {
      const gStr = String(gender).toLowerCase();
      if (gStr === 'male' || gStr === 'men') {
        query += ` AND (LOWER(p.gender) = 'male' OR LOWER(p.gender) = 'men' OR LOWER(p.gender) = 'unisex')`;
      } else if (gStr === 'female' || gStr === 'women') {
        query += ` AND (LOWER(p.gender) = 'female' OR LOWER(p.gender) = 'women' OR LOWER(p.gender) = 'unisex')`;
      } else {
        query += ` AND LOWER(p.gender) = $${index}`;
        values.push(gStr);
        index += 1;
      }
    }

   if (is_active !== undefined) {
  query += ` AND p.is_active = $${index}`;
  values.push(is_active === 'true');  // ✅ tuzatilgan
  index += 1;
}

    if (category) {
      query += ` AND (c.slug = $${index} OR c.id::text = $${index} OR LOWER(c.name) = LOWER($${index}))`;
      values.push(String(category));
      index += 1;
    }

    if (brand) {
      query += ` AND LOWER(p.brand) = $${index}`;
      values.push(String(brand).toLowerCase());
      index += 1;
    }

    if (size) {
      query += ` AND EXISTS (
        SELECT 1 FROM product_variants pv
        LEFT JOIN sizes s ON s.id = pv.size_id
        WHERE pv.product_id = p.id AND LOWER(s.name) = $${index}
      )`;
      values.push(String(size).toLowerCase());
      index += 1;
    }

    if (color) {
      query += ` AND EXISTS (
        SELECT 1 FROM product_variants pv
        LEFT JOIN colors cl ON cl.id = pv.color_id
        WHERE pv.product_id = p.id AND LOWER(cl.name) = $${index}
      )`;
      values.push(String(color).toLowerCase());
      index += 1;
    }

    if (search) {
      query += ` AND (
        LOWER(p.name) LIKE $${index}
        OR LOWER(p.description) LIKE $${index}
        OR LOWER(p.slug) LIKE $${index}
      )`;
      values.push(`%${String(search).toLowerCase()}%`);
      index += 1;
    }

    if (minPrice) {
      query += ` AND p.price >= $${index}`;
      values.push(Number(minPrice));
      index += 1;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${index}`;
      values.push(Number(maxPrice));
      index += 1;
    }

    query += " ORDER BY p.created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Products could not be fetched" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.*, 
        c.slug AS category_slug, 
        c.name AS category_name,
        COALESCE(
          (
            SELECT json_agg(pi.image_url ORDER BY pi.is_main DESC, pi.id)
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::json
        ) AS images,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_main DESC, pi.id 
          LIMIT 1
        ) AS main_image,
        COALESCE(
          (
            SELECT json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name))
            FROM product_variants pv
            JOIN sizes s ON s.id = pv.size_id
            WHERE pv.product_id = p.id
          ),
          '[]'::json
        ) AS sizes,
        COALESCE(
          (
            SELECT json_agg(DISTINCT jsonb_build_object('id', cl.id, 'name', cl.name, 'hex', cl.hex))
            FROM product_variants pv
            JOIN colors cl ON cl.id = pv.color_id
            WHERE pv.product_id = p.id
          ),
          '[]'::json
        ) AS colors
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product could not be fetched" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { category_id, gender, brand, name, slug, description, price, discount, is_active } = req.body;
    const result = await pool.query(
      "INSERT INTO products (category_id, gender, brand, name, slug, description, price, discount, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [category_id, gender || null, brand || null, name, slug, description, price, discount ?? 0, is_active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product could not be created" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, gender, brand, name, slug, description, price, discount, is_active } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET category_id = COALESCE($2, category_id), gender = COALESCE($3, gender), brand = COALESCE($4, brand), name = COALESCE($5, name), slug = COALESCE($6, slug), description = COALESCE($7, description), price = COALESCE($8, price), discount = COALESCE($9, discount), is_active = COALESCE($10, is_active), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, category_id, gender, brand, name, slug, description, price, discount, is_active]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product could not be updated" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Avval bog'liq yozuvlarni o'chiramiz
    await pool.query("DELETE FROM product_images WHERE product_id = $1", [id]);
    await pool.query("DELETE FROM product_variants WHERE product_id = $1", [id]);
    await pool.query("DELETE FROM reviews WHERE product_id = $1", [id]);

    // Endi mahsulotni o'chiramiz
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Product could not be deleted" });
  }
};
export const getSizes = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM sizes ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Sizes could not be fetched" });
  }
};

export const createSize = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await pool.query("INSERT INTO sizes (name) VALUES ($1) RETURNING *", [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Size could not be created" });
  }
};

export const getColors = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM colors ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Colors could not be fetched" });
  }
};

export const createColor = async (req: Request, res: Response) => {
  try {
    const { name, hex } = req.body;
    const result = await pool.query("INSERT INTO colors (name, hex) VALUES ($1, $2) RETURNING *", [name, hex]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Color could not be created" });
  }
};

export const getProductVariants = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM product_variants ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Product variants could not be fetched" });
  }
};

export const getProductVariantById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM product_variants WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product variant could not be fetched" });
  }
};

export const createProductVariant = async (req: Request, res: Response) => {
  try {
    const { product_id, size_id, color_id, stock, sku } = req.body;
    const result = await pool.query(
      "INSERT INTO product_variants (product_id, size_id, color_id, stock, sku) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [product_id, size_id, color_id, stock ?? 0, sku]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product variant could not be created" });
  }
};

export const updateProductVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id, size_id, color_id, stock, sku } = req.body;
    const result = await pool.query(
      `UPDATE product_variants
       SET product_id = COALESCE($2, product_id), size_id = COALESCE($3, size_id), color_id = COALESCE($4, color_id), stock = COALESCE($5, stock), sku = COALESCE($6, sku)
       WHERE id = $1 RETURNING *`,
      [id, product_id, size_id, color_id, stock, sku]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product variant could not be updated" });
  }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM product_variants WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.json({ message: "Product variant deleted" });
  } catch (error) {
    res.status(500).json({ error: "Product variant could not be deleted" });
  }
};

export const getProductImages = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM product_images ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Product images could not be fetched" });
  }
};

export const getProductImageById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM product_images WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product image not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product image could not be fetched" });
  }
};

export const createProductImage = async (req: Request, res: Response) => {
  try {
    const { product_id, image_url, is_main } = req.body;
    const result = await pool.query(
      "INSERT INTO product_images (product_id, image_url, is_main) VALUES ($1, $2, $3) RETURNING *",
      [product_id, image_url, is_main ?? false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product image could not be created" });
  }
};

export const updateProductImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product_id, image_url, is_main } = req.body;
    const result = await pool.query(
      `UPDATE product_images
       SET product_id = COALESCE($2, product_id), image_url = COALESCE($3, image_url), is_main = COALESCE($4, is_main)
       WHERE id = $1 RETURNING *`,
      [id, product_id, image_url, is_main]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product image not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Product image could not be updated" });
  }
};

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("DELETE FROM product_images WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product image not found" });
    }
    res.json({ message: "Product image deleted" });
  } catch (error) {
    res.status(500).json({ error: "Product image could not be deleted" });
  }
};
