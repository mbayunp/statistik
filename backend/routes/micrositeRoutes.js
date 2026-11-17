const express = require('express');
const router = express.Router();
const micrositeController = require('../controllers/micrositeController');
const authMiddleware = require('../middleware/authMiddleware');
const { formViewLimiter } = require('../middleware/rateLimiter');

// 1. Endpoint Publik (High-Traffic Ready dengan rate limiter & cache)
router.get('/public/:slug', formViewLimiter, micrositeController.getPublicMicrositeBySlug);

// 2. Endpoint Admin (Protected)
router.get('/', authMiddleware, micrositeController.getAllMicrosites);
router.get('/id/:id', authMiddleware, micrositeController.getMicrositeById);
router.post('/', authMiddleware, micrositeController.createMicrosite);
router.put('/:id', authMiddleware, micrositeController.updateMicrosite);
router.delete('/:id', authMiddleware, micrositeController.deleteMicrosite);

module.exports = router;
