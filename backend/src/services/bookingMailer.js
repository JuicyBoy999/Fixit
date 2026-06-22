import transporter from '../config/mailer.js';

// Sends a booking confirmation email to the customer.
// Required by the "Booking Confirmation Email" feature — includes technician
// name, device, date/time and address. Never throws to the caller so a mail
// failure can't break the booking itself.
export const sendBookingConfirmation = async ({ to, customerName, technicianName, device, date, time, address }) => {
  if (!to) return { sent: false, reason: 'no recipient email' };
  if (!process.env.EMAIL_USER) return { sent: false, reason: 'email not configured' };

  const when = `${date}${time ? ' at ' + time : ''}`;
  const tech = technicianName || 'A certified technician';

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: 'Fixit – Your repair booking is confirmed',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: auto;">
          <h2>Booking Confirmed ✅</h2>
          <p>Hi ${customerName || 'there'}, your repair has been booked. Here are the details:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding:6px 0;color:#666;">Technician</td><td style="padding:6px 0;"><b>${tech}</b></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Device</td><td style="padding:6px 0;"><b>${device}</b></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Date &amp; time</td><td style="padding:6px 0;"><b>${when}</b></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Address</td><td style="padding:6px 0;"><b>${address || '—'}</b></td></tr>
          </table>
          <p style="color:#666;font-size:13px;">Need to change it? You can cancel or reschedule any time from your dashboard.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error('Booking confirmation email failed:', err.message);
    return { sent: false, reason: err.message };
  }
};
