import express from 'express';
import * as technicianController from '../controllers/technicianController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', technicianController.listTechnicians);
router.get('/me', authMiddleware, technicianController.getMyTechnicianProfile);
router.put('/me', authMiddleware, technicianController.updateMyTechnicianProfile);
router.get('/:id', technicianController.getTechnicianProfile);

export default router;
