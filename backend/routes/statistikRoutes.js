const express = require('express');
const router = express.Router();
const statistikController = require('../controllers/statistikController');

router.get('/', statistikController.getAll);
router.post('/', statistikController.create);
router.put('/:id', statistikController.update);
router.delete('/:id', statistikController.delete);

module.exports = router;