import pool from '../config/db.js';
import transporter from '../config/mailer.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Find technicians matching the repair request city and device type (skill).
 * @param {string} city - The city of the repair request.
 * @param {string} deviceName - The name of the device (used to match skills).
 */
export const getMatchingTechnicians = async (city, deviceName) => {
  // Simple matching: city must match exactly, and deviceName should be partially matched in skills array
  // In a real app, we might use more sophisticated fuzzy matching or categories.
  const result = await pool.query(
    `SELECT tp.id, u.email, tp.full_name
     FROM technician_profiles tp
     JOIN users u ON tp.user_id = u.id
     WHERE tp.location = $1 
     AND tp.status = 'active'
     AND u.status = 'active'
     AND EXISTS (
       SELECT 1 FROM unnest(tp.skills) s 
       WHERE $2 ILIKE '%' || s || '%' OR s ILIKE '%' || $2 || '%'
     )`,
    [city, deviceName]
  );
  return result.rows;
};

/**
 * Send notification emails to matching technicians.
 */
export const notifyTechnicians = async (repair) => {
  const technicians = await getMatchingTechnicians(repair.city, repair.device_name);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const requestUrl = `${frontendUrl}/technicians/repair-requests/${repair.id}`;

  const emailPromises = technicians.map(tech => {
    return transporter.sendMail({
      from: `"FixIt Notifications" <${process.env.EMAIL_FROM}>`,
      to: tech.email,
      subject: `New Repair Request: ${repair.device_name} in ${repair.city}`,
      html: `
        <div style="background-color: #0d1117; color: #fff; font-family: 'Segoe UI', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 20px auto; border: 1px solid #1e2a3a;">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="width: 38px; height: 38px; background: #38bdf8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #0d1117; font-weight: bold; margin-right: 12px;">F</div>
            <span style="font-size: 20px; font-weight: 500;">Fix<b>It</b></span>
          </div>
          
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #fff;">New Request Nearby!</h1>
          <p style="color: #6b7a8d; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Hello ${tech.full_name}, a new repair request has been submitted in <b>${repair.city}</b> that matches your expertise.
          </p>
          
          <div style="background: #111827; border: 1px solid #1e2d40; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 8px; color: #8b9ab0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Device</p>
            <p style="margin: 0 0 16px; font-size: 18px; color: #fff;">${repair.device_name}</p>
            
            <p style="margin: 0 0 8px; color: #8b9ab0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Issue</p>
            <p style="margin: 0; color: #fff; line-height: 1.4;">${repair.issue_description}</p>
          </div>
          
          <a href="${requestUrl}" style="display: block; width: 100%; box-sizing: border-box; text-align: center; background: #38bdf8; color: #0d1117; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">View Request Details</a>
          
          <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #3d5068;">
            You are receiving this because your profile matches this request's location and skills.
          </p>
        </div>
      `
    });
  });

  try {
    await Promise.all(emailPromises);
    console.log(`Dispatched ${technicians.length} notification emails for repair ID ${repair.id}`);
  } catch (error) {
    console.error('Error dispatching technician notifications:', error);
  }
};

/**
 * Send warning notification emails to user.
 */
export const sendWarningEmail = async (email, firstName, reason) => {
  try {
    await transporter.sendMail({
      from: `"FixIt Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Community Guidelines Warning`,
      html: `
        <div style="background-color: #0d1117; color: #fff; font-family: 'Segoe UI', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 20px auto; border: 1px solid #1e2a3a;">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="width: 38px; height: 38px; background: #38bdf8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #0d1117; font-weight: bold; margin-right: 12px;">F</div>
            <span style="font-size: 20px; font-weight: 500;">Fix<b>It</b> Admin</span>
          </div>
          
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #f87171;">Community Guidelines Warning</h1>
          <p style="color: #6b7a8d; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Hello ${firstName},
          </p>
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            This email is to notify you that an administrator has issued a warning regarding content you sent on our chat platform. Please ensure all communication is respectful and adheres to community guidelines.
          </p>
          
          <div style="background: #111827; border: 1px solid #1e2d40; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 8px; color: #8b9ab0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Reason for Warning</p>
            <p style="margin: 0; color: #fff; line-height: 1.4;">${reason}</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #3d5068;">
            This is an administrative message. Replies to this email are not monitored.
          </p>
        </div>
      `
    });
    console.log(`Dispatched warning email to ${email}`);
  } catch (error) {
    console.error('Error sending warning email:', error);
  }
};

/**
 * Send account status notification emails to users and technicians.
 */
export const sendAccountStatusEmail = async (email, firstName, status, reason) => {
  try {
    await transporter.sendMail({
      from: `"FixIt Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `FixIt Account ${status === 'suspended' ? 'Suspended' : 'Updated'}`,
      html: `
        <div style="background-color: #0d1117; color: #fff; font-family: 'Segoe UI', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 20px auto; border: 1px solid #1e2a3a;">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="width: 38px; height: 38px; background: #38bdf8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #0d1117; font-weight: bold; margin-right: 12px;">F</div>
            <span style="font-size: 20px; font-weight: 500;">Fix<b>It</b> Admin</span>
          </div>

          <h1 style="font-size: 24px; margin-bottom: 16px; color: #f87171;">Account Suspended</h1>
          <p style="color: #6b7a8d; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Hello ${firstName},
          </p>
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Your FixIt account has been suspended by an administrator. You will not be able to sign in or use protected FixIt services while this action is active.
          </p>

          <div style="background: #111827; border: 1px solid #1e2d40; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 8px; color: #8b9ab0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Reason</p>
            <p style="margin: 0; color: #fff; line-height: 1.4;">${reason}</p>
          </div>

          <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #3d5068;">
            This action can be reversed by a FixIt administrator.
          </p>
        </div>
      `
    });
    console.log(`Dispatched ${status} email to ${email}`);
  } catch (error) {
    console.error('Error sending account status email:', error);
  }
};

export const sendPaymentConfirmationEmail = async (customerEmail, customerName, repairDetails) => {
  try {
    await transporter.sendMail({
      from: `"FixIt" <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: `Payment Confirmed — Your FixIt Repair`,
      html: `
        <div style="background-color:#0d1117;color:#fff;font-family:'Segoe UI',sans-serif;padding:40px;border-radius:16px;max-width:600px;margin:20px auto;border:1px solid #1e2a3a;">
          <div style="display:flex;align-items:center;margin-bottom:24px;">
            <div style="width:38px;height:38px;background:#38bdf8;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#0d1117;font-weight:bold;margin-right:12px;">F</div>
            <span style="font-size:20px;font-weight:500;">Fix<b>It</b></span>
          </div>
          <h1 style="font-size:24px;margin-bottom:16px;color:#4ade80;">Payment Confirmed ✓</h1>
          <p style="color:#6b7a8d;font-size:16px;line-height:1.5;margin-bottom:24px;">
            Hello ${customerName}, your repair service has been completed and payment recorded successfully.
          </p>
          <div style="background:#111827;border:1px solid #1e2d40;border-radius:12px;padding:20px;margin-bottom:30px;">
            <p style="margin:0 0 8px;color:#8b9ab0;font-size:12px;text-transform:uppercase;font-weight:600;">Device</p>
            <p style="margin:0 0 16px;font-size:18px;color:#fff;">${repairDetails.device_name}</p>
            <p style="margin:0 0 8px;color:#8b9ab0;font-size:12px;text-transform:uppercase;font-weight:600;">Amount</p>
            <p style="margin:0 0 16px;font-size:18px;color:#4ade80;">NPR ${repairDetails.cost ? repairDetails.cost.toLocaleString() : 'N/A'}</p>
            <p style="margin:0 0 8px;color:#8b9ab0;font-size:12px;text-transform:uppercase;font-weight:600;">Repair ID</p>
            <p style="margin:0;font-size:14px;color:#fff;">#${repairDetails.id}</p>
          </div>
          <p style="text-align:center;margin-top:30px;font-size:12px;color:#3d5068;">
            Thank you for using FixIt. Keep this email as your payment record.
          </p>
        </div>
      `
    });
    console.log(`Payment confirmation sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
};
