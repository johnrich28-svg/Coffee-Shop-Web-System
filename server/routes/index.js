import express from "express";
import Product from "./Product.js";
import Customer from "./Customer.js";
import Cart from "./Cart.js";

const router = express.Router();

router.use("/products", Product);
router.use("/customers", Customer);
router.use("/cart", Cart);

export default router;
