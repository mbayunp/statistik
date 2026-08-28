const express = require('express');
const router = express.Router();
const berkasController = require('../controllers/berkasController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', berkasController.getAllBerkas);
router.post('/', authMiddleware, upload.single('file_arsip'), berkasController.createBerkas);
router.delete('/:id', authMiddleware, berkasController.deleteBerkas);

module.exports = router;