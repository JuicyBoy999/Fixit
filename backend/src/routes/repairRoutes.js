import express from 'express';
import * as repairController from '../controllers/repairController.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, repairController.createRepairBooking);
router.get('/history', authMiddleware, repairController.getRepairHistory);
router.get('/:id', authMiddleware, repairController.getRepairDetails);
router.get('/:id/updates', authMiddleware, repairController.subscribeToUpdates);
router.patch('/:id/status', authMiddleware, roleMiddleware('technician', 'admin'), repairController.updateStatus);

export default router; 
