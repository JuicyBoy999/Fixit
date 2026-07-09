import express from 'express';
import * as technicianController from '../controllers/technicianController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, technicianController.listTechnicians);
router.get('/:id', authMiddleware, technicianController.getTechnicianProfile);

export default router;
