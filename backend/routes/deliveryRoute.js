import express from "express";

import {
  getAgentDashboard,
  getMyAssignedOrders,
  getMyAssignedOrderById,
  updateMyOrderStatus,
  updateAvailability,
  confirmPickup,
  markProcessing,
  markReadyForDelivery,
  markOutForDelivery,
  markDelivered,
} from "../controllers/deliveryController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All delivery routes require authentication
router.use(protect);

// All delivery routes require delivery_agent role
router.use(authorize("delivery_agent"));

// ======================================
// ASSIGNED ORDERS
// ======================================
router.get(
  "/dashboard",
  protect,
  authorize("delivery_agent"),
  getAgentDashboard,
);
router.patch(
  "/orders/:orderId/status",
  protect,
  authorize("delivery_agent"),
  updateMyOrderStatus,
);
router.get("/orders", getMyAssignedOrders);
router.patch("/availability", updateAvailability);

router.get("/orders/:id", getMyAssignedOrderById);

// ======================================
// ORDER STATUS ACTIONS
// ======================================

router.patch("/orders/:id/pickup", confirmPickup);

router.patch("/orders/:id/processing", markProcessing);

router.patch("/orders/:id/ready", markReadyForDelivery);

router.patch("/orders/:id/out-for-delivery", markOutForDelivery);

router.patch("/orders/:id/delivered", markDelivered);

export default router;
