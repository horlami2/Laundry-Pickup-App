import express from "express";

import {
  getAdminDashboard,
  getAllOrders,
  getAdminOrderById,
  getDeliveryAgents,
  assignDeliveryAgent,
  updateOrderStatus,
} from "../controllers/adminController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getAdminDashboard);

router.get("/delivery-agents", getDeliveryAgents);

router.get("/orders", getAllOrders);

router.get("/orders/:id", getAdminOrderById);

router.patch("/orders/:id/assign-agent", assignDeliveryAgent);

router.patch("/orders/:id/status", updateOrderStatus);

export default router;
