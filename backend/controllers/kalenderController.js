// backend/controllers/kalenderController.js
const db = require('../config/db'); // Sesuaikan koneksi database Anda

// Ambil semua kegiatan (bisa difilter ?tahun=2026&bulan=8)
exports.getKalender = async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    let query = 'SELECT * FROM kalender_kegiatan WHERE 1=1';
    let params = [];

    if (tahun) {
      query += ' AND tahun = ?';
      params.push(tahun);
    }
    if (bulan) {
      query += ' AND bulan = ?';
      params.push(bulan);
    }

    query += ' ORDER BY tahun ASC, bulan ASC, tanggal_mulai ASC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambah kegiatan baru
exports.createKalender = async (req, res) => {
  try {
    const { tahun, bulan, tanggal_mulai, tanggal_selesai, nama_kegiatan, deskripsi, kategori, status } = req.body;
    await db.query(
      'INSERT INTO kalender_kegiatan (tahun, bulan, tanggal_mulai, tanggal_selesai, nama_kegiatan, deskripsi, kategori, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tahun, bulan, tanggal_mulai || null, tanggal_selesai || null, nama_kegiatan, deskripsi, kategori, status]
    );
    res.json({ success: true, message: 'Rencana kegiatan berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus kegiatan
exports.deleteKalender = async (req, res) => {
  try {
    await db.query('DELETE FROM kalender_kegiatan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Rencana kegiatan dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};