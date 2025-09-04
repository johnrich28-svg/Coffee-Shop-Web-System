import express from "express";
import Product from "./Product.js";
import Customer from "./Customer.js";

const router = express.Router();

router.use("/products", Product);
router.use("/customers", Customer);

export default router;
