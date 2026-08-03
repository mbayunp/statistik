const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://10.50.14.217:5173')
  .split(',')
  .map(origin => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Permintaan tanpa origin (misal: curl, mobile apps, atau same-origin) atau origin yang diizinkan
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Akses ditolak oleh kebijakan CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

const kegiatanRoutes = require('./routes/kegiatanRoutes');
const authRoutes = require('./routes/authRoutes');
const rekapanRoutes = require('./routes/rekapanRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const suratRoutes = require('./routes/suratRoutes');
const statistikRoutes = require('./routes/statistikRoutes');
const BerkasRoutes = require('./routes/berkasRoutes');
const KeuanganRoutes = require('./routes/keuanganRoutes');
const penugasanRoutes = require('./routes/penugasanRoutes');
const asetRoutes = require('./routes/asetRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const formRoutes = require('./routes/formRoutes');
const linkRoutes = require('./routes/linkRoutes');
const logRoutes = require('./routes/logRoutes');

app.use('/api/berkas', BerkasRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rekapan', rekapanRoutes);
app.use('/api/aset', asetRoutes);
app.use('/api/penugasan', penugasanRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/surat', suratRoutes);
app.use('/api/statistik-sektoral', statistikRoutes);
app.use('/api/keuangan', KeuanganRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/formulir', formRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: "API Backend Berjalan Lancar 🚀",
        upload_status: "Folder static /uploads aktif"
    });
});

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
    console.log(`🌐 Akses jaringan: http://10.50.14.217:${PORT}`); 
});