const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const requestLogger = require("./middlewares/requestlogger");
const connectDB = require("./config/dbconnect");
const User = require("./models/user");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
app.use(express.json());
const PORT = process.env.PORT || 3000;
const tokenVerificationLogger = require("./middlewares/tokenverficationlogger");
const Movie = require("./models/movie");
const Show = require("./models/Show");
const Booking = require("./models/Booking");
app.use(
  cors({
    origin: "*",
  })
);
app.post("/auth/user/register", async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET
    );
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET
      );
      res
        .status(200)
        .json({ message: "Login successful", token, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "Profile data", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const users = await User.find().select("-password");
    res.status(200).json({ message: "User list", users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User data", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/user/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.userId !== req.params.id) {
      return res.status(403).send({ message: "access denied" });
    }
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/user/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.userId !== req.params.id && decoded.role !== "admin") {
      return res.status(403).send({ message: "access denied" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/movies", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const { title, description, duration, language, genre } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newMovie = new Movie({
      title,
      description,
      duration,
      language,
      genre,
    });
    await newMovie.save();
    res
      .status(201)
      .json({ message: "Movie added successfully", movie: newMovie });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ message: "Movie list", movies });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/movies/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const updates = req.body;
    const movie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json({ message: "Movie updated successfully", movie });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete("/movies/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/shows", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const { movie, date, time, screen, price, seats } = req.body;
    if (!movie || !date || !time || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newShow = new Show({
      movie,
      date,
      time,
      screen,
      price,
      seats,
    });
    await newShow.save();
    res.status(201).json({ message: "Show added successfully", show: newShow });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/shows", async (req, res) => {
  try {
    const shows = await Show.find().populate("movie");
    res.status(200).json({ message: "Show list", shows });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/shows/:id", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate("movie");
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }
    res.status(200).json({ message: "Show details", show });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/shows/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const updates = req.body;
    const show = await Show.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate("movie");
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }
    res.status(200).json({ message: "Show updated successfully", show });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete("/shows/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/bookings", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    const {
      show,
      seats,
      paymentMethod = "stripe",
      cardDetails, // User-provided card details
    } = req.body;

    // Validate input
    if (!show || !seats || seats.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate card details if payment method is stripe
    if (paymentMethod === "stripe" && !cardDetails) {
      return res.status(400).json({
        error: "Card details are required for payment",
        required: {
          cardNumber: "16-digit card number",
          expMonth: "2-digit expiry month (e.g., 12)",
          expYear: "4-digit expiry year (e.g., 2025)",
          cvc: "3-digit security code",
          holderName: "Cardholder name",
        },
      });
    }

    // Validate card details format
    if (cardDetails) {
      const { cardNumber, expMonth, expYear, cvc, holderName } = cardDetails;

      if (!cardNumber || !expMonth || !expYear || !cvc || !holderName) {
        return res.status(400).json({
          error: "Complete card details required",
          missing: {
            cardNumber: !cardNumber ? "required" : "provided",
            expMonth: !expMonth ? "required" : "provided",
            expYear: !expYear ? "required" : "provided",
            cvc: !cvc ? "required" : "provided",
            holderName: !holderName ? "required" : "provided",
          },
        });
      }

      // Basic validation
      if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
        return res.status(400).json({ error: "Invalid card number format" });
      }
      if (!/^\d{1,2}$/.test(expMonth) || expMonth < 1 || expMonth > 12) {
        return res.status(400).json({ error: "Invalid expiry month (1-12)" });
      }
      if (!/^\d{4}$/.test(expYear) || expYear < new Date().getFullYear()) {
        return res.status(400).json({ error: "Invalid or expired year" });
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        return res.status(400).json({ error: "Invalid CVC (3-4 digits)" });
      }
    }

    // Start a transaction for atomic booking
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find and validate show
      const showData = await Show.findById(show).session(session);
      if (!showData) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Show not found" });
      }

      // Check seat availability
      const unavailableSeats = seats.filter((seatNumber) => {
        const seat = showData.seats.find(
          (s) => s.number === String(seatNumber)
        );
        return !seat || seat.isBooked;
      });

      if (unavailableSeats.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: "One or more seats are already booked",
          unavailableSeats,
        });
      }

      const totalAmount = showData.price * seats.length;

      // Create and auto-confirm Stripe payment intent with user-provided card details
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
        currency: "usd",
        metadata: {
          userId: decoded.userId,
          showId: show,
          seats: seats.join(","),
          seatCount: seats.length,
        },
        // Auto-confirm with user-provided card details
        confirm: true,
        payment_method_data: {
          type: "card",
          card: {
            number: cardDetails.cardNumber.replace(/\s/g, ""), // Remove spaces
            exp_month: parseInt(cardDetails.expMonth),
            exp_year: parseInt(cardDetails.expYear),
            cvc: cardDetails.cvc,
          },
          billing_details: {
            name: cardDetails.holderName,
          },
        },
        return_url: "http://localhost:3000", // Required for some payment methods
      });

      // Check if payment was successful
      if (paymentIntent.status !== "succeeded") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: "Payment failed",
          status: paymentIntent.status,
          message: "Please try again with a different payment method",
        });
      }

      // Create confirmed booking
      const newBooking = new Booking({
        user: decoded.userId,
        show,
        seats,
        totalAmount,
        status: "confirmed",
        paymentIntentId: paymentIntent.id,
        paymentStatus: "succeeded",
        paymentMethod: "stripe",
      });

      await newBooking.save({ session });

      // Mark seats as booked
      const seatNumbersToBook = seats.map((s) => String(s));
      const updatedShow = await Show.findByIdAndUpdate(
        show,
        { $set: { "seats.$[elem].isBooked": true } },
        {
          arrayFilters: [{ "elem.number": { $in: seatNumbersToBook } }],
          session,
          new: true,
        }
      );

      await session.commitTransaction();
      session.endSession();

      // Log success
      const bookedCount = updatedShow.seats.filter((s) => s.isBooked).length;
      console.log(
        ` Booking successful - Show ${show}: ${bookedCount} seats are currently booked`
      );
      console.log(`Payment processed: ${paymentIntent.id}`);

      res.status(201).json({
        message: "Booking and payment successful",
        booking: newBooking,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        },
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();

      // If it's a Stripe error, provide more specific feedback
      if (transactionError.type === "StripeCardError") {
        return res.status(400).json({
          error: "Payment failed",
          message: transactionError.message,
          decline_code: transactionError.decline_code,
        });
      }

      throw transactionError;
    }
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Unable to process booking and payment. Please try again.",
    });
  }
});

app.get("/bookings", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    const bookings = await Booking.find({ user: decoded.userId }).populate({});
    res.status(200).json({ message: "Booking list", bookings });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/bookings/:id", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    const booking = await Booking.findById(req.params.id)
      .populate("show")
      .populate("user");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (
      booking.user._id.toString() !== decoded.userId &&
      decoded.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.status(200).json({ message: "Booking details", booking });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/bookings/:movieId", tokenVerificationLogger, async (req, res) => {
  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    const movieId = req.params.movieId;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const bookings = await Booking.find()
      .populate({})
      .populate("user")
      .populate({
        path: "show",
        match: { movie: movieId },
      });
    const filteredBookings = bookings.filter(
      (booking) => booking.show !== null
    );
    res
      .status(200)
      .json({ message: "Bookings for movie", bookings: filteredBookings });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// connect to database and start server
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
