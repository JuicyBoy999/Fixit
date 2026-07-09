import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();

router.post('/login', adminController.login);

router.get('/dashboard', authMiddleware, roleCheck('admin'), activityTimeout, adminController.dashboard);
router.get('/accounts', authMiddleware, roleCheck('admin'), activityTimeout, adminController.getAccounts);
router.get('/accounts/suspended', authMiddleware, roleCheck('admin'), activityTimeout, adminController.getSuspendedAccounts);
router.patch('/accounts/:accountType/:accountId/suspend', authMiddleware, roleCheck('admin'), activityTimeout, adminController.suspendAccount);
router.patch('/accounts/:accountType/:accountId/reinstate', authMiddleware, roleCheck('admin'), activityTimeout, adminController.reinstateAccount);
router.get('/technician-verifications/pending', authMiddleware, roleCheck('admin'), activityTimeout, adminController.getPendingTechnicians);
router.patch('/technician-verifications/:technicianId/approve', authMiddleware, roleCheck('admin'), activityTimeout, adminController.approveTechnician);
router.patch('/technician-verifications/:technicianId/reject', authMiddleware, roleCheck('admin'), activityTimeout, adminController.rejectTechnician);
router.get('/flagged-messages', authMiddleware, roleCheck('admin'), activityTimeout, adminController.getFlaggedMessages);
router.delete('/messages/:id', authMiddleware, roleCheck('admin'), activityTimeout, adminController.deleteMessage);
router.post('/users/:userId/warn', authMiddleware, roleCheck('admin'), activityTimeout, adminController.warnUser);

export default router;
