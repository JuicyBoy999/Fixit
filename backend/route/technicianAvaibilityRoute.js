import express from 'express';
import { saveAvailability, getAvailability } from '../controller/technicianAvaibilityController.js';

const router = express.Router();

router.post('/availability', saveAvailability);
router.get('/availability', getAvailability);

export default router;