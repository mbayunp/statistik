const multer = require('multer');
const path = require('path');

// Menentukan lokasi simpan & nama file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Pastikan folder 'uploads' sudah ada di root backend
    },
    filename: function (req, file, cb) {
        // Format: timestamp-namafileasli.png (mencegah nama file duplikat)
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
  // Daftar tipe gambar yang diizinkan untuk SEMUA fitur
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (file.fieldname === 'file_surat') {
    const docTypes = [...imageTypes, 'application/pdf'];
    
    if (docTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Surat Masuk hanya mendukung format Gambar atau PDF!'), false);
    }
  } 
  else {
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Fitur ini hanya mendukung format Gambar (.jpg, .png)!'), false);
    }
  }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit maksimal 2MB
    fileFilter: fileFilter
});

module.exports = upload;