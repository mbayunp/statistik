const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', pegawaiController.getAllPegawai);
router.post('/', authMiddleware, pegawaiController.createPegawai);

router.put('/reorder', authMiddleware, pegawaiController.reorderPegawai);

router.put('/:id', authMiddleware, pegawaiController.updatePegawai);
router.delete('/:id', authMiddleware, pegawaiController.deletePegawai);

module.exports = router;