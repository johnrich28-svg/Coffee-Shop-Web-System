import express from "express";
import Product from "./Product.js";

const router = express.Router();

router.use("/products", Product);

export default router;
