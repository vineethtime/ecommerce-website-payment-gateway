const User = require("../models/User");
const BusinessProfile = require("../models/BusinessProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/email");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyName,
      gstNumber,
      phone,
      address,
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin registration not allowed",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      otp,
      otpExpiry,
    });

    if (role === "business") {
      await BusinessProfile.create({
        user: user._id,
        companyName,
        gstNumber,
        phone,
        address,
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(201).json({
      message: "Registration successful. OTP sent to email.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: `Account banned. Reason: ${user.banReason}`,
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PROFILE
const getProfile = async (req, res) => {
  res.json(req.user);
};

// TEST EMAIL
const sendTestEmail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Test Email",
      text: "Email service is working successfully!",
    });

    res.json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log("EMAIL ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New OTP",
      text: `Your new OTP is ${otp}`,
    });

    res.json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
    });

    res.json({
      message: "Password reset OTP sent successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  getProfile,
  sendTestEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
};