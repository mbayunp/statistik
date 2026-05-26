const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/verify-pin
router.post('/verify-pin', authController.verifyPin);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPasswordViaPin);

module.exports = router;