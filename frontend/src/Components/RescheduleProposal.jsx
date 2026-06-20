import { useState } from "react";

function RescheduleProposal() {
  const [messages, setMessages] = useState([
    {
      sender: "System",
      text: "Appointment scheduled for June 20, 2026 at 10:00 AM",
    },
  ]);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("Pending");

  const sendProposal = () => {
    if (!newDate || !newTime || !reason) {
      alert("Fill all fields");
      return;
    }

    const proposalMessage = {
      sender: "Technician",
      text: `I would like to reschedule your appointment to ${newDate} at ${newTime}. Reason: ${reason}`,
    };

    setMessages([...messages, proposalMessage]);
  };

  const acceptProposal = () => {
    setStatus("Accepted");

    setMessages((prev) => [
      ...prev,
      {
        sender: "Customer",
        text: "I accept the new appointment time.",
      },
    ]);
  };

  const rejectProposal = () => {
    setStatus("Rejected");

    setMessages((prev) => [
      ...prev,
      {
        sender: "Customer",
        text: "I reject the proposed schedule.",
      },
    ]);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto" }}>
      <h1>Technician Reschedule Proposal Chat</h1>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}: </strong>
            {msg.text}
          </div>
        ))}
      </div>

      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
      />

      <br />
      <br />

      <input
        type="time"
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br />
      <br />

      <button onClick={sendProposal}>
        Send Proposal
      </button>

      <hr />

      <button onClick={acceptProposal}>
        Accept
      </button>

      <button
        onClick={rejectProposal}
        style={{ marginLeft: "10px" }}
      >
        Reject
      </button>

      <h3>Status: {status}</h3>
    </div>
  );
}

export default RescheduleProposal;