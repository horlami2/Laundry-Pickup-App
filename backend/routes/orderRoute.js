import express from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  trackMyOrder,
  cancelMyOrder,
  getAllOrders,
  getCustomerDashboard,
} from "../controllers/orderController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// ======================================
// ADMIN ROUTES FIRST
// ======================================

router.get("/admin/all", authorize("admin"), getAllOrders);

// ======================================
// CUSTOMER ROUTES
// ======================================
router.get("/dashboard", protect, authorize("customer"), getCustomerDashboard);
router.post("/", createOrder);

router.get("/my-orders", getMyOrders);
router.get("/:id/tracking", protect, authorize("customer"), trackMyOrder);

router.patch("/:id/cancel", cancelMyOrder);

router.get("/:id", getMyOrderById);

export default router;
