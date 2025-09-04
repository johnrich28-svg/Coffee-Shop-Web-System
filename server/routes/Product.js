import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/Product.js";

const router = express.Router();

router.post("/add-product", addProduct);
router.get("/get-products", getProducts);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);
router.get("/search", searchProducts);

export default router;
