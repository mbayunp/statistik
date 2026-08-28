const db = require('../config/db');
const { logActivity } = require('../utils/logger');

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

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'SURAT',
            'CREATE',
            `Mencatat surat ${jenis_surat} baru no "${nomor_surat}" dari/kepada "${instansi || '-'}" (Perihal: ${perihal || '-'})`
        );

        res.status(201).json({ success: true, message: `Surat ${jenis_surat} berhasil dicatat`, id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSurat = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query("SELECT nomor_surat, jenis_surat, instansi FROM surat WHERE id=?", [id]);
        const infoSurat = rows.length > 0 ? `no "${rows[0].nomor_surat}" (${rows[0].jenis_surat})` : `ID ${id}`;

        await db.query("DELETE FROM surat WHERE id=?", [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'SURAT',
            'DELETE',
            `Menghapus arsip surat ${infoSurat} (ID: ${id})`
        );

        res.json({ success: true, message: "Data surat berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};