const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Daftar formulir & Pembuatan
router.get('/', authMiddleware, formController.getAllForms);
router.post('/', authMiddleware, formController.createForm);

// 2. Upload media khusus formulir (Banner, Lampiran, Signature, Webcam)
router.post('/upload', upload.single('file_attachment'), formController.uploadMedia);

// 3. Submit respon publik (Tetap publik untuk responden umum)
router.post('/submit', formController.submitResponse);

// 4. Rekap respon & Manajemen respon (Khusus Admin)
router.get('/responses/:formId', authMiddleware, formController.getFormResponses);
router.delete('/responses/:responseId', authMiddleware, formController.deleteFormResponse);
router.post('/responses/bulk-delete', authMiddleware, formController.bulkDeleteResponses);
router.delete('/responses/form/:formId/all', authMiddleware, formController.deleteAllResponsesByForm);
router.get('/admin/:id', authMiddleware, formController.getFormByIdAdmin);

// 5. Update & Delete formulir (Khusus Admin)
router.put('/:id', authMiddleware, formController.updateForm);
router.delete('/:id', authMiddleware, formController.deleteForm);

// 6. Ambil formulir publik berdasarkan slug (diletakkan di akhir untuk akses umum)
router.get('/:slug', formController.getFormBySlug);

module.exports = router;