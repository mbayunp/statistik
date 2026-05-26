const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const laporanController = require('../controllers/laporanController');

// Buat folder otomatis jika belum ada
const uploadDir = path.join(__dirname, '../public/uploads/laporan');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'laporan-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit 10MB
});

// Routes
router.post('/upload', upload.single('file_laporan'), laporanController.uploadLaporan);
router.get('/', laporanController.getLaporan);
router.delete('/:id', laporanController.deleteLaporan);

module.exports = router;