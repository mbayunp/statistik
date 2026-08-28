// backend/controllers/kalenderController.js
const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Ambil semua kegiatan (bisa difilter ?tahun=2026&bulan=8)
exports.getKalender = async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    let query = `
      SELECT 
        id, 
        tahun, 
        bulan, 
        DATE_FORMAT(tanggal_mulai, '%Y-%m-%d') AS tanggal_mulai, 
        DATE_FORMAT(tanggal_selesai, '%Y-%m-%d') AS tanggal_selesai, 
        nama_kegiatan, 
        deskripsi, 
        kategori, 
        status 
      FROM kalender_kegiatan 
      WHERE 1=1
    `;
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
    const [result] = await db.query(
      'INSERT INTO kalender_kegiatan (tahun, bulan, tanggal_mulai, tanggal_selesai, nama_kegiatan, deskripsi, kategori, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tahun, bulan, tanggal_mulai || null, tanggal_selesai || null, nama_kegiatan, deskripsi, kategori, status]
    );

    // Log Aktivitas
    const userId = req.user ? req.user.id : null;
    await logActivity(
      userId,
      'KALENDER',
      'CREATE',
      `Menambahkan rencana kegiatan kalender "${nama_kegiatan}" (${bulan} ${tahun})`
    );

    res.json({ success: true, message: 'Rencana kegiatan berhasil ditambahkan', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus kegiatan
exports.deleteKalender = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT nama_kegiatan FROM kalender_kegiatan WHERE id = ?', [id]);
    const nama = rows.length > 0 ? rows[0].nama_kegiatan : `ID ${id}`;

    await db.query('DELETE FROM kalender_kegiatan WHERE id = ?', [id]);

    // Log Aktivitas
    const userId = req.user ? req.user.id : null;
    await logActivity(
      userId,
      'KALENDER',
      'DELETE',
      `Menghapus rencana kegiatan kalender "${nama}" (ID: ${id})`
    );

    res.json({ success: true, message: 'Rencana kegiatan dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};