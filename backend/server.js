const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: '*',
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