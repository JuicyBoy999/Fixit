import BookingConfirmation from "./components/BookingConfirmation";

function App() {
  const bookingData = {
    id: "BK1025",
    customerName: "Sriyansh GC",
    service: "Home Appliance Repair",
    device: "Air Conditioner",
    issue: "Not Cooling",
    date: "04 June 2026",
    time: "2:00 PM",
    address: "Kathmandu, Nepal",
  };

  return (
    <div>
      <BookingConfirmation booking={bookingData} />
    </div>
  );
}

export default App;