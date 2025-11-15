const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
    seats: [String],
    totalAmount: Number,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "failed", "cancelled"],
    },
    paymentIntentId: String, // Stripe payment intent ID
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "succeeded", "failed", "cancelled"],
    },
    paymentMethod: String, // e.g., "stripe"
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
