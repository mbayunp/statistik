const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 1. Pengaturan Geofence & Jam Kerja
router.get('/pengaturan', absensiController.getPengaturan);
router.put('/pengaturan', authMiddleware, absensiController.updatePengaturan);

// 2. Daftar Tenaga Ahli (beserta status absen hari ini & face descriptor)
router.get('/tenaga-ahli', absensiController.getDaftarTenagaAhli);

// 3. Perekaman / Enrollment Wajah Tenaga Ahli (Admin)
router.post('/enroll-face', authMiddleware, upload.single('foto_referensi'), absensiController.enrollFace);
router.post('/enroll/:pegawaiId', authMiddleware, upload.single('foto_referensi'), absensiController.enrollFace);

// 4. Submit Presensi Masuk / Pulang (Tenaga Ahli)
router.post('/submit', upload.single('foto'), absensiController.submitAbsensi);
router.post('/clock', upload.single('foto'), absensiController.submitAbsensi);

// 5. Rekap Presensi Harian & Bulanan (Admin)
router.get('/rekap', authMiddleware, absensiController.getRekapAbsensi);

module.exports = router;
