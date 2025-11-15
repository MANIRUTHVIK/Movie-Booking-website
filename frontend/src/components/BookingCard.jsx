import "./BookingCard.css";

const BookingCard = ({ booking }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "failed":
        return "status-failed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="booking-card fade-in">
      <div className="booking-header">
        <span className={`booking-status ${getStatusClass(booking.status)}`}>
          {booking.status?.toUpperCase()}
        </span>
        <span className="booking-date">{formatDate(booking.createdAt)}</span>
      </div>

      <div className="booking-details">
        <div className="booking-row">
          <span className="label">Seats:</span>
          <span className="value">{booking.seats?.join(", ") || "N/A"}</span>
        </div>
        <div className="booking-row">
          <span className="label">Amount:</span>
          <span className="value amount">${booking.totalAmount}</span>
        </div>
        {booking.paymentStatus && (
          <div className="booking-row">
            <span className="label">Payment:</span>
            <span className={`value ${getStatusClass(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
