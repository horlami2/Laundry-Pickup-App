import crypto from "crypto";

import Order from "../models/order.js";
import Payment from "../models/payment.js";

import AppError from "../utils/AppError.js";
import { fulfillSuccessfulPayment } from "../services/paymentService.js";

import { initializePaystackTransaction } from "../services/paystackService.js";
export const initializePayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find only the customer's own order
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
    }).populate("customer", "name email phone");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Don't allow cancelled orders
    if (order.status === "cancelled") {
      return next(new AppError("Cancelled orders cannot be paid for", 400));
    }

    // Don't pay twice
    if (order.paymentStatus === "paid") {
      return next(new AppError("This order has already been paid for", 400));
    }

    // IMPORTANT:
    // Amount comes from the database.
    const amount = order.totalAmount;

    if (!amount || amount <= 0) {
      return next(new AppError("Invalid order amount", 400));
    }

    // Generate unique payment reference
    const reference = `LAUNDRY-${order._id}-${Date.now()}`;

    // Initialize Paystack
    const payment = await initializePaystackTransaction({
      email: order.customer.email,
      amount,
      reference,
      callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
    });

    // Save payment attempt
    await Payment.create({
      order: order._id,
      customer: req.user._id,
      reference,
      amount,
      currency: "NGN",
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",

      payment: {
        reference,
        authorizationUrl: payment.authorization_url,
        accessCode: payment.access_code,
        amount,
        currency: "NGN",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({
      reference,
      customer: req.user._id,
    });

    if (!payment) {
      return next(new AppError("Payment record not found", 404));
    }

    const order = await Order.findOne({
      _id: payment.order,
      customer: req.user._id,
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Already processed
    if (payment.status === "success" && order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        payment,
        order,
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return next(
        new AppError(data.message || "Payment verification failed", 400),
      );
    }

    const transaction = data.data;

    // Verify reference
    if (transaction.reference !== reference) {
      return next(new AppError("Payment reference mismatch", 400));
    }

    // Verify successful payment
    if (transaction.status !== "success") {
      payment.status = "failed";

      await payment.save();

      return next(new AppError("Payment was not successful", 400));
    }

    if (transaction.reference !== reference) {
      return next(new AppError("Payment reference mismatch", 400));
    }

    const result = await fulfillSuccessfulPayment({
      payment,
      transaction,
    });

    res.status(200).json({
      success: true,
      message: result.alreadyProcessed
        ? "Payment was already verified"
        : "Payment verified successfully",

      payment: result.payment,

      order: result.order,
    });
  } catch (error) {
    next(error);
  }
};

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.sendStatus(401);
    }

    const event = req.body;

    // We only care about successful charges
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const transaction = event.data;

    const reference = transaction.reference;

    const payment = await Payment.findOne({
      reference,
    });

    if (!payment) {
      // Acknowledge webhook but don't
      // create an unknown payment.
      return res.sendStatus(200);
    }

    if (payment.status === "success") {
      return res.sendStatus(200);
    }

    if (transaction.status !== "success") {
      return res.sendStatus(200);
    }

    await fulfillSuccessfulPayment({
      payment,
      transaction,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return res.sendStatus(500);
  }
};
