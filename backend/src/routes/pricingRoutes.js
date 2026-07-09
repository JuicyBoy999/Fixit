import express from 'express';
import * as pricingController from '../controllers/pricingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/estimate', authMiddleware, pricingController.getEstimate);

export default router;
