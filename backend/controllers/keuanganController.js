const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getLaporan = async (req, res) => {
    try {
        const { jenis, kategori } = req.query; 
        let sql = "SELECT * FROM laporan_keuangan WHERE jenis_laporan = ?";
        let params = [jenis];

        if (kategori) {
            sql += " AND kategori_pengadaan = ?";
            params.push(kategori);
        }
        
        sql += " ORDER BY tahun DESC, id DESC";

        const [rows] = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createLaporan = async (req, res) => {
    try {
        const { jenis_laporan, kategori_pengadaan, judul_laporan, tahun, periode, nilai_anggaran, nilai_realisasi, keterangan } = req.body;
        const file_laporan = req.file ? req.file.filename : null;

        if (!file_laporan) return res.status(400).json({ success: false, message: "File laporan wajib diunggah!" });

        const sql = "INSERT INTO laporan_keuangan (jenis_laporan, kategori_pengadaan, judul_laporan, tahun, periode, nilai_anggaran, nilai_realisasi, file_laporan, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            jenis_laporan, 
            kategori_pengadaan || null, 
            judul_laporan, 
            tahun, 
            periode, 
            nilai_anggaran || 0, 
            nilai_realisasi || 0, 
            file_laporan, 
            keterangan || "-"
        ];

        const [result] = await db.query(sql, values);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'KEUANGAN',
            'CREATE',
            `Menambahkan laporan keuangan ${jenis_laporan} "${judul_laporan}" (Tahun ${tahun} - ${periode})`
        );

        res.status(201).json({ success: true, message: "Laporan berhasil disimpan", id: result.insertId });
    } catch (error) {
        console.error("ERROR KEUANGAN:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLaporan = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query("SELECT judul_laporan, jenis_laporan FROM laporan_keuangan WHERE id=?", [id]);
        const judul = rows.length > 0 ? `"${rows[0].judul_laporan}" (${rows[0].jenis_laporan})` : `ID ${id}`;

        await db.query("DELETE FROM laporan_keuangan WHERE id=?", [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'KEUANGAN',
            'DELETE',
            `Menghapus laporan keuangan ${judul} (ID: ${id})`
        );

        res.json({ success: true, message: "Laporan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};