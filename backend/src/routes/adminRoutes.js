import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();

router.post('/login', adminController.login);

router.get('/dashboard', authMiddleware, roleCheck('admin'), activityTimeout, adminController.dashboard);
router.get('/flagged-messages', authMiddleware, roleCheck('admin'), activityTimeout, adminController.getFlaggedMessages);
router.delete('/messages/:id', authMiddleware, roleCheck('admin'), activityTimeout, adminController.deleteMessage);
router.post('/users/:userId/warn', authMiddleware, roleCheck('admin'), activityTimeout, adminController.warnUser);

export default router;
