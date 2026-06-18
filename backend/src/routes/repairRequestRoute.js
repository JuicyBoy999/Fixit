import express from 'express';
import verifyToken from '../middleware/auth.js';
import {
  listRepairRequests,
  getRepairRequestById,
  createRepairRequest,
  updateRepairRequestStatus,
  listMyRepairRequests,
  getUpcomingReminders,
  cancelRepairRequest,
  rescheduleRepairRequest,
  runAppointmentReminders,
} from '../controllers/repairRequestController.js';

const router = express.Router();

router.get('/list',                 verifyToken, listRepairRequests);
router.get('/my/:customerId',       listMyRepairRequests);
router.get('/reminders/:customerId', getUpcomingReminders);
router.post('/run-reminders',       runAppointmentReminders);
router.get('/:id',                  getRepairRequestById);
router.post('/create',              createRepairRequest);
router.patch('/:id/status',         verifyToken, updateRepairRequestStatus);
router.patch('/:id/cancel',         cancelRepairRequest);
router.patch('/:id/reschedule',     rescheduleRepairRequest);

export default router;