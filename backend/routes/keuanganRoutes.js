const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuanganController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', keuanganController.getLaporan);
router.post('/', authMiddleware, upload.single('file_laporan'), keuanganController.createLaporan);
router.delete('/:id', authMiddleware, keuanganController.deleteLaporan);

module.exports = router;