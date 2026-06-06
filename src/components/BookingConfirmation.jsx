import "./BookingConfirmation.css";

function BookingConfirmation({ booking }) {
  return (
    <div className="booking-confirmation">
      <h1>Booking Confirmed 🎉</h1>

      <div className="summary-card">
        <h2>Booking Summary</h2>

        <div className="detail-row">
          <span>Booking ID:</span>
          <strong>{booking.id}</strong>
        </div>

        <div className="detail-row">
          <span>Customer Name:</span>
          <strong>{booking.customerName}</strong>
        </div>

        <div className="detail-row">
          <span>Service:</span>
          <strong>{booking.service}</strong>
        </div>

        <div className="detail-row">
          <span>Device:</span>
          <strong>{booking.device}</strong>
        </div>

        <div className="detail-row">
          <span>Issue:</span>
          <strong>{booking.issue}</strong>
        </div>

        <div className="detail-row">
          <span>Date:</span>
          <strong>{booking.date}</strong>
        </div>

        <div className="detail-row">
          <span>Time:</span>
          <strong>{booking.time}</strong>
        </div>

        <div className="detail-row">
          <span>Address:</span>
          <strong>{booking.address}</strong>
        </div>

        <div className="detail-row">
          <span>Status:</span>
          <strong className="confirmed">
            Confirmed
          </strong>
        </div>

        <button
          className="print-btn"
          onClick={() => window.print()}
        >
          Print Confirmation
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmation;