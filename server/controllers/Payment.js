import axios from "axios";
import { Order } from "../models/index.js";

const PAYMONGO_API = "https://api.paymongo.com/v1/payment_intents";

export const createPayment = async (req, res) => {
  try {
    const { orderId, currency = "PHP" } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Create Payment Intent for GCash only
    const response = await axios.post(
      PAYMONGO_API,
      {
        data: {
          attributes: {
            amount: order.totalPrice * 100, // convert to centavos
            currency,
            payment_method_allowed: ["gcash"], // GCash only
            payment_method_options: { gcash: {} }, // optional GCash options
            description: `Coffee Shop Order #${orderId}`,
            metadata: {
              orderId: orderId,
              items: order.items
                .map((item) => `${item.productName} x${item.quantity}`)
                .join(", "),
            },
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

    // Return the checkout URL or QR data to frontend
    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Payment creation failed" });
  }
};

// Confirm Payment (after successful GCash payment)
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
