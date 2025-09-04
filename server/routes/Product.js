import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
} from "../controllers/Product.js";

const router = express.Router();

router.post("/add-product", addProduct);
router.get("/get-products", getProducts);
router.get("/category/:category", getProductsByCategory);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);
router.get("/search", searchProducts);

export default router;
