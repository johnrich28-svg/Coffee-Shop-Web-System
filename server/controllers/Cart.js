import { Cart } from "../models/index.js";

// 1. Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // update quantity if product exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Update item quantity in cart
export const updateCartItem = async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      return res.status(404).json({ message: "Product not in cart" });
    }

    const savedCart = await cart.save();
    res.json(savedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    const savedCart = await cart.save();
    res.json(savedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. View cart
export const getCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    const cart = await Cart.findOne({ customer: customerId }).populate(
      "items.product",
      "productName price category"
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
