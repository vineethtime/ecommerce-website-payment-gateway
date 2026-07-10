const express = require("express");
const {
  registerUser,
  loginUser,
  verifyOTP,
  getProfile,
  sendTestEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/test-email", sendTestEmail);
router.get("/profile", protect, getProfile);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;