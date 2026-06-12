import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();

router.post('/login', adminController.login);

router.get('/dashboard', authMiddleware, roleCheck('admin'), activityTimeout, adminController.dashboard);

export default router;
