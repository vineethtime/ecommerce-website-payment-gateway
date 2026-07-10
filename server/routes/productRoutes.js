const express = require("express");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  authorizeRoles("business", "admin"),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("business", "admin"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("business", "admin"),
  deleteProduct
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("business", "admin"),
  toggleProductStatus
);

module.exports = router;