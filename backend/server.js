const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const requestLogger = require("./middlewares/requestlogger");
const connectDB = require("./config/dbconnect");
const User = require("./models/user");
dotenv.config();
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
    const { show, seats } = req.body;
    if (!show || !seats || seats.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const showData = await Show.findById(show);
    if (!showData) {
      return res.status(404).json({ error: "Show not found" });
    }
    if (
      seats.some((s) => {
        const seat = showData.seats.find((seat) => seat.number === String(s));
        return !seat || seat.isBooked;
      })
    ) {
      return res
        .status(400)
        .json({ error: "One or more seats are already booked" });
    }
    const totalAmount = showData.price * seats.length;
    const newBooking = new Booking({
      user: decoded.userId,
      show,
      seats,
      totalAmount,
      status: "confirmed",
    });
    await newBooking.save();

    const seatNumbersToBook = seats.map((s) => String(s));

    const updatedShow = await Show.findByIdAndUpdate(
      show,
      { $set: { "seats.$[elem].isBooked": true } },
      {
        arrayFilters: [{ "elem.number": { $in: seatNumbersToBook } }],
        new: true,
      }
    );
    if (!updatedShow) {
      console.warn("Warning: show update returned null for id:", show);
    } else {
      const bookedCount = updatedShow.seats.filter((s) => s.isBooked).length;
      console.log(
        `Updated show ${show}: ${bookedCount} seats are currently booked`
      );
    }
    res
      .status(201)
      .json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
