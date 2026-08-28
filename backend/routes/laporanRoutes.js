const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const laporanController = require('../controllers/laporanController');

// Route menggunakan upload global
router.post('/upload', authMiddleware, upload.single('file_laporan'), laporanController.uploadLaporan);
router.get('/', laporanController.getLaporan);
router.delete('/:id', authMiddleware, laporanController.deleteLaporan);

module.exports = router;