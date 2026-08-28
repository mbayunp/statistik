const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const upload = require('../middleware/upload'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:type', suratController.getSuratByType);
router.post('/', authMiddleware, upload.single('file_surat'), suratController.createSurat);
router.delete('/:id', authMiddleware, suratController.deleteSurat);

module.exports = router;