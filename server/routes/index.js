import express from "express";
import Product from "./Product.js";
import Customer from "./Customer.js";
import Cart from "./Cart.js";
import Order from "./Order.js";
import Payment from "./Payment.js";

const router = express.Router();

router.use("/products", Product);
router.use("/customers", Customer);
router.use("/cart", Cart);
router.use("/orders", Order);
router.use("/payments", Payment);

export default router;
