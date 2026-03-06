const multer = require('multer');
const path = require('path');

// Menentukan lokasi simpan & nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Pastikan folder 'uploads' sudah ada di root backend
    },
    filename: function (req, file, cb) {
        // Format: timestamp-namafileasli.ext
        cb(null, Date.now() + path.extname(file.originalname)); 
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
  
    // 1. BERKAS ARSIP
    if (file.fieldname === 'file_arsip') {
        if (arsipTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Berkas Arsip hanya mendukung Gambar, PDF, Word, dan Excel!'), false);
        }
    } 
    // 2. LAPORAN KEUANGAN
    else if (file.fieldname === 'file_laporan') {
        const allowedLaporanTypes = [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedLaporanTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Laporan Keuangan wajib berformat PDF atau Excel (.xls/.xlsx)!'), false);
        }
    }
    // 3. PENUGASAN (DOKUMENTASI) -> (Blok ini yang tadi posisinya nyasar)
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