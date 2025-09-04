import express from "express";
import {
  placeOrder,
  getCustomerOrders,
  updateOrderStatus,
} from "../controllers/Order.js";

const router = express.Router();

router.post("/place-order", placeOrder);

router.get("/customer-order/:customerId", getCustomerOrders);

router.put("/order-status/:orderId", updateOrderStatus);

export default router;
