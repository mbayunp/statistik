// backend/routes/kalenderRoutes.js
const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/kalenderController');
// const { verifyToken } = require('../middleware/authMiddleware'); // Jika memakai auth guard

// Endpoint CRUD Kalender
router.get('/', kalenderController.getKalender);
router.post('/', kalenderController.createKalender);
router.delete('/:id', kalenderController.deleteKalender);

module.exports = router;