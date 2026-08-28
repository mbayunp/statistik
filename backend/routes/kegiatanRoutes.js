const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', kegiatanController.getAllKegiatan); 
router.post('/', authMiddleware, upload.single('gambar'), kegiatanController.create);
router.put('/:id', authMiddleware, upload.single('gambar'), kegiatanController.update);
router.delete('/:id', authMiddleware, kegiatanController.delete);

module.exports = router;