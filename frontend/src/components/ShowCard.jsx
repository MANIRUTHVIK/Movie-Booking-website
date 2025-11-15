import "./ShowCard.css";

const ShowCard = ({ show, onSelect }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const availableSeats = show.seats?.filter((s) => !s.isBooked).length || 0;

  return (
    <div className="show-card fade-in">
      <div className="show-info">
        <div className="show-datetime">
          <span className="show-date">{formatDate(show.date)}</span>
          <span className="show-time">{show.time}</span>
        </div>
        <div className="show-details">
          <span className="show-screen">Screen {show.screen}</span>
          <span className="show-price">${show.price}</span>
        </div>
        <div className="show-seats">
          <span
            className={`seats-available ${
              availableSeats === 0 ? "sold-out" : ""
            }`}
          >
            {availableSeats > 0
              ? `${availableSeats} seats available`
              : "Sold Out"}
          </span>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => onSelect(show)}
        disabled={availableSeats === 0}
      >
        {availableSeats > 0 ? "Select Seats" : "Sold Out"}
      </button>
    </div>
  );
};

export default ShowCard;
