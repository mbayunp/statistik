const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

router.post('/verify-pin', authController.verifyPin);

router.post('/reset-password', authController.resetPasswordViaPin);

module.exports = router;