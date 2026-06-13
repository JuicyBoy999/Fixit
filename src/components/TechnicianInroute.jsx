import "./TechnicianInRoute.css";

function TechnicianInRoute({ name, eta }) {
  return (
    <div className="notification-card">
      <h1>🚚 Technician In Route</h1>

      <div className="status">
        In Route
      </div>

      <p>
        Technician <strong>{name}</strong> is on the way.
      </p>

      <p>
        Estimated Arrival Time: <strong>{eta}</strong>
      </p>
    </div>
  );
}

export default TechnicianInRoute;