const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. Inisialisasi Express
const app = express();

// 2. Konfigurasi CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// 3. Middleware Dasar
app.use(cors(corsOptions)); // Gunakan corsOptions yang sudah didefinisikan (Hapus app.use(cors()) satunya)

// Menambah limit ukuran payload (Mencegah ERR_CONNECTION_RESET saat upload gambar besar)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

// 4. Static Folder
// Membuat folder uploads dapat diakses secara publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 5. Routes
const kegiatanRoutes = require('./routes/kegiatanRoutes');
const authRoutes = require('./routes/authRoutes');
const rekapanRoutes = require('./routes/rekapanRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const suratRoutes = require('./routes/suratRoutes');
const statistikRoutes = require('./routes/statistikRoutes');

app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rekapan', rekapanRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/surat-masuk', suratRoutes);
app.use('/api/statistik-sektoral', statistikRoutes);

// 6. Test Route & Error Handling
app.get('/', (req, res) => {
    res.json({ 
        message: "API Backend Berjalan Lancar 🚀",
        upload_status: "Folder static /uploads aktif"
    });
});

// Middleware Global Error Handler (Opsional tapi sangat membantu debug)
app.use((err, req, res, next) => {
    console.error("Global Error Log:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan internal pada server",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server berjalan di semua interface (0.0.0.0:${PORT})`);
    console.log(`🏠 Akses lokal: http://localhost:${PORT}`);
    // Ganti 10.50.14.217 dengan IP laptopmu yang muncul di ipconfig
    console.log(`🌐 Akses jaringan: http://10.50.14.217:${PORT}`); 
});