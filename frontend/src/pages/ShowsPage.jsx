import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import ShowCard from "../components/ShowCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import "./ShowsPage.css";

const ShowsPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchShowsForMovie();
  }, [movieId]);

  const fetchShowsForMovie = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shows");
      const allShows = response.data.shows || [];

      // Filter shows for this movie
      const movieShows = allShows.filter(
        (show) => show.movie?._id === movieId || show.movie === movieId
      );

      if (movieShows.length > 0 && movieShows[0].movie) {
        setMovie(movieShows[0].movie);
      }

      setShows(movieShows);
    } catch (error) {
      console.error("Failed to fetch shows:", error);
      setError("Failed to load shows. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowSelect = (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    setShowModal(true);
  };

  const handleSeatToggle = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    navigate("/booking", {
      state: {
        show: selectedShow,
        seats: selectedSeats,
        movie: movie,
      },
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading shows..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back to Movies
          </button>
          {movie && (
            <>
              <h1 className="page-title">{movie.title}</h1>
              <p className="page-subtitle">Select a show time</p>
            </>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {shows.length > 0 ? (
          <div className="shows-grid">
            {shows.map((show) => (
              <ShowCard
                key={show._id}
                show={show}
                onSelect={handleShowSelect}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No shows available for this movie</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Select Your Seats"
          maxWidth="800px"
        >
          {selectedShow && (
            <div className="seat-selection">
              <div className="screen-indicator">SCREEN</div>

              <div className="seats-grid">
                {selectedShow.seats?.map((seat) => (
                  <button
                    key={seat.number}
                    className={`seat ${seat.isBooked ? "booked" : ""} ${
                      selectedSeats.includes(seat.number) ? "selected" : ""
                    }`}
                    onClick={() =>
                      !seat.isBooked && handleSeatToggle(seat.number)
                    }
                    disabled={seat.isBooked}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>

              <div className="seat-legend">
                <div className="legend-item">
                  <span className="legend-seat available"></span>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <span className="legend-seat selected"></span>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <span className="legend-seat booked"></span>
                  <span>Booked</span>
                </div>
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Selected Seats:</span>
                  <span className="summary-value">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(", ")
                      : "None"}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <span className="summary-value amount">
                    ${(selectedShow.price * selectedSeats.length).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={handleBooking}
                disabled={selectedSeats.length === 0}
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default ShowsPage;
