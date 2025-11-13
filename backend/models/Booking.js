const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show" },
    seats: [String],
    totalAmount: Number,
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
