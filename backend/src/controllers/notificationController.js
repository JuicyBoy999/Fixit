import {
  getNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../models/notificationModel.js';

// GET /api/notifications/:userId  — list a user's notifications
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

// POST /api/notifications  — create a notification
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

// PATCH /api/notifications/:id/read  — mark one as read
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

// PATCH /api/notifications/:userId/read-all  — mark all of a user's as read
export const readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await markAllNotificationsRead(userId);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notifications/:id  — dismiss (delete) a notification
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
