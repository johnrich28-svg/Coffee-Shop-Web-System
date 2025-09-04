import express from "express";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} from "../controllers/Cart.js";

const router = express.Router();

router.post("/add-item", addToCart);

router.put("/update-item", updateCartItem);

router.delete("/remove-item", removeFromCart);

router.get("/:customerId", getCart);

export default router;
