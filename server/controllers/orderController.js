const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create Order From Cart
const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    const orderItems = cart.items.map((item) => {
      totalAmount += item.product.price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        seller: item.product.seller,
      };
    });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
    });

    // Clear Cart After Order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.seller": req.user._id,
    })
      .populate("user", "name email")
      .populate("items.product");

    res.json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    await order.save();

    res.json({
      message: "Order status updated",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
};