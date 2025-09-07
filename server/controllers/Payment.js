import axios from "axios";
import { Order } from "../models/index.js";

const PAYMONGO_API = "https://api.paymongo.com/v1/payment_intents";

export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 1. Get order from DB
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Flatten metadata (PayMongo doesn’t allow nested objects/arrays)
    const metadata = {
      orderId: order._id.toString(),
      orderType: order.orderType,
      customerId: order.customer.toString(),
      items: order.items
        .map((i) => `${i.product.productName}x${i.quantity}`)
        .join(", "),
    };

    // 3. Build PayMongo payload
    const payload = {
      data: {
        attributes: {
          amount: order.totalPrice * 100, // centavos
          currency: "PHP",
          description: `Coffee Shop Order #${order._id}`,
          payment_method_allowed: ["gcash", "card"],
          metadata,
        },
      },
    };

    console.log("🔹 Payload to PayMongo:", JSON.stringify(payload, null, 2));

    // 4. Send to PayMongo
    const response = await fetch(
      "https://api.paymongo.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString(
              "base64"
            ),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PayMongo Error Response:", data);
      return res
        .status(response.status)
        .json({ message: "Payment creation failed", error: data });
    }

    console.log("✅ PayMongo Response:", data);
    res.status(200).json({ message: "Payment created successfully", data });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

export const createPaymentMethod = async (req, res) => {
  try {
    const { type, details } = req.body;

    const payload = {
      data: {
        attributes: {
          type, // "gcash" or "card"
          details, // { card_number, exp_month, exp_year, cvc } or {}
        },
      },
    };

    const response = await fetch(
      "https://api.paymongo.com/v1/payment_methods",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString(
              "base64"
            ),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ PayMongo Error:", data);
      return res.status(response.status).json(data);
    }

    res.status(200).json({ message: "Payment method created", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const attachPaymentMethod = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const payload = {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: "http://localhost:5002/payment-success", // change for frontend
        },
      },
    };

    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString(
              "base64"
            ),
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Attach Error:", data);
      return res.status(response.status).json(data);
    }

    res.status(200).json({ message: "Payment method attached", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const webhookHandler = async (req, res) => {
  try {
    const event = req.body;

    if (
      event.data &&
      event.data.attributes &&
      event.data.attributes.type === "payment.paid"
    ) {
      const paymentIntentId = event.data.id;
      console.log("✅ Payment completed for intent:", paymentIntentId);

      // TODO: update order in DB
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
