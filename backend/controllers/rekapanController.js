const db = require('../config/db');

const rekapanController = {
  getAllRekapan: async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM rekapan_kegiatan ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data rekapan' });
    }
  },

  createRekapan: async (req, res) => {
    try {
      const { tanggal, nama_kegiatan, kategori, keterangan } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Minimal 1 dokumentasi wajib diupload!' });
      }

      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
      const dokumentasiString = JSON.stringify(filePaths);

      const query = `INSERT INTO rekapan_kegiatan (tanggal, nama_kegiatan, kategori, keterangan, dokumentasi) VALUES (?, ?, ?, ?, ?)`;
      
      const values = [
        tanggal, 
        nama_kegiatan, 
        kategori, 
        keterangan || null, 
        dokumentasiString 
      ];

      const [result] = await db.execute(query, values);

      res.status(201).json({ success: true, message: 'Rekapan berhasil disimpan' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  updateRekapan: async (req, res) => {
    try {
      const { id } = req.params;
      const { tanggal, nama_kegiatan, kategori, keterangan } = req.body;
      
      let query;
      let values;

      if (req.files && req.files.length > 0) {
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        const dokumentasiString = JSON.stringify(filePaths);

        query = `UPDATE rekapan_kegiatan SET tanggal=?, nama_kegiatan=?, kategori=?, keterangan=?, dokumentasi=? WHERE id=?`;
        values = [tanggal, nama_kegiatan, kategori, keterangan || null, dokumentasiString, id];
      } else {
        query = `UPDATE rekapan_kegiatan SET tanggal=?, nama_kegiatan=?, kategori=?, keterangan=? WHERE id=?`;
        values = [tanggal, nama_kegiatan, kategori, keterangan || null, id];
      }

      const [result] = await db.execute(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Data rekapan tidak ditemukan' });
      }

      res.status(200).json({ success: true, message: 'Rekapan berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui data' });
    }
  },

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