import express from "express";

import {
  createService,
  getAllServices,
  getActiveServices,
  getServiceById,
  updateService,
  deleteService,
  addStarterServices,
  toggleServiceStatus,
  // deactivateService,
  // activateService,
} from "../controllers/serviceController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public/customer route
router.get("/active", getActiveServices);

// Admin routes
router.use(protect);
router.use(authorize("admin"));

router.post("/starter-catalog", addStarterServices);

router.post("/", upload.single("image"), createService);

router.get("/", getAllServices);

router.get("/:id", getServiceById);

router.patch("/:id", upload.single("image"), updateService);
router.patch(
  "/:id/toggle-status",
  protect,
  authorize("admin"),
  toggleServiceStatus,
);
// router.delete("/:id", protect, authorize("admin"), deactivateService);
// router.patch("/:id/activate", protect, authorize("admin"), activateService);

router.delete("/:id", deleteService);

export default router;
