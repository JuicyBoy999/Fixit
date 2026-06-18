import express from 'express';
import verifyToken from '../middleware/auth.js';
import {
  listRepairRequests,
  getRepairRequestById,
  createRepairRequest,
  updateRepairRequestStatus,
} from '../controllers/repairRequestController.js';

const router = express.Router();

router.get('/list',         verifyToken, listRepairRequests);
router.get('/:id',          getRepairRequestById);
router.post('/create',      createRepairRequest);
router.patch('/:id/status', verifyToken, updateRepairRequestStatus);

export default router;