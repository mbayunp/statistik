const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Sesuaikan path dengan lokasi upload.js Anda
const laporanController = require('../controllers/laporanController');

// Route menggunakan upload global
router.post('/upload', upload.single('file_laporan'), laporanController.uploadLaporan);
router.get('/', laporanController.getLaporan);
router.delete('/:id', laporanController.deleteLaporan);

module.exports = router;