import express from 'express';
import { addUser, updateProfile } from '../controller/userController.js';

const router = express.Router();

router.post('/create', addUser);
router.put('/profile/:id', updateProfile);

export default router;