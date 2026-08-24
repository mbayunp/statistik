const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const upload = require('../middleware/upload');

// 1. Daftar formulir & Pembuatan
router.get('/', formController.getAllForms);
router.post('/', formController.createForm);

// 2. Upload media khusus formulir (Banner, Lampiran, Signature, Webcam)
router.post('/upload', upload.single('file_attachment'), formController.uploadMedia);

// 3. Submit respon publik
router.post('/submit', formController.submitResponse);

// 4. Rekap respon & Detail admin
router.get('/responses/:formId', formController.getFormResponses);
router.get('/admin/:id', formController.getFormByIdAdmin);

// 5. Update & Delete formulir
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

// 6. Ambil formulir publik berdasarkan slug (diletakkan di akhir)
router.get('/:slug', formController.getFormBySlug);

module.exports = router;