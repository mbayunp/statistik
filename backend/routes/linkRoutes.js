const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.get('/', linkController.getAllLinks);         // Untuk tabel admin
router.post('/', linkController.createLink);         // Simpan link baru
router.get('/redirect/:code', linkController.redirectLink); // Untuk eksekusi pengalihan
router.delete('/:id', linkController.deleteLink);    // Hapus link

module.exports = router;