import { Router } from "express";
import { authenticate, requireAdmin, requireCustomer, requireSuperAdmin } from "../middleware/authMiddleware";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSizes,
  createSize,
  getColors,
  createColor,
  getProductVariants,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductImages,
  getProductImageById,
  createProductImage,
  updateProductImage,
  deleteProductImage,
} from "../controllers/catalogController";

const router = Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", authenticate, requireAdmin, createCategory);
router.put("/categories/:id", authenticate, requireAdmin, updateCategory);
router.delete("/categories/:id", authenticate, requireAdmin, deleteCategory);

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", authenticate, requireAdmin, createProduct);
router.put("/products/:id", authenticate, requireAdmin, updateProduct);
router.delete("/products/:id", authenticate, requireAdmin, deleteProduct);

router.get("/sizes", getSizes);
router.post("/sizes", authenticate, requireAdmin, createSize);

router.get("/colors", getColors);
router.post("/colors", authenticate, requireAdmin, createColor);

router.get("/product-variants", getProductVariants);
router.get("/product-variants/:id", getProductVariantById);
router.post("/product-variants", authenticate, requireAdmin, createProductVariant);
router.put("/product-variants/:id", authenticate, requireAdmin, updateProductVariant);
router.delete("/product-variants/:id", authenticate, requireAdmin, deleteProductVariant);

router.get("/product-images", getProductImages);
router.get("/product-images/:id", getProductImageById);
router.post("/product-images", authenticate, requireAdmin, createProductImage);
router.put("/product-images/:id", authenticate, requireAdmin, updateProductImage);
router.delete("/product-images/:id", authenticate, requireAdmin, deleteProductImage);

export default router;
