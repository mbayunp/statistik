const express = require('express');
const router = express.Router();
const statistikController = require('../controllers/statistikController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', statistikController.getAll);
router.post('/', authMiddleware, statistikController.create);
router.put('/:id', authMiddleware, statistikController.update);
router.delete('/:id', authMiddleware, statistikController.delete);

module.exports = router;