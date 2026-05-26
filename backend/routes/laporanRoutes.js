const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const laporanController = require('../controllers/laporanController');

// Route menggunakan upload global
router.post('/upload', upload.single('file_laporan'), laporanController.uploadLaporan);
router.get('/', laporanController.getLaporan);
router.delete('/:id', laporanController.deleteLaporan);

module.exports = router;