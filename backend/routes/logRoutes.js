const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/logs - Protected endpoint to get activity logs
router.get('/', authMiddleware, logController.getActivityLogs);

module.exports = router;
