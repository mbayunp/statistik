const express = require('express');
const router = express.Router();
const asetController = require('../controllers/asetController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', asetController.getAset);
router.post('/', authMiddleware, asetController.createAset); 
router.put('/:id', authMiddleware, asetController.updateAset);
router.delete('/:id', authMiddleware, asetController.deleteAset);

module.exports = router;