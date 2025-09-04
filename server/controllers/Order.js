import { Order, Cart } from "../models/index.js";

// Place an order (checkout)
export const placeOrder = async (req, res) => {
  try {
    const { customerId, orderType } = req.body;

    const cart = await Cart.findOne({ customer: customerId }).populate(
      "items.product",
      "price"
    );

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Calculate total price
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      customer: customerId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalPrice,
      orderType,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customer: customerId }).populate(
      "items.product",
      "productName price"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
