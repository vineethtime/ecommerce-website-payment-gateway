const express = require("express");

const {
  getAllUsers,
  getAllBusinessUsers,
  banUser,
  deleteUser,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.get(
  "/business-users",
  protect,
  authorizeRoles("admin"),
  getAllBusinessUsers
);

router.put(
  "/ban/:id",
  protect,
  authorizeRoles("admin"),
  banUser
);

router.delete(
  "/delete/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

module.exports = router;