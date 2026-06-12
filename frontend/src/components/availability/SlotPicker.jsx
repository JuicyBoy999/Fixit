import { useEffect, useState } from 'react';
import './SlotPicker.css';

export default function SlotPicker({ technicianId, date, onSelect, selectedSlot }) {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!technicianId || !date) { setSlots([]); return; }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    console.log('token in SlotPicker:', token);

    fetch(
      `http://localhost:5000/api/availability/${technicianId}/slots?date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    )
      .then(r => r.json())
      .then(data => {
        console.log('slots data:', data);
        if (data.slots) setSlots(data.slots);
        else setError('Could not load slots.');
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, [technicianId, date]);

  if (!date || !technicianId) return null;

  return (
    <div className="sp-wrapper">
      <p className="sp-label">Available times on {date}</p>

      {loading && <p className="sp-hint">Loading slots…</p>}
      {error   && <p className="sp-hint sp-hint--err">{error}</p>}

      {!loading && !error && (
        <div className="sp-grid">
          {slots.map(slot => (
            <button
              key={slot.time}
              disabled={!slot.available}
              className={[
                'sp-slot',
                !slot.available            ? 'sp-slot--grey'     : '',
                slot.time === selectedSlot ? 'sp-slot--selected' : '',
              ].join(' ')}
              onClick={() => slot.available && onSelect(slot.time)}
            >
              {slot.time}
              {!slot.available && <span className="sp-unavail-dot" />}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && slots.length > 0 && slots.every(s => !s.available) && (
        <p className="sp-hint">No slots available on this date. Please choose another day.</p>
      )}
    </div>
  );
}