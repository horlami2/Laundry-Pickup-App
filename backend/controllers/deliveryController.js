import Order from "../models/order.js";
import AppError from "../utils/AppError.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import { allowedStatusTransitions } from "../utils/orderStatusTransition.js";
import { notifyOrderStatusChange } from "../services/notificationService.js";

const getOrderIdFromParams = (req) => req.params.id || req.params.orderId;

const updateAgentOrderStatus = async ({
  req,
  res,
  next,
  nextStatus,
  allowedCurrentStatuses,
  message,
  note,
}) => {
  try {
    const orderId = getOrderIdFromParams(req);

    const order = await Order.findOne({
      _id: orderId,
      deliveryAgent: req.user._id,
    });

    if (!order) {
      return next(new AppError("Order not found or not assigned to you", 404));
    }

    if (!allowedCurrentStatuses.includes(order.status)) {
      return next(
        new AppError(
          `Order cannot move from ${order.status} to ${nextStatus}`,
          400,
        ),
      );
    }

    order.status = nextStatus;

    order.statusHistory.push({
      status: nextStatus,
      note: note || message,
      updatedBy: req.user._id,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.service", "name category")
      .populate("deliveryAgent", "name email phone");

    await notifyOrderStatusChange(populatedOrder);

    res.status(200).json({
      success: true,
      message,
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentDashboard = async (req, res, next) => {
  try {
    const agentId = req.user._id;

    const [
      assignedOrders,
      pickedUpOrders,
      processingOrders,
      readyForDeliveryOrders,
      outForDeliveryOrders,
      deliveredOrders,
    ] = await Promise.all([
      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.PICKUP_ASSIGNED,
      }),

      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.PICKED_UP,
      }),

      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.PROCESSING,
      }),

      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.READY_FOR_DELIVERY,
      }),

      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.OUT_FOR_DELIVERY,
      }),

      Order.countDocuments({
        deliveryAgent: agentId,
        status: ORDER_STATUS.DELIVERED,
      }),
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        assigned: assignedOrders,
        pickedUp: pickedUpOrders,
        processing: processingOrders,
        readyForDelivery: readyForDeliveryOrders,
        outForDelivery: outForDeliveryOrders,
        delivered: deliveredOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// HELPER
// ======================================
export const updateMyOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return next(new AppError("New order status is required", 400));
    }

    const order = await Order.findOne({
      _id: id,
      deliveryAgent: req.user._id,
    });

    if (!order) {
      return next(new AppError("Order not found or not assigned to you", 404));
    }

    const allowedTransitions = allowedStatusTransitions[order.status] || [];

    if (!allowedTransitions.includes(status)) {
      return next(
        new AppError(
          `Order cannot move from ${order.status} to ${status}`,
          400,
        ),
      );
    }

    order.status = status;

    order.statusHistory.push({
      status,
      note: note || `Order status changed to ${status}`,
      updatedBy: req.user._id,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.service", "name category")
      .populate("deliveryAgent", "name email phone");

    await notifyOrderStatusChange(populatedOrder);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
// ======================================
// GET ASSIGNED ORDERS
// ======================================

export const getMyAssignedOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {
      deliveryAgent: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .populate("items.service", "name category")
        .populate("deliveryAgent", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNumber),
      },

      orders,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// GET ONE ASSIGNED ORDER
// ======================================

export const getMyAssignedOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      deliveryAgent: req.user._id,
    })
      .populate("customer", "name email phone")
      .populate("items.service", "name category")
      .populate("deliveryAgent", "name email phone");

    if (!order) {
      return next(new AppError("Order not found or not assigned to you", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// CONFIRM PICKUP
// ======================================

export const confirmPickup = async (req, res, next) => {
  return updateAgentOrderStatus({
    req,
    res,
    next,
    nextStatus: ORDER_STATUS.PICKED_UP,
    allowedCurrentStatuses: [ORDER_STATUS.PICKUP_ASSIGNED],
    message: "Laundry pickup confirmed",
    note: "Laundry picked up from customer",
  });
};

// ======================================
// MARK PROCESSING
// ======================================

export const markProcessing = async (req, res, next) => {
  return updateAgentOrderStatus({
    req,
    res,
    next,
    nextStatus: ORDER_STATUS.PROCESSING,
    allowedCurrentStatuses: [ORDER_STATUS.PICKED_UP],
    message: "Laundry is now being processed",
    note: "Laundry processing started",
  });
};

// ======================================
// MARK READY FOR DELIVERY
// ======================================

export const markReadyForDelivery = async (req, res, next) => {
  return updateAgentOrderStatus({
    req,
    res,
    next,
    nextStatus: ORDER_STATUS.READY_FOR_DELIVERY,
    allowedCurrentStatuses: [ORDER_STATUS.PROCESSING],
    message: "Laundry is ready for delivery",
    note: "Laundry processing completed",
  });
};

// ======================================
// MARK OUT FOR DELIVERY
// ======================================

export const markOutForDelivery = async (req, res, next) => {
  return updateAgentOrderStatus({
    req,
    res,
    next,
    nextStatus: ORDER_STATUS.OUT_FOR_DELIVERY,
    allowedCurrentStatuses: [ORDER_STATUS.READY_FOR_DELIVERY],
    message: "Order is out for delivery",
    note: "Laundry is on the way to customer",
  });
};

// ======================================
// MARK DELIVERED
// ======================================

export const markDelivered = async (req, res, next) => {
  return updateAgentOrderStatus({
    req,
    res,
    next,
    nextStatus: ORDER_STATUS.DELIVERED,
    allowedCurrentStatuses: [ORDER_STATUS.OUT_FOR_DELIVERY],
    message: "Laundry delivered successfully",
    note: "Laundry delivered to customer",
  });
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return next(new AppError("isAvailable must be true or false", 400));
    }

    req.user.isAvailable = isAvailable;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: {
        isAvailable: req.user.isAvailable,
      },
    });
  } catch (error) {
    next(error);
  }
};
