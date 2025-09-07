import express from "express";
import {
  createPayment,
  confirmPayment,
  createPaymentMethod,
  attachPaymentMethod,
  webhookHandler,
} from "../controllers/Payment.js";

const router = express.Router();

// Step 1: Create Payment Intent
router.post("/create", createPayment);

// Step 2: Create Payment Method (gcash / card)
router.post("/payment-method", createPaymentMethod);

// Step 3: Attach Payment Method to Payment Intent
router.post("/attach", attachPaymentMethod);

// Step 4: Confirm Payment (optional manual confirm)
router.post("/confirm", confirmPayment);

// Step 5: Webhook (PayMongo sends status updates here)
router.post("/webhook", express.json({ type: "*/*" }), webhookHandler);

export default router;
