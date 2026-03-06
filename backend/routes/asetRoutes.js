const express = require('express');
const router = express.Router();
const asetController = require('../controllers/asetController');

router.post('/', asetController.createAset); 

router.get('/', asetController.getAset);
router.delete('/:id', asetController.deleteAset);
router.put('/:id', asetController.updateAset);

module.exports = router;