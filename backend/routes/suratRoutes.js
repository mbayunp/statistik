const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const upload = require('../middleware/upload'); 

router.get('/:type', suratController.getSuratByType);
router.post('/', upload.single('file_surat'), suratController.createSurat);
router.delete('/:id', suratController.deleteSurat);

module.exports = router;