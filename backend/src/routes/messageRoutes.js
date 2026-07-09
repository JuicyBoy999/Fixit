import express from 'express';
import * as messageController from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, messageController.createMessage);
router.get('/:repairId', authMiddleware, messageController.getMessages);
router.post('/:id/flag', authMiddleware, messageController.flagMessage);

export default router;
