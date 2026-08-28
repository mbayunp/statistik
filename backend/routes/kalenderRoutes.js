// backend/routes/kalenderRoutes.js
const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/kalenderController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint CRUD Kalender
router.get('/', kalenderController.getKalender);
router.post('/', authMiddleware, kalenderController.createKalender);
router.delete('/:id', authMiddleware, kalenderController.deleteKalender);

module.exports = router;