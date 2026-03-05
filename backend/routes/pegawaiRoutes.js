const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');

router.get('/', pegawaiController.getAllPegawai);
router.post('/', pegawaiController.createPegawai);
router.put('/:id', pegawaiController.updatePegawai);
router.delete('/:id', pegawaiController.deletePegawai);

// WAJIB ADA BARIS INI:
module.exports = router;