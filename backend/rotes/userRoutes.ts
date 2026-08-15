import { Router } from "express";
import { authenticate, requireAdmin, requireCustomer, requireSuperAdmin } from "../middleware/authMiddleware";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  getCartItems,
  createCartItem,
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/userController";

const router = Router();

router.get("/users", authenticate, requireAdmin, getUsers);
router.get("/users/:id", authenticate, requireAdmin, getUserById);
router.post("/users", authenticate, requireAdmin, createUser);
router.put("/users/:id", authenticate, requireAdmin, updateUser);
router.delete("/users/:id", authenticate, requireSuperAdmin, deleteUser);

router.get("/carts", authenticate, requireCustomer, getCarts);
router.get("/carts/:id", authenticate, requireCustomer, getCartById);
router.post("/carts", authenticate, requireCustomer, createCart);
router.put("/carts/:id", authenticate, requireCustomer, updateCart);
router.delete("/carts/:id", authenticate, requireCustomer, deleteCart);
router.get("/cart-items", authenticate, requireCustomer, getCartItems);
router.post("/cart-items", authenticate, requireCustomer, createCartItem);

router.get("/reviews", authenticate, requireCustomer, getReviews);
router.get("/reviews/:id", authenticate, requireCustomer, getReviewById);
router.post("/reviews", authenticate, requireCustomer, createReview);
router.put("/reviews/:id", authenticate, requireCustomer, updateReview);
router.delete("/reviews/:id", authenticate, requireCustomer, deleteReview);

export default router;
