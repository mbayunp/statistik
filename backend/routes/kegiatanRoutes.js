const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', kegiatanController.getAllKegiatan); 
router.post('/', upload.single('gambar'), kegiatanController.create);
router.put('/:id', upload.single('gambar'), kegiatanController.update);
router.delete('/:id', kegiatanController.delete);

module.exports = router;