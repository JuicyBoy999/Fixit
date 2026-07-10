import {
  getNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../models/notificationModel.js';

export const fetchNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getNotifications(userId);
    const unread = notifications.filter(n => !n.is_read).length;
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    if (!user_id || !message) {
      return res.status(400).json({ error: 'user_id and message are required' });
    }
    const notification = await addNotification(user_id, title, message, type);
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationRead(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await markAllNotificationsRead(userId);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await deleteNotification(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
