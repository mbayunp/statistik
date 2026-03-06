const db = require('../config/db');

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
        res.status(201).json({ success: true, message: "Penugasan berhasil dicatat", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePenugasan = async (req, res) => {
    try {
        await db.query("DELETE FROM penugasan WHERE id=?", [req.params.id]);
        res.json({ success: true, message: "Penugasan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};