const express = require('express');
const router = express.Router();
const rekapanController = require('../controllers/rekapanController');
const upload = require('../middleware/upload'); 

router.get('/', rekapanController.getAllRekapan);
router.post('/', upload.array('dokumentasi', 10), rekapanController.createRekapan);
router.delete('/:id', rekapanController.deleteRekapan);
router.put('/:id', upload.array('dokumentasi', 10), rekapanController.updateRekapan);

module.exports = router;