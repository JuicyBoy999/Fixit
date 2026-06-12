import crypto from 'crypto';
import pool from '../config/db.js';
import transporter from '../config/mailer.js';          
import { getUserByEmail, updatePassword } from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const sendResetEmail = async (email, resetUrl) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,          
      to: email,
      subject: 'Fixit – Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #333;">Fixit Password Reset</h2>
          <p>You requested a password reset. Click the button below to set a new password. This link expires in 30 minutes.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p style="margin-top: 20px; color: #888;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;   
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); 

    await pool.query(
      'UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false',
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, used)
       VALUES ($1, $2, $3, $4)`,
      [user.id, resetToken, expiresAt, false]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    await sendResetEmail(user.email, resetUrl);

    res.json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const result = await pool.query(
      `SELECT user_id, expires_at FROM password_resets
       WHERE token = $1 AND used = false`,
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const { user_id, expires_at } = result.rows[0];
    if (new Date() > expires_at) {
      return res.status(400).json({ message: 'Reset token expired' });
    }

    await updatePassword(user_id, newPassword);
    await pool.query('UPDATE password_resets SET used = true WHERE token = $1', [token]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};