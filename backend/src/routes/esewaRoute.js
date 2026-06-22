import express from 'express';
import { initiateEsewaPayment, verifyEsewaPayment } from '../controllers/esewaController.js';

const router = express.Router();

router.post('/initiate', initiateEsewaPayment);
router.post('/verify', verifyEsewaPayment);

export default router;