import { Router } from "express";
import { authenticate, requireAdmin, requireCustomer } from "../middleware/authMiddleware";
import {
  getGenders,
  getGenderById,
  createGender,
  updateGender,
  deleteGender,
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/attributeController";

const router = Router();

router.get("/genders", authenticate, requireCustomer, getGenders);
router.get("/genders/:id", authenticate, requireCustomer, getGenderById);
router.post("/genders", authenticate, requireAdmin, createGender);
router.put("/genders/:id", authenticate, requireAdmin, updateGender);
router.delete("/genders/:id", authenticate, requireAdmin, deleteGender);

router.get("/brands", authenticate, requireCustomer, getBrands);
router.get("/brands/:id", authenticate, requireCustomer, getBrandById);
router.post("/brands", authenticate, requireAdmin, createBrand);
router.put("/brands/:id", authenticate, requireAdmin, updateBrand);
router.delete("/brands/:id", authenticate, requireAdmin, deleteBrand);

export default router;
