import User from "../models/user.js";
import LaundryService from "../models/laundryService.js";
import Order from "../models/order.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import { DELIVERY_FEE } from "../constants/pricing.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notificationService.js";

const normalizeAddress = (address) => {
  if (!address) return { addressLine: "", city: "", state: "" };

  if (typeof address === "string") {
    return {
      addressLine: address,
      city: "",
      state: "",
    };
  }

  return {
    addressLine: address.addressLine || address.street || "",
    city: address.city || "",
    state: address.state || "",
    landmark: address.landmark || "",
    instructions: address.instructions || "",
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      pickupAddress,
      deliveryAddress,
      contactPhone,
      pickupDate,
      pickupTime,
      pickupTimeSlot,
      customerNote,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError("At least one laundry item is required", 400));
    }

    if (!pickupAddress) {
      return next(new AppError("Pickup address is required", 400));
    }

    if (!deliveryAddress) {
      return next(new AppError("Delivery address is required", 400));
    }

    if (!contactPhone) {
      return next(new AppError("Contact phone number is required", 400));
    }

    if (!pickupDate) {
      return next(new AppError("Pickup date is required", 400));
    }

    const selectedPickupDate = new Date(pickupDate);

    if (Number.isNaN(selectedPickupDate.getTime())) {
      return next(new AppError("Invalid pickup date", 400));
    }

    const timeSlot = pickupTimeSlot || pickupTime;
    const allowedTimeSlots = [
      "08:00-10:00",
      "10:00-12:00",
      "12:00-14:00",
      "14:00-16:00",
      "16:00-18:00",
    ];

    if (!timeSlot || !allowedTimeSlots.includes(timeSlot)) {
      return next(new AppError("Invalid pickup time slot", 400));
    }

    const serviceIds = items.map((item) => item.service);
    const services = await LaundryService.find({
      _id: { $in: serviceIds },
      isActive: true,
    });

    if (services.length !== serviceIds.length) {
      return next(
        new AppError("One or more selected services are unavailable", 400),
      );
    }

    const serviceMap = new Map(
      services.map((service) => [service._id.toString(), service]),
    );

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const service = serviceMap.get(item.service.toString());

      if (!service) {
        return next(
          new AppError(`Laundry service ${item.service} was not found`, 400),
        );
      }

      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return next(new AppError(`Invalid quantity for ${service.name}`, 400));
      }

      const itemSubtotal = service.price * quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        service: service._id,
        itemName: service.name,
        pricingType: service.pricingType,
        unit: service.unit,
        quantity,
        unitPrice: service.price,
        subtotal: itemSubtotal,
      });
    }

    const totalAmount = subtotal + DELIVERY_FEE;

    const order = await Order.create({
      customer: req.user._id,
      items: processedItems,
      pickupAddress: normalizeAddress(pickupAddress),
      deliveryAddress: normalizeAddress(deliveryAddress),
      contactPhone,
      pickupDate: selectedPickupDate,
      pickupTimeSlot: timeSlot,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      totalAmount,
      customerNote,
      status: ORDER_STATUS.PENDING,
      paymentStatus: "pending",
      statusHistory: [
        {
          status: ORDER_STATUS.PENDING,
          note: "Order created by customer",
          updatedBy: req.user._id,
        },
      ],
    });

    await createNotification({
      userId: req.user._id,
      orderId: order._id,
      type: "order_status",
      title: "Order Created",
      message: "Your laundry order has been created successfully.",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("deliveryAgent", "name email phone")
      .populate("items.service", "name category price");

    res.status(201).json({
      success: true,
      message: "Laundry order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.service", "name category price")
      .populate("deliveryAgent", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate("items.service", "name category price")
      .populate("deliveryAgent", "name phone");

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

export const getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      Order.countDocuments({ customer: customerId }),
      Order.countDocuments({
        customer: customerId,
        status: ORDER_STATUS.PENDING,
      }),
      Order.countDocuments({
        customer: customerId,
        status: ORDER_STATUS.PROCESSING,
      }),
      Order.countDocuments({
        customer: customerId,
        status: ORDER_STATUS.OUT_FOR_DELIVERY,
      }),
      Order.countDocuments({
        customer: customerId,
        status: ORDER_STATUS.DELIVERED,
      }),
      Order.countDocuments({
        customer: customerId,
        status: ORDER_STATUS.CANCELLED,
      }),
    ]);

    const recentOrders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("items.service", "name category")
      .populate("deliveryAgent", "name phone");

    res.status(200).json({
      success: true,
      dashboard: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          outForDelivery: outForDeliveryOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const trackMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .select(
        "status statusHistory pickupDate pickupTimeSlot deliveryAgent createdAt",
      )
      .populate("deliveryAgent", "name phone");

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

export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const cancellableStatuses = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PICKUP_ASSIGNED,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return next(new AppError("This order can no longer be cancelled", 400));
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      note: "Order cancelled by customer",
      updatedBy: req.user._id,
    });

    await order.save();

    await createNotification({
      userId: req.user._id,
      orderId: order._id,
      type: "order_status",
      title: "Order Cancelled",
      message: "Your laundry order has been cancelled successfully.",
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
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
      customer,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (currentPage - 1) * currentLimit;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (deliveryAgent) filter.deliveryAgent = deliveryAgent;
    if (customer) filter.customer = customer;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .populate("deliveryAgent", "name email phone")
        .populate("items.service", "name category price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
