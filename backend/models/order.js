import mongoose from "mongoose";
import { ORDER_STATUS, ORDER_STATUSES } from "../constants/orderStatus.js";

const orderItemSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaundryService",
      required: [true, "Laundry service is required"],
    },

    itemName: {
      type: String,
      required: [true, "Laundry item name is required"],
      trim: true,
    },

    pricingType: {
      type: String,
      enum: ["per_item", "per_kg"],
      required: true,
    },

    unit: {
      type: String,
      enum: ["item", "kg"],
      required: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const addressSchema = new mongoose.Schema(
  {
    addressLine: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: [true, "At least one laundry item is required"],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    pickupAddress: {
      type: addressSchema,
      required: [true, "Pickup address is required"],
    },

    deliveryAddress: {
      type: addressSchema,
      required: [true, "Delivery address is required"],
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    pickupDate: {
      type: Date,
      required: [true, "Pickup date is required"],
    },

    pickupTimeSlot: {
      type: String,
      required: true,
      enum: [
        "08:00-10:00",
        "10:00-12:00",
        "12:00-14:00",
        "14:00-16:00",
        "16:00-18:00",
      ],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentReference: {
      type: String,
      trim: true,
    },

    customerNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
