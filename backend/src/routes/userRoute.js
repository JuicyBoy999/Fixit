import express from 'express';
import { addUser, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/create', addUser);
router.put('/profile/:id', updateProfile);

export default router;
