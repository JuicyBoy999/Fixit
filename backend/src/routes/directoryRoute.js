
import express from 'express';
import {
  listDirectory,
  setAccountStatus,
  exportDirectoryCsv,
} from '../controllers/directoryController.js';
import authMiddleware from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import activityTimeout from '../middleware/activityTimeout.js';

const router = express.Router();
router.use(authMiddleware, roleCheck('admin'), activityTimeout);
router.get('/',            listDirectory);
router.get('/export',      exportDirectoryCsv);
router.patch('/:id/status', setAccountStatus);

export default router;
