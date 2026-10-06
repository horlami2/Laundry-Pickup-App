import Order from "../models/order.js";
import User from "../models/user.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import AppError from "../utils/AppError.js";
import {
  createNotification,
  notifyOrderStatusChange,
} from "../services/notificationService.js";
import { allowedStatusTransitions } from "../utils/orderStatusTransition.js";
// ======================================
// ADMIN DASHBOARD
// ======================================

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      pickupAssignedOrders,
      pickedUpOrders,
      processingOrders,
      readyForDeliveryOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      unpaidOrders,
      totalCustomers,
      totalAgents,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        status: ORDER_STATUS.PENDING,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.PICKUP_ASSIGNED,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.PICKED_UP,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.PROCESSING,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.READY_FOR_DELIVERY,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.OUT_FOR_DELIVERY,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.DELIVERED,
      }),

      Order.countDocuments({
        status: ORDER_STATUS.CANCELLED,
      }),

      Order.countDocuments({
        paymentStatus: "paid",
      }),

      Order.countDocuments({
        paymentStatus: "pending",
      }),

      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "delivery_agent",
      }),
    ]);

    // Revenue should come only from paid orders.
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,

      dashboard: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          pickupAssigned: pickupAssignedOrders,
          pickedUp: pickedUpOrders,
          processing: processingOrders,
          readyForDelivery: readyForDeliveryOrders,
          outForDelivery: outForDeliveryOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        payments: {
          paid: paidOrders,
          unpaid: unpaidOrders,
        },

        customers: totalCustomers,

        deliveryAgents: totalAgents,

        revenue: totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryAgents = async (req, res, next) => {
  try {
    const agents = await User.find({
      role: "delivery_agent",
    }).select("name email phone role");

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    next(error);
  }
};

export const assignDeliveryAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryAgentId } = req.body;

    if (!deliveryAgentId) {
      return next(new AppError("Delivery agent ID is required", 400));
    }

    const agent = await User.findOne({
      _id: deliveryAgentId,
      role: "delivery_agent",
      isActive: true,
    });

    if (!agent) {
      return next(new AppError("Active delivery agent not found", 404));
    }

    const order = await Order.findOne({
      _id: id,
      status: ORDER_STATUS.PENDING,
      paymentStatus: "paid",
      deliveryAgent: null,
    });

    if (!order) {
      return next(
        new AppError(
          "Order cannot be assigned. It may be unpaid, already assigned, or no longer pending.",
          400,
        ),
      );
    }

    order.deliveryAgent = agent._id;

    order.status = ORDER_STATUS.PICKUP_ASSIGNED;

    order.statusHistory.push({
      status: ORDER_STATUS.PICKUP_ASSIGNED,
      note: `Order assigned to delivery agent ${agent.name}`,
      updatedBy: req.user._id,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.service", "name category")
      .populate("deliveryAgent", "name email phone");

    await createNotification({
      userId: deliveryAgentId,
      orderId: order._id,
      type: "order_status",
      title: "New Pickup Assignment",
      message: "You have been assigned a new laundry pickup.",
    });

    await notifyOrderStatusChange(populatedOrder);

    res.status(200).json({
      success: true,
      message: "Delivery agent assigned successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return next(new AppError("New order status is required", 400));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("Order not found", 404));
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

    if (status === ORDER_STATUS.PICKUP_ASSIGNED && !order.deliveryAgent) {
      return next(new AppError("A delivery agent must be assigned first", 400));
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

export const getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      deliveryAgent,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.min(Math.max(Number(limit), 1), 50);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (deliveryAgent) {
      filter.deliveryAgent = deliveryAgent;
    }

    const skip = (currentPage - 1) * currentLimit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .populate("deliveryAgent", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit),

      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer", "name email phone")
      .populate("items.service", "name category price")
      .populate("deliveryAgent", "name email phone");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
