
import express from 'express';
import {
  getOverview,
  getBookingsOverTime,
  getUserGrowth,
  getRevenueReport,
  exportRevenueCsv,
} from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();
router.use(authMiddleware, roleCheck('admin'), activityTimeout);

router.get('/overview',           getOverview);
router.get('/bookings-over-time', getBookingsOverTime);
router.get('/user-growth',        getUserGrowth);
router.get('/revenue',            getRevenueReport);
router.get('/revenue/export',     exportRevenueCsv);

export default router;
