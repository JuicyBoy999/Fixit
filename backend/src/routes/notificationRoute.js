import express from 'express';
import {
  fetchNotifications,
  createNotification,
  readNotification,
  readAllNotifications,
  removeNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId',            fetchNotifications);
router.post('/',                  createNotification);
router.patch('/:userId/read-all', readAllNotifications);
router.patch('/:id/read',         readNotification);
router.delete('/:id',             removeNotification);

export default router;
