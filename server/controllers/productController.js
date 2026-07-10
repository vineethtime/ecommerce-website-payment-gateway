const Product = require("../models/Product");

// Create Product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      seller: req.user._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image,
      stock: req.body.stock,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .populate("seller", "name email");

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Product By Id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
  req.user.role !== "admin" &&
  product.seller.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    message: "Not authorized to update this product",
  });
}

    product.name = req.body.name || product.name;
    product.description =
      req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category =
      req.body.category || product.category;
    product.image = req.body.image || product.image;
    product.stock = req.body.stock || product.stock;

    const updated = await product.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
  req.user.role !== "admin" &&
  product.seller.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    message: "Not authorized to update this product",
  });
}

    await product.deleteOne();

    res.json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Stop Selling / Resume Selling
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
  req.user.role !== "admin" &&
  product.seller.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    message: "Not authorized to update this product",
  });
}

    product.status =
      product.status === "active"
        ? "inactive"
        : "active";

    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};