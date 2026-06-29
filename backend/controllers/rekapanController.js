const db = require('../config/db');
const { logActivity } = require('../utils/logger');

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
      // 1. Tambahkan link_materi di sini
      const { tanggal, nama_kegiatan, kategori, keterangan, link_materi } = req.body;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Minimal 1 dokumentasi wajib diupload!' });
      }

      const filePaths = req.files.map(file => `/uploads/${file.filename}`);
      const dokumentasiString = JSON.stringify(filePaths);

      // 2. Tambahkan kolom link_materi dan user_id ke query INSERT
      const query = `INSERT INTO rekapan_kegiatan (tanggal, nama_kegiatan, kategori, keterangan, link_materi, dokumentasi, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const userId = req.user ? req.user.id : null;
      const values = [
        tanggal, 
        nama_kegiatan, 
        kategori, 
        keterangan || null, 
        link_materi || null, // Masukkan value-nya (bisa null jika kosong)
        dokumentasiString,
        userId
      ];

      const [result] = await db.execute(query, values);

      // Log aktivitas audit trail
      await logActivity(
        userId, 
        'REKAPAN_INTERNAL', 
        'CREATE', 
        `Membuat rekapan kegiatan baru "${nama_kegiatan}" (ID: ${result.insertId})`
      );

      res.status(201).json({ success: true, message: 'Rekapan berhasil disimpan' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
  },

  updateRekapan: async (req, res) => {
    try {
      const { id } = req.params;
      // 3. Tambahkan link_materi di sini
      const { tanggal, nama_kegiatan, kategori, keterangan, link_materi } = req.body;
      
      let query;
      let values;

      if (req.files && req.files.length > 0) {
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        const dokumentasiString = JSON.stringify(filePaths);

        // 4. Update query jika ada file baru
        query = `UPDATE rekapan_kegiatan SET tanggal=?, nama_kegiatan=?, kategori=?, keterangan=?, link_materi=?, dokumentasi=? WHERE id=?`;
        values = [tanggal, nama_kegiatan, kategori, keterangan || null, link_materi || null, dokumentasiString, id];
      } else {
        // 5. Update query jika tidak ada file baru
        query = `UPDATE rekapan_kegiatan SET tanggal=?, nama_kegiatan=?, kategori=?, keterangan=?, link_materi=? WHERE id=?`;
        values = [tanggal, nama_kegiatan, kategori, keterangan || null, link_materi || null, id];
      }

      const [result] = await db.execute(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Data rekapan tidak ditemukan' });
      }

      // Log aktivitas audit trail
      const userId = req.user ? req.user.id : null;
      await logActivity(
        userId, 
        'REKAPAN_INTERNAL', 
        'UPDATE', 
        `Mengupdate rekapan kegiatan "${nama_kegiatan}" (ID: ${id})`
      );

      res.status(200).json({ success: true, message: 'Rekapan berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui data' });
    }
  },

  deleteRekapan: async (req, res) => {
    try {
      const { id } = req.params;

      // Ambil nama kegiatan terlebih dahulu sebelum menghapus untuk detail log aktivitas
      const [rows] = await db.execute('SELECT nama_kegiatan FROM rekapan_kegiatan WHERE id = ?', [id]);
      const namaKegiatan = rows.length > 0 ? rows[0].nama_kegiatan : 'Tidak Diketahui';

      const [result] = await db.execute('DELETE FROM rekapan_kegiatan WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Data rekapan tidak ditemukan' });
      }

      // Log aktivitas audit trail
      const userId = req.user ? req.user.id : null;
      await logActivity(
        userId, 
        'REKAPAN_INTERNAL', 
        'DELETE', 
        `Menghapus rekapan kegiatan "${namaKegiatan}" (ID: ${id})`
      );

      res.status(200).json({ success: true, message: 'Rekapan berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Gagal menghapus rekapan' });
    }
  },

  getRekapanLaporan: async (req, res) => {
    try {
      const { month, year } = req.query;
      let { user_id } = req.query;

      // Fallback ke req.user.id dari middleware auth jika user_id tidak dikirim
      if (!user_id && req.user) {
        user_id = req.user.id;
      }

      if (!user_id || !month || !year) {
        return res.status(400).json({ success: false, message: 'Parameter user_id (atau token), month, dan year wajib diisi!' });
      }

      const months = {
        'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
        'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
      };
      
      const monthLower = String(month).toLowerCase().trim();
      const monthNumber = months[monthLower] || parseInt(monthLower) || null;

      if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({ success: false, message: 'Format bulan tidak valid!' });
      }

      const query = `
        SELECT rk.*, u.username, u.role
        FROM rekapan_kegiatan rk
        INNER JOIN users u ON rk.user_id = u.id
        WHERE rk.user_id = ? 
          AND MONTH(rk.tanggal) = ? 
          AND YEAR(rk.tanggal) = ?
        ORDER BY rk.tanggal ASC, rk.id ASC
      `;
      
      const [rows] = await db.execute(query, [user_id, monthNumber, year]);

      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data laporan kinerja.' });
    }
  }
};

module.exports = rekapanController;