import express from "express";
import { createPayment, confirmPayment } from "../controllers/Payment.js";

const router = express.Router();

router.post("/create", createPayment);

router.post("/confirm", confirmPayment);

export default router;
