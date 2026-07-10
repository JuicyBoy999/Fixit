import express from 'express';
import { initiateEsewaPayment, handleEsewaSuccess, handleEsewaFailure } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/esewa/initiate', initiateEsewaPayment);
router.get('/esewa/success', handleEsewaSuccess);
router.get('/esewa/failure', handleEsewaFailure);

export default router;
