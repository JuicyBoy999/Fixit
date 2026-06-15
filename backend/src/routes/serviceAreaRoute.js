import express from 'express';
import verifyToken from '../middleware/auth.js';
import { saveServiceArea, fetchServiceArea } from '../controllers/serviceAreaController.js';

const router = express.Router();

router.get('/',  verifyToken, fetchServiceArea);
router.post('/', verifyToken, saveServiceArea);

export default router;