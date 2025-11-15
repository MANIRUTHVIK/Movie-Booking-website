import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import BookingCard from "../components/BookingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading profile..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            View your account details and bookings
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-layout">
          <div className="profile-card">
            <h2 className="section-title">Account Information</h2>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role:</span>
                <span className="info-value role-badge">
                  {user?.role || "user"}
                </span>
              </div>
            </div>
          </div>

          <div className="bookings-section">
            <h2 className="section-title">My Bookings</h2>

            {bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No bookings yet</p>
                <p className="sub-text">
                  Book your first movie to see it here!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
