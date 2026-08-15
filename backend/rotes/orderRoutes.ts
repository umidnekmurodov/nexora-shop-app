import { Router } from "express";
import { authenticate, requireCustomer, requireAdmin } from "../middleware/authMiddleware";
import { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrderItems, createOrderItem } from "../controllers/orderController";

const router = Router();

router.get("/orders", authenticate, requireCustomer, getOrders);
router.get("/orders/:id", authenticate, requireCustomer, getOrderById);
router.post("/orders", authenticate, requireCustomer, createOrder);
router.put("/orders/:id", authenticate, requireCustomer, updateOrder);
router.delete("/orders/:id", authenticate, requireCustomer, deleteOrder);
router.get("/order-items", authenticate, requireAdmin, getOrderItems);
router.post("/order-items", authenticate, requireAdmin, createOrderItem);

export default router;
