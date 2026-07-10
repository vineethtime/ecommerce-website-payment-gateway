const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add To Cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
      });
    }

    await cart.save();

    res.json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// View Cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Item
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.json({
      message: "Item removed",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.json({
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
};