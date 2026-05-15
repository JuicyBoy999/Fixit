const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetController');

router.post('/forgot-password', resetController.requestPasswordReset);
router.post('/reset-password', resetController.resetPassword);

module.exports = router;