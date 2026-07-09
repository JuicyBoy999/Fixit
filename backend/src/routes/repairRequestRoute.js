import express from 'express';
import verifyToken from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import {
  listRepairRequests,
  getRepairRequestById,
  createRepairRequest,
  updateRepairRequestStatus,
  listMyRepairRequests,
  claimOrphanedBookings,
  getUpcomingReminders,
  cancelRepairRequest,
  rescheduleRepairRequest,
  runAppointmentReminders,
} from '../controllers/repairRequestController.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key'); } catch {}
  }
  next();
};

router.get('/debug-all',             async (req, res) => {
  const { default: pool } = await import('../config/db.js');
  const { rows } = await pool.query('SELECT id, customer_id, device_type, status, created_at FROM repair_requests ORDER BY id DESC LIMIT 10');
  res.json(rows);
});
router.get('/list',                  verifyToken, listRepairRequests);
router.get('/my/:customerId',        listMyRepairRequests);
router.post('/claim/:customerId',    claimOrphanedBookings);
router.get('/reminders/:customerId', getUpcomingReminders);
router.post('/run-reminders',        runAppointmentReminders);
router.get('/:id',                   getRepairRequestById);
router.post('/create',               optionalAuth, createRepairRequest);
router.patch('/:id/status',          verifyToken, updateRepairRequestStatus);
router.patch('/:id/cancel',          cancelRepairRequest);
router.patch('/:id/reschedule',      rescheduleRepairRequest);

export default router;
