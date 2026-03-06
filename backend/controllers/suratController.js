const db = require('../config/db');

exports.getSuratByType = async (req, res) => {
    try {
        const { type } = req.params; // 'masuk' atau 'keluar'
        const [rows] = await db.query("SELECT * FROM surat WHERE jenis_surat = ? ORDER BY id DESC", [type]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSurat = async (req, res) => {
    try {
        const { nomor_surat, instansi, tanggal_surat, tanggal_terima, perihal, keterangan, jenis_surat } = req.body;
        const file_surat = req.file ? req.file.filename : null;

        const sql = "INSERT INTO surat (jenis_surat, nomor_surat, instansi, tanggal_surat, tanggal_terima, perihal, keterangan, file_surat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [jenis_surat, nomor_surat, instansi, tanggal_surat, tanggal_terima, perihal, keterangan, file_surat];

        const [result] = await db.query(sql, values);
        res.status(201).json({ success: true, message: `Surat ${jenis_surat} berhasil dicatat`, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSurat = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM surat WHERE id=?", [id]);
        res.json({ success: true, message: "Data surat berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};