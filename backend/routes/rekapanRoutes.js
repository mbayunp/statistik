const express = require('express');
const router = express.Router();
const rekapanController = require('../controllers/rekapanController');
const upload = require('../middleware/upload'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', rekapanController.getAllRekapan);
router.get('/laporan', authMiddleware, rekapanController.getRekapanLaporan);
router.post('/', authMiddleware, upload.array('dokumentasi', 10), rekapanController.createRekapan);
router.delete('/:id', authMiddleware, rekapanController.deleteRekapan);
router.put('/:id', authMiddleware, upload.array('dokumentasi', 10), rekapanController.updateRekapan);

module.exports = router;