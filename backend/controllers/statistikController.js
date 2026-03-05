const db = require('../config/db'); 

const statistikController = {
    // 1. Ambil semua data
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM daftar_statistik ORDER BY tahun DESC, id DESC');
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. Tambah data baru (Dinamis)
    create: async (req, res) => {
        try {
            const data = req.body;
            delete data.id; // Pastikan ID tidak ikut di-insert karena auto-increment

            const columns = Object.keys(data).join(', '); // nama_kegiatan, tahun, dst...
            const placeholders = Object.keys(data).map(() => '?').join(', '); // ?, ?, dst...
            const values = Object.values(data);

            const sql = `INSERT INTO daftar_statistik (${columns}) VALUES (${placeholders})`;
            
            await db.query(sql, values);
            res.json({ success: true, message: "Data berhasil ditambahkan" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Gagal tambah data: " + error.message });
        }
    },

    // 3. Update data (Dinamis)
    update: async (req, res) => {
        const { id } = req.params;
        try {
            const data = req.body;
            delete data.id; // Jangan update kolom ID

            const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const sql = `UPDATE daftar_statistik SET ${setClause} WHERE id = ?`;
            
            await db.query(sql, values);
            res.json({ success: true, message: "Data berhasil diperbarui" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Gagal update data: " + error.message });
        }
    },

    // 4. Hapus data
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM daftar_statistik WHERE id = ?', [id]);
            res.json({ success: true, message: "Data berhasil dihapus" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = statistikController;