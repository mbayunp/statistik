const db = require('../config/db');

exports.getAllPegawai = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pegawai ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPegawai = async (req, res) => {
    try {
        const { nip, nama, jabatan, golongan } = req.body;
        const sql = "INSERT INTO pegawai (nip, nama, jabatan, golongan) VALUES (?, ?, ?, ?)";
        await db.query(sql, [nip, nama, jabatan, golongan]);
        res.status(201).json({ success: true, message: "Pegawai berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        const { nip, nama, jabatan, golongan } = req.body;
        const sql = "UPDATE pegawai SET nip=?, nama=?, jabatan=?, golongan=? WHERE id=?";
        await db.query(sql, [nip, nama, jabatan, golongan, id]);
        res.json({ success: true, message: "Data pegawai diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM pegawai WHERE id=?", [id]);
        res.json({ success: true, message: "Pegawai berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};