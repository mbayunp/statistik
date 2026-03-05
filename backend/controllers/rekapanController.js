const db = require('../config/db');

const rekapanController = {
  // 1. TAMPILKAN SEMUA REKAPAN INTERNAL
  getAllRekapan: async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM rekapan_kegiatan ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data rekapan' });
    }
  },

  // 2. TAMBAH REKAPAN BARU
  createRekapan: async (req, res) => {
    try {
      const { tanggal, nama_kegiatan, kategori } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Dokumentasi wajib diupload!' });
      }

      const dokumentasiPath = `/uploads/${req.file.filename}`;

      const query = `INSERT INTO rekapan_kegiatan (tanggal, nama_kegiatan, kategori, dokumentasi) VALUES (?, ?, ?, ?)`;
      const values = [tanggal, nama_kegiatan, kategori, dokumentasiPath];

      const [result] = await db.execute(query, values);

      res.status(201).json({ success: true, message: 'Rekapan berhasil disimpan' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  // 3. HAPUS REKAPAN
  deleteRekapan: async (req, res) => {
    try {
      const { id } = req.params;
      await db.execute('DELETE FROM rekapan_kegiatan WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: 'Rekapan berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Gagal menghapus rekapan' });
    }
  }
};

module.exports = rekapanController;