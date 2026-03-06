const express = require('express');
const router = express.Router();
const penugasanController = require('../controllers/penugasanController');
const upload = require('../middleware/upload');

router.post('/', upload.single('dokumentasi'), penugasanController.createPenugasan);

router.get('/', penugasanController.getPenugasan);
router.delete('/:id', penugasanController.deletePenugasan);

module.exports = router;