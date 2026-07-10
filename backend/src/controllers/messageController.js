import { getRepairById } from '../models/repairModel.js';
import { getUserById } from '../models/userModel.js';
import * as messageModel from '../models/messageModel.js';

export const createMessage = async (req, res) => {
  const { repairId, content } = req.body;
  const senderId = req.user.id;

  if (!repairId || !content || !content.trim()) {
    return res.status(400).json({ message: 'Repair ID and message content are required' });
  }

  try {
    const repair = await getRepairById(repairId);
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = repair.user_id === senderId;
    const isTechnician = req.user.role === 'technician';

    if (!isAdmin && !isOwner && !isTechnician) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newMessage = await messageModel.createMessage(repairId, senderId, content.trim());
    
    const sender = await getUserById(senderId);
    newMessage.sender_name = sender ? `${sender.first_name} ${sender.last_name}` : req.user.email;
    newMessage.sender_role = req.user.role;

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  const { repairId } = req.params;
  const userId = req.user.id;

  try {
    const repair = await getRepairById(repairId);
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = repair.user_id === userId;
    const isTechnician = req.user.role === 'technician';

    if (!isAdmin && !isOwner && !isTechnician) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await messageModel.getMessagesByRepairId(repairId);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const flagMessage = async (req, res) => {
  const { id } = req.params;
  const flaggedById = req.user.id;

  try {
    const updated = await messageModel.flagMessage(id, flaggedById);
    if (!updated) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message flagged successfully', updated });
  } catch (error) {
    console.error('Error flagging message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
