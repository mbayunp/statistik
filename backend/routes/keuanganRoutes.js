const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuanganController');
const upload = require('../middleware/upload'); // Pastikan Anda juga menambah batas file upload seperti di berkas arsip

router.get('/', keuanganController.getLaporan);
router.post('/', upload.single('file_laporan'), keuanganController.createLaporan);
router.delete('/:id', keuanganController.deleteLaporan);

module.exports = router;