
import express from 'express';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/roleCheck.js';
import {
  fetchWorkingHours,
  saveWorkingHours,
  fetchUnavailableDates,
  blockDate,
  unblockDate,
  fetchSlots,
  fetchTechnicians,
} from '../controllers/availabilityController.js';
const router = express.Router();

router.get('/:technicianId/hours',        verifyToken, requireRole('technician'), fetchWorkingHours);
router.post('/:technicianId/hours',       verifyToken, requireRole('technician'), saveWorkingHours);
router.get('/:technicianId/unavailable',  verifyToken, requireRole('technician'), fetchUnavailableDates);
router.post('/:technicianId/unavailable', verifyToken, requireRole('technician'), blockDate);
router.delete('/:technicianId/unavailable/:date', verifyToken, requireRole('technician'), unblockDate);

router.get('/:technicianId/slots', fetchSlots);
router.get('/technicians', fetchTechnicians);
router.get('/:technicianId/slots', fetchSlots);   
export default router;