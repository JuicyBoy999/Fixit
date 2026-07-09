import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, reviewController.submitReview);
router.patch('/:id', authMiddleware, reviewController.editReview);
router.get('/technicians/:technicianId', reviewController.getReviewsByTechnician);

export default router;
