const express = require('express');
const router = express.Router();
const berkasController = require('../controllers/berkasController');
const upload = require('../middleware/upload');

router.get('/', berkasController.getAllBerkas);
router.post('/', upload.single('file_arsip'), berkasController.createBerkas);
router.delete('/:id', berkasController.deleteBerkas);

module.exports = router;