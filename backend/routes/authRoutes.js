const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register (dengan pembatas rate limit)
router.post('/register', authLimiter, authController.register);

// POST /api/auth/login (dengan pembatas rate limit)
router.post('/login', authLimiter, authController.login);

// POST /api/auth/verify-pin (dengan pembatas rate limit)
router.post('/verify-pin', authLimiter, authController.verifyPin);

// POST /api/auth/reset-password (dengan pembatas rate limit)
router.post('/reset-password', authLimiter, authController.resetPasswordViaPin);

// GET /api/auth/users (diproteksi authMiddleware)
router.get('/users', authMiddleware, authController.getAllUsers);

module.exports = router;