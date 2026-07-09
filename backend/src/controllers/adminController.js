import jwt from 'jsonwebtoken';
import { getUserByEmail, getUserById, getManageableUsers, updateUserStatus } from '../models/userModel.js';
import { getManageableTechnicians, getTechnicianAccountById, updateTechnicianStatus } from '../models/technicianModel.js';
import * as messageModel from '../models/messageModel.js';
import { sendAccountStatusEmail, sendWarningEmail } from '../services/notificationService.js';
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

    if (user.status === 'suspended' || user.status === 'deactivated') {
      return res.status(403).json({ message: 'Account access has been suspended' });
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

const normalizeAccount = (account, type) => ({
  id: account.id,
  type,
  userId: account.user_id || (type === 'user' ? account.id : null),
  name: type === 'technician'
    ? account.full_name
    : `${account.first_name} ${account.last_name}`,
  email: account.email || 'No linked email',
  role: type,
  city: account.city || account.location || 'N/A',
  status: account.status || 'active',
  createdAt: account.created_at,
});

export const getAccounts = async (_req, res) => {
  try {
    const [users, technicians] = await Promise.all([
      getManageableUsers(),
      getManageableTechnicians(),
    ]);

    res.json({
      accounts: [
        ...users.map((user) => normalizeAccount(user, 'user')),
        ...technicians.map((technician) => normalizeAccount(technician, 'technician')),
      ],
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSuspendedAccounts = async (_req, res) => {
  try {
    const [users, technicians] = await Promise.all([
      getManageableUsers(),
      getManageableTechnicians(),
    ]);

    const accounts = [
      ...users.map((user) => normalizeAccount(user, 'user')),
      ...technicians.map((technician) => normalizeAccount(technician, 'technician')),
    ].filter((account) => account.status === 'suspended');

    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching suspended accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const setAccountStatus = async ({ accountType, accountId, status, reason }) => {
  if (accountType === 'user') {
    const user = await updateUserStatus(accountId, status);
    if (!user) return null;

    if (status === 'suspended') {
      await sendAccountStatusEmail(user.email, user.first_name, status, reason);
    }

    return normalizeAccount(user, 'user');
  }

  if (accountType === 'technician') {
    const technician = await getTechnicianAccountById(accountId);
    if (!technician) return null;

    const updatedTechnician = await updateTechnicianStatus(accountId, status);

    if (technician.user_id) {
      await updateUserStatus(technician.user_id, status);
    }

    if (status === 'suspended' && technician.email) {
      await sendAccountStatusEmail(
        technician.email,
        technician.first_name || technician.full_name,
        status,
        reason
      );
    }

    return normalizeAccount({ ...technician, ...updatedTechnician }, 'technician');
  }

  return undefined;
};

export const suspendAccount = async (req, res) => {
  const { accountType, accountId } = req.params;
  const { reason } = req.body;

  if (!['user', 'technician'].includes(accountType)) {
    return res.status(400).json({ message: 'Invalid account type' });
  }

  try {
    const account = await setAccountStatus({
      accountType,
      accountId,
      status: 'suspended',
      reason: reason?.trim() || 'An administrator suspended your FixIt account.',
    });

    if (account === undefined) {
      return res.status(400).json({ message: 'Invalid account type' });
    }

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ message: 'Account suspended successfully', account });
  } catch (error) {
    console.error('Error suspending account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const reinstateAccount = async (req, res) => {
  const { accountType, accountId } = req.params;

  if (!['user', 'technician'].includes(accountType)) {
    return res.status(400).json({ message: 'Invalid account type' });
  }

  try {
    const account = await setAccountStatus({
      accountType,
      accountId,
      status: 'active',
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ message: 'Account reinstated successfully', account });
  } catch (error) {
    console.error('Error reinstating account:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
