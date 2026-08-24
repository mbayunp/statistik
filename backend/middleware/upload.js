const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Wajib ditambahkan untuk fungsi auto-create folder

// Menentukan lokasi simpan & nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destFolder = './uploads/';

        // Dinamis: Arahkan file laporan ke subfolder /laporan/
        if (file.fieldname === 'file_laporan') {
            destFolder = './uploads/laporan/';
        }

        // Auto-create folder jika belum ada agar tidak error saat deploy
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        cb(null, destFolder);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = 'file-';
        if (file.fieldname === 'file_laporan') {
            prefix = 'laporan-';
        } else if (file.fieldname === 'file_attachment' || file.fieldname === 'file_form') {
            prefix = 'form-';
        }
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    const requestSize = parseInt(req.headers['content-length']);

    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const docTypes = [...imageTypes, 'application/pdf'];
    const arsipTypes = [
        ...docTypes, 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  
    // 0. FORMULIR ATTACHMENT / MEDIA (File Upload, Webcam photo, Signature, Banner)
    if (file.fieldname === 'file_attachment' || file.fieldname === 'file_form') {
        const allowedFormTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/zip',
            'application/x-zip-compressed'
        ];
        if (allowedFormTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung untuk lampiran formulir!'), false);
        }
    }
    // 1. BERKAS ARSIP
    else if (file.fieldname === 'file_arsip') {
        if (arsipTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Berkas Arsip hanya mendukung Gambar, PDF, Word, dan Excel!'), false);
        }
    } 
    // 2. LAPORAN (Keuangan & Tenaga Ahli)
    else if (file.fieldname === 'file_laporan') {
        const allowedLaporanTypes = [
            'application/pdf',
            'application/msword', // Tambahan izin untuk .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Tambahan izin untuk .docx
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedLaporanTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Laporan wajib berformat PDF, Word (.doc/.docx), atau Excel (.xls/.xlsx)!'), false);
        }
    }
    // 3. PENUGASAN (DOKUMENTASI)
    else if (file.fieldname === 'dokumentasi') {
        if (imageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Dokumentasi wajib berformat Gambar (JPG/PNG)!'), false);
        }
    }
    // 4. SURAT MASUK / KELUAR
    else if (file.fieldname === 'file_surat') {
        if (requestSize > 2.5 * 1024 * 1024) { 
            return cb(new Error('Ukuran file Surat maksimal 2MB!'), false);
        }
        if (docTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Surat Masuk/Keluar hanya mendukung format Gambar atau PDF!'), false);
        }
    } 
    // 5. FITUR LAINNYA (Default)
    else {
        if (requestSize > 2.5 * 1024 * 1024) {
            return cb(new Error('Ukuran file fitur ini maksimal 2MB!'), false);
        }
        if (imageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Fitur ini hanya mendukung format Gambar (.jpg, .png)!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
    fileFilter: fileFilter
});

module.exports = upload;