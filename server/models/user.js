const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["user", "business", "admin"],
        default: "user",
    },

    isVerified: {
  type: Boolean,
  default: false,
},

otp: String,

otpExpiry: Date,

isBanned: {
  type: Boolean,
  default: false,
},

banReason: String,

banExpiry: Date,
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("User", userSchema);