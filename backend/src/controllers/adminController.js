import jwt from 'jsonwebtoken';
import { getUserByEmail, getUserById } from '../models/userModel.js';
import * as messageModel from '../models/messageModel.js';
import { sendWarningEmail } from '../services/notificationService.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const dashboard = (req, res) => {
  res.json({ message: 'Welcome to admin dashboard' });
};

export const getFlaggedMessages = async (req, res) => {
  try {
    const messages = await messageModel.getFlaggedMessages();
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await messageModel.deleteMessage(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully', deleted });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const warnUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const adminId = req.user.id;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Warning reason is required' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Record warning in database
    const warning = await messageModel.createWarning(userId, adminId, reason.trim());

    // Send email notification
    await sendWarningEmail(user.email, user.first_name, reason.trim());

    res.json({ message: 'Warning issued successfully', warning });
  } catch (error) {
    console.error('Error issuing warning:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

