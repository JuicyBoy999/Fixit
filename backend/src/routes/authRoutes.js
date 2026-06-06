import express from 'express';
import * as resetController from '../controllers/resetController.js';
import { addUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', addUser);
router.post('/login', loginUser);
router.post('/forgot-password', resetController.requestPasswordReset);
router.post('/reset-password', resetController.resetPassword);

export default router;
