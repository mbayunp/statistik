const express = require('express');
const router = express.Router();
const rekapanController = require('../controllers/rekapanController');
const upload = require('../middleware/upload'); // Pastikan path ini sesuai dengan middleware upload kamu

router.get('/', rekapanController.getAllRekapan);
router.post('/', upload.single('dokumentasi'), rekapanController.createRekapan);
router.delete('/:id', rekapanController.deleteRekapan);

module.exports = router;