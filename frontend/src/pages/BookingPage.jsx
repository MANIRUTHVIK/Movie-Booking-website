import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./BookingPage.css";

// Load Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_test_51Rix75R3ATzy77CyOWUTsMjMgwPX0sjS2oM8LIL02dHW9d7glQ2BPWd6sprAuesFsNX88RCBc5DvLBtuPuNhv5Hg000Xjk3SN8"
);

// Stripe Elements styling
const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#303330",
      "::placeholder": {
        color: "#666",
      },
      backgroundColor: "#f3f4f6",
    },
    invalid: {
      color: "#ff6b6b",
    },
  },
};

// Payment Form Component (uses Stripe Elements)
const PaymentForm = ({ show, seats, movie }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = show.price * seats.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) {
      setError("Stripe is not loaded yet");
      return;
    }

    if (!holderName.trim()) {
      setError("Cardholder name is required");
      return;
    }

    setLoading(true);

    try {
      // Create payment method using Stripe Elements
      const cardElement = elements.getElement(CardNumberElement);

      if (!cardElement) {
        setError("Card element not found");
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: holderName,
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Card validation failed");
        setLoading(false);
        return;
      }

      // Send payment method ID to backend
      const response = await api.post("/bookings", {
        show: show._id,
        seats: seats,
        paymentMethod: "stripe",
        paymentMethodId: paymentMethod.id,
      });

      // Booking successful
      alert("Booking confirmed! Check your profile for details.");
      navigate("/profile");
    } catch (error) {
      console.error("Booking failed:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Booking failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="payment-section">
      {loading && (
        <div style={{ position: "relative", minHeight: "200px" }}>
          <LoadingSpinner message="Processing payment..." />
        </div>
      )}

      <div style={{ display: loading ? "none" : "block" }}>
        <h2 className="section-title">Payment Details</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <div className="stripe-element">
              <CardNumberElement options={ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <div className="stripe-element">
                <CardExpiryElement options={ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="form-group">
              <label>CVC</label>
              <div className="stripe-element">
                <CardCvcElement options={ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>

          <div className="test-card-info">
            <p>
              <strong>Test Card:</strong> 4242 4242 4242 4242
            </p>
            <p>Use any future expiry date and any 3-digit CVC</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!stripe || loading}
          >
            {loading
              ? "Processing..."
              : `Pay $${totalAmount.toFixed(2)} & Confirm Booking`}
          </button>
        </form>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { show, seats, movie } = location.state || {};

  if (!show || !seats || seats.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-message">
            Invalid booking data. Please try again.
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Homepage
          </button>
        </div>
      </>
    );
  }

  const totalAmount = show.price * seats.length;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Complete Booking</h1>
        </div>

        <div className="booking-layout">
          <div className="booking-details-section">
            <h2 className="section-title">Booking Summary</h2>
            <div className="details-card">
              {movie && (
                <div className="detail-row">
                  <span className="detail-label">Movie:</span>
                  <span className="detail-value">{movie.title}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Show Date:</span>
                <span className="detail-value">{show.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Show Time:</span>
                <span className="detail-value">{show.time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Screen:</span>
                <span className="detail-value">Screen {show.screen}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Seats:</span>
                <span className="detail-value">{seats.join(", ")}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Price per seat:</span>
                <span className="detail-value">${show.price}</span>
              </div>
              <div className="detail-row total">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value amount">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm show={show} seats={seats} movie={movie} />
          </Elements>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
