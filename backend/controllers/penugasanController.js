const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getPenugasan = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM penugasan ORDER BY tanggal_waktu DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPenugasan = async (req, res) => {
    try {
        const { tanggal_waktu, tempat, peserta, pelaksanaan } = req.body;
        const dokumentasi = req.file ? req.file.filename : null;

        if (!dokumentasi) {
            return res.status(400).json({ success: false, message: "Foto dokumentasi wajib diunggah!" });
        }

        const sql = "INSERT INTO penugasan (tanggal_waktu, tempat, peserta, pelaksanaan, dokumentasi) VALUES (?, ?, ?, ?, ?)";
        const values = [tanggal_waktu, tempat, peserta, pelaksanaan, dokumentasi];

        const [result] = await db.query(sql, values);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PENUGASAN',
            'CREATE',
            `Mencatat penugasan Kepala Bidang di "${tempat}" (Peserta: ${peserta || '-'})`
        );

        res.status(201).json({ success: true, message: "Penugasan berhasil dicatat", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePenugasan = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query("SELECT tempat, tanggal_waktu FROM penugasan WHERE id=?", [id]);
        const info = rows.length > 0 ? `di "${rows[0].tempat}"` : `ID ${id}`;

        await db.query("DELETE FROM penugasan WHERE id=?", [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PENUGASAN',
            'DELETE',
            `Menghapus catatan penugasan ${info} (ID: ${id})`
        );

        res.json({ success: true, message: "Penugasan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};