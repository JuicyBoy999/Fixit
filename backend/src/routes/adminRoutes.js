const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const activityTimeout = require('../middleware/activityTimeout');

router.post('/login', adminController.login);

router.get('/dashboard', authMiddleware, roleCheck('admin'), activityTimeout, adminController.dashboard);

module.exports = router;