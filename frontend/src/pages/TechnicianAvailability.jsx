import { useState } from 'react';
import logo from '../assets/image.png';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
];

const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const TODAY = 15; // simulate today

const defaultHours = {
  Monday:    { enabled: true,  start: '9:00 AM', end: '5:00 PM' },
  Tuesday:   { enabled: true,  start: '9:00 AM', end: '5:00 PM' },
  Wednesday: { enabled: true,  start: '9:00 AM', end: '5:00 PM' },
  Thursday:  { enabled: true,  start: '9:00 AM', end: '5:00 PM' },
  Friday:    { enabled: true,  start: '9:00 AM', end: '3:00 PM' },
  Saturday:  { enabled: false, start: '10:00 AM', end: '2:00 PM' },
  Sunday:    { enabled: false, start: '10:00 AM', end: '2:00 PM' },
};

export default function TechnicianAvailability() {
  const [hours, setHours] = useState(defaultHours);
  const [activeTab, setActiveTab] = useState('hours');
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [saved, setSaved] = useState(false);
  const [bookedSlots] = useState({ 15: ['10:00 AM', '11:00 AM', '2:00 PM'], 17: ['9:00 AM'], 20: ['1:00 PM', '2:00 PM', '3:00 PM'] });

  const toggleDay = (day) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  };

  const updateHour = (day, field, value) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Get day name for calendar (simulate month starting on Wednesday)
  const getDayName = (dayNum) => DAYS[(dayNum + 1) % 7];

  const isWorkingDay = (dayNum) => {
    const dayName = getDayName(dayNum);
    return hours[dayName]?.enabled;
  };

  const isSlotAvailable = (slot) => {
    const booked = bookedSlots[selectedDay] || [];
    const dayName = getDayName(selectedDay);
    const dayConfig = hours[dayName];
    if (!dayConfig?.enabled) return false;
    const startIdx = TIME_SLOTS.indexOf(dayConfig.start);
    const endIdx = TIME_SLOTS.indexOf(dayConfig.end);
    const slotIdx = TIME_SLOTS.indexOf(slot);
    if (slotIdx < startIdx || slotIdx >= endIdx) return false;
    if (booked.includes(slot)) return false;
    return true;
  };

  const getSlotStatus = (slot) => {
    const booked = bookedSlots[selectedDay] || [];
    const dayName = getDayName(selectedDay);
    const dayConfig = hours[dayName];
    if (!dayConfig?.enabled) return 'off';
    const startIdx = TIME_SLOTS.indexOf(dayConfig.start);
    const endIdx = TIME_SLOTS.indexOf(dayConfig.end);
    const slotIdx = TIME_SLOTS.indexOf(slot);
    if (slotIdx < startIdx || slotIdx >= endIdx) return 'outside';
    if (booked.includes(slot)) return 'booked';
    return 'available';
  };

  const inputStyle = {
    padding: '7px 10px', background: '#A3D8EC',
    border: '1px solid #8FCBE3', borderRadius: 6,
    color: '#16303D', fontSize: 13, outline: 'none', cursor: 'pointer'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EAF7FC', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
          <div style={{ width: 36, height: 36, background: '#38bdf8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden' }}>
            <img src={logo} alt="Fixit" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <span style={{ color: '#16303D', fontWeight: 700, fontSize: 18 }}>Fixit</span>
          <span style={{ color: '#4E7182', marginLeft: 4 }}>/ Availability</span>
        </div>

        <h2 style={{ color: '#16303D', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Working Hours & Availability</h2>
        <p style={{ color: '#4E7182', fontSize: 14, marginBottom: '1.5rem' }}>Set your schedule so customers only see your free slots</p>

        {}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: '#CFEEF8', borderRadius: 10, padding: 4 }}>
          {[['hours', '🕐 Working Hours'], ['calendar', '📅 Calendar Preview']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: activeTab === tab ? '#38bdf8' : 'transparent',
              color: activeTab === tab ? '#16303D' : '#4E7182',
              fontWeight: 600, fontSize: 14, transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {activeTab === 'hours' ? (
          <div style={{ background: '#CFEEF8', borderRadius: 16, padding: '2rem', boxShadow: '0 25px 50px rgba(18,50,71,0.25)' }}>

            <p style={{ color: '#4E7182', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: '1rem' }}>SET WORKING HOURS PER DAY</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DAYS.map(day => (
                <div key={day} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 10,
                  background: hours[day].enabled ? 'rgba(56,189,248,0.07)' : '#EAF7FC',
                  border: `1.5px solid ${hours[day].enabled ? '#8FCBE3' : '#EAF7FC'}`,
                  transition: 'all 0.15s'
                }}>
                  {}
                  <div onClick={() => toggleDay(day)} style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                    background: hours[day].enabled ? '#38bdf8' : '#8FCBE3',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0
                  }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: hours[day].enabled ? 20 : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s'
                    }} />
                  </div>

                  {}
                  <span style={{ color: hours[day].enabled ? '#16303D' : '#4E7182', fontWeight: 600, fontSize: 14, width: 100, flexShrink: 0 }}>
                    {day}
                  </span>

                  {hours[day].enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <select value={hours[day].start} onChange={e => updateHour(day, 'start', e.target.value)} style={inputStyle}>
                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span style={{ color: '#4E7182', fontSize: 13 }}>to</span>
                      <select value={hours[day].end} onChange={e => updateHour(day, 'end', e.target.value)} style={inputStyle}>
                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span style={{ color: '#38bdf8', fontSize: 12, marginLeft: 'auto' }}>
                        ✓ Open
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#4E7182', fontSize: 13 }}>Day Off</span>
                  )}
                </div>
              ))}
            </div>

            {}
            <div style={{ display: 'flex', gap: 20, marginTop: '1.5rem', padding: '12px 16px', background: '#A3D8EC', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
                <span style={{ color: '#16303D', fontSize: 12 }}>Working day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8FCBE3' }} />
                <span style={{ color: '#16303D', fontSize: 12 }}>Day off</span>
              </div>
            </div>

            <button onClick={handleSave} style={{
              width: '100%', padding: '13px', marginTop: '1.5rem',
              background: saved ? '#22c55e' : '#38bdf8',
              color: '#16303D', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.3s'
            }}>
              {saved ? '✓ Schedule Saved!' : 'Save Schedule'}
            </button>
          </div>

        ) : (

          <div style={{ background: '#CFEEF8', borderRadius: 16, padding: '2rem', boxShadow: '0 25px 50px rgba(18,50,71,0.25)' }}>

            {}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#16303D', margin: 0, fontSize: 16, fontWeight: 700 }}>June 2025</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '6px 12px', background: '#A3D8EC', border: '1px solid #8FCBE3', borderRadius: 6, color: '#16303D', cursor: 'pointer' }}>‹</button>
                <button style={{ padding: '6px 12px', background: '#A3D8EC', border: '1px solid #8FCBE3', borderRadius: 6, color: '#16303D', cursor: 'pointer' }}>›</button>
              </div>
            </div>

            {}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ textAlign: 'center', color: '#4E7182', fontSize: 11, fontWeight: 600, padding: '6px 0' }}>{d}</div>
              ))}
            </div>

            {}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: '1.5rem' }}>
              {/* offset for month starting Wednesday */}
              {[null, null].map((_, i) => <div key={`empty-${i}`} />)}
              {CALENDAR_DAYS.map(day => {
                const working = isWorkingDay(day);
                const isSelected = day === selectedDay;
                const isToday = day === TODAY;
                const hasBooking = bookedSlots[day];
                return (
                  <div key={day} onClick={() => setSelectedDay(day)} style={{
                    aspectRatio: '1', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, cursor: 'pointer', position: 'relative',
                    background: isSelected ? '#38bdf8' : working ? 'rgba(56,189,248,0.08)' : '#EAF7FC',
                    border: `1.5px solid ${isSelected ? '#38bdf8' : isToday ? '#38bdf8' : working ? '#8FCBE3' : 'transparent'}`,
                    transition: 'all 0.15s'
                  }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isSelected ? '#16303D' : working ? '#16303D' : '#4E7182' }}>
                      {day}
                    </span>
                    {hasBooking && !isSelected && (
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b', marginTop: 2 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem' }}>
              {[
                { color: 'rgba(56,189,248,0.08)', border: '#8FCBE3', label: 'Available' },
                { color: '#EAF7FC', border: 'transparent', label: 'Day off (greyed out)' },
                { color: '#38bdf8', border: '#38bdf8', label: 'Selected day' },
                { color: '#f59e0b', border: 'none', label: '● Has bookings', dot: true },
              ].map(({ color, border, label, dot }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {dot ? (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `1.5px solid ${border}` }} />
                  )}
                  <span style={{ color: '#4E7182', fontSize: 12 }}>{label}</span>
                </div>
              ))}
            </div>

            {}
            <div style={{ borderTop: '1px solid #8FCBE3', paddingTop: '1.5rem' }}>
              <p style={{ color: '#4E7182', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: '1rem' }}>
                TIME SLOTS — {getDayName(selectedDay).toUpperCase()} {selectedDay}
              </p>

              {!isWorkingDay(selectedDay) ? (
                <div style={{ padding: '1rem', background: '#EAF7FC', borderRadius: 10, textAlign: 'center' }}>
                  <p style={{ color: '#4E7182', margin: 0, fontSize: 14 }}>🚫 Day off — no slots available</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {TIME_SLOTS.map(slot => {
                    const status = getSlotStatus(slot);
                    const colors = {
                      available: { bg: 'rgba(34,197,94,0.1)', border: '#22c55e', color: '#22c55e', label: 'Free' },
                      booked:    { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', color: '#ef4444', label: 'Booked' },
                      outside:   { bg: '#EAF7FC', border: '#EAF7FC', color: '#4E7182', label: 'Closed' },
                      off:       { bg: '#EAF7FC', border: '#EAF7FC', color: '#4E7182', label: 'Off' },
                    }[status];
                    return (
                      <div key={slot} style={{
                        padding: '10px 8px', borderRadius: 8, textAlign: 'center',
                        background: colors.bg, border: `1.5px solid ${colors.border}`,
                      }}>
                        <p style={{ color: status === 'outside' || status === 'off' ? '#4E7182' : '#16303D', margin: 0, fontSize: 13, fontWeight: 600 }}>{slot}</p>
                        <p style={{ color: colors.color, margin: '2px 0 0', fontSize: 11 }}>{colors.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
