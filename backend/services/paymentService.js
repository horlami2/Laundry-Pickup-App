import Payment from "../models/payment.js";
import Order from "../models/order.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "./notificationService.js";

export const fulfillSuccessfulPayment = async ({ payment, transaction }) => {
  const order = await Order.findById(payment.order);

  if (!order) {
    throw new AppError("Order associated with payment not found", 404);
  }

  const alreadyProcessed = payment.status === "success";

  if (alreadyProcessed) {
    return {
      payment,
      order,
      alreadyProcessed: true,
    };
  }

  // Verify amount one more time
  const expectedAmount = Math.round(order.totalAmount * 100);

  if (transaction.amount !== expectedAmount) {
    throw new AppError("Payment amount does not match order amount", 400);
  }

  // Mark payment successful
  payment.status = "success";
  payment.paidAt = new Date(transaction.paid_at || Date.now());

  payment.gatewayResponse = transaction;

  await payment.save();

  // Update order
  if (order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";

    await order.save();
    await createNotification({
      userId: order.customer,
      orderId: order._id,
      type: "payment",
      title: "Payment Successful",
      message: `Payment of ₦${order.totalAmount.toLocaleString()} was received successfully.`,
    });
  }

  return {
    payment,
    order,
    alreadyProcessed: false,
  };
};
