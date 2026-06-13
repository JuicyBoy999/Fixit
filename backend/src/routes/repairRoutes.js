import express from 'express';
import * as repairController from '../controllers/repairController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, repairController.createRepairBooking);
router.get('/history', authMiddleware, repairController.getRepairHistory);
router.get('/:id', authMiddleware, repairController.getRepairDetails);

export default router; 
