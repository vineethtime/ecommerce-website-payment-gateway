const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllBusinessUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "business",
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const banUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBanned = true;
    user.banReason =
      req.body.reason || "Violation";

    await user.save();

    res.json({
      message: "User banned successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getAllBusinessUsers,
  banUser,
  deleteUser,
};