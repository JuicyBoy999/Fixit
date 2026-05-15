
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const User = require('../models/User');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DB_URL });

// For now, just log the reset link (no real email yet)
const sendResetEmail = async (email, resetUrl) => {
  console.log(`[EMAIL SIMULATION] To: ${email}\nReset link: ${resetUrl}`);
  // Later replace with SendGrid/Nodemailer
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Always return success to avoid email enumeration
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, used)
       VALUES ($1, $2, $3, $4)`,
      [user.id, resetToken, expiresAt, false]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE token = $1', [token]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};