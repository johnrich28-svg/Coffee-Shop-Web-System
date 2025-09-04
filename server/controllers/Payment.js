import axios from "axios";
import { Order } from "../models/index.js";

const PAYMONGO_API = "https://api.paymongo.com/v1/payment_intents";

export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = "PHP" } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Create Payment Intent
    const response = await axios.post(
      PAYMONGO_API,
      {
        data: {
          attributes: {
            amount: amount * 100, // in centavos
            currency,
            payment_method_allowed: ["card"],
            payment_method_options: { card: { request_three_d_secure: "any" } },
            description: `Payment for Order ${orderId}`,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Payment creation failed" });
  }
};

// Confirm Payment (optional callback after success)
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update order as paid
    order.paymentStatus = "paid";
    await order.save();

    res.json({ message: "Payment successful", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
