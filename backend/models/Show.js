const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    date: String,
    time: String,
    screen: { type: Number, default: 1 },
    price: Number,
    seats: [
      {
        number: String,
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);

module.exports = Show;
