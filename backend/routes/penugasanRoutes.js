const express = require('express');
const router = express.Router();
const penugasanController = require('../controllers/penugasanController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', penugasanController.getPenugasan);
router.post('/', authMiddleware, upload.single('dokumentasi'), penugasanController.createPenugasan);
router.delete('/:id', authMiddleware, penugasanController.deletePenugasan);

module.exports = router;