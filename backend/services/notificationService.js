import Notification from "../models/notification.js";

export const createNotification = async ({
  userId,
  orderId = null,
  type,
  title,
  message,
}) => {
  return Notification.create({
    user: userId,
    order: orderId,
    type,
    title,
    message,
  });
};

export const createDeliveryAssignmentNotification = async ({
  agentId,
  orderId,
}) => {
  return createNotification({
    userId: agentId,
    orderId,
    type: "order_status",
    title: "New Pickup Assigned",
    message: "A new laundry pickup has been assigned to you.",
  });
};

export const notifyOrderStatusChange = async (order) => {
  const messages = {
    pickup_assigned: {
      title: "Delivery Agent Assigned",
      message: "A delivery agent has been assigned to your laundry order.",
    },

    picked_up: {
      title: "Laundry Picked Up",
      message: "Your laundry has been picked up successfully.",
    },

    processing: {
      title: "Laundry Processing",
      message: "Your laundry is currently being processed.",
    },

    ready_for_delivery: {
      title: "Laundry Ready",
      message: "Your laundry is ready for delivery.",
    },

    out_for_delivery: {
      title: "Out for Delivery",
      message: "Your laundry is now on the way to you.",
    },

    delivered: {
      title: "Laundry Delivered",
      message: "Your laundry order has been delivered successfully.",
    },

    cancelled: {
      title: "Order Cancelled",
      message: "Your laundry order has been cancelled.",
    },
  };

  const notification = messages[order.status];

  if (!notification) {
    return null;
  }

  return createNotification({
    userId: order.customer._id || order.customer,
    orderId: order._id,
    type: "order_status",
    title: notification.title,
    message: notification.message,
  });
};
