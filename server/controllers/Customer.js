import { Customer } from "../models/index.js";
import generateToken from "../utils/generateToken.js";

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const customer = await Customer.create({ name, email, password });

    res.status(201).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      token: generateToken(customer._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (customer && (await customer.matchPassword(password))) {
      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        token: generateToken(customer._id), // 🔹 include JWT
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
