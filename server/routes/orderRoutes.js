const express = require("express");

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/checkout",
  protect,
  authorizeRoles("user"),
  createOrder
);

router.get(
  "/my-orders",
  protect,
  authorizeRoles("user"),
  getMyOrders
);

router.get(
  "/seller-orders",
  protect,
  authorizeRoles("business", "admin"),
  getSellerOrders
);

router.put(
  "/status/:orderId",
  protect,
  authorizeRoles("business", "admin"),
  updateOrderStatus
);

module.exports = router;