import express from "express";

import {
  initializePayment,
  verifyPayment,
  paystackWebhook,
} from "../controllers/paymentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/initialize/:orderId", authorize("customer"), initializePayment);

router.get("/verify/:reference", authorize("customer"), verifyPayment);
// Paystack webhook
router.post("/webhook", paystackWebhook);
export default router;
