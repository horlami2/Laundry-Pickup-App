import { createNotification } from "./notificationService.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";

export const notifyOrderStatusChange = async (order) => {
  let title;
  let message;

  switch (order.status) {
    case ORDER_STATUS.PICKUP_ASSIGNED:
      title = "Pickup Assigned";
      message = "A delivery agent has been assigned to pick up your laundry.";
      break;

    case ORDER_STATUS.PICKED_UP:
      title = "Laundry Picked Up";
      message = "Your laundry has been picked up and is now at our facility.";
      break;

    case ORDER_STATUS.PROCESSING:
      title = "Laundry Processing";
      message = "Your laundry is now being processed.";
      break;

    case ORDER_STATUS.READY_FOR_DELIVERY:
      title = "Laundry Ready";
      message = "Your laundry is ready and will soon be delivered.";
      break;

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      title = "Out for Delivery";
      message = "Your laundry is now out for delivery.";
      break;

    case ORDER_STATUS.DELIVERED:
      title = "Laundry Delivered";
      message = "Your laundry has been delivered successfully.";
      break;

    case ORDER_STATUS.CANCELLED:
      title = "Order Cancelled";
      message = "Your laundry order has been cancelled.";
      break;

    default:
      return null;
  }

  return createNotification({
    userId: order.customer,
    orderId: order._id,
    type: "order_status",
    title,
    message,
  });
};
