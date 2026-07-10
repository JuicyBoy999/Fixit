
import express from 'express';
import { getLeaderboard, exportLeaderboardCsv } from '../controllers/leaderboardController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();
router.use(authMiddleware, roleCheck('admin'), activityTimeout);
router.get('/', getLeaderboard);
router.get('/export', exportLeaderboardCsv);

export default router;
