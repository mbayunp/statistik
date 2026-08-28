const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', linkController.getAllLinks);                      // Untuk tabel admin
router.post('/', authMiddleware, linkController.createLink);     // Simpan link baru (Protected)
router.get('/redirect/:code', linkController.redirectLink);      // Untuk eksekusi pengalihan publik
router.delete('/:id', authMiddleware, linkController.deleteLink); // Hapus link (Protected)

module.exports = router;