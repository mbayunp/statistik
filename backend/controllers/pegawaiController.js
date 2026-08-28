const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getAllPegawai = async (req, res) => {
    try {
        // PERBAIKAN: Ditambahkan ORDER BY urutan ASC agar data tampil sesuai urutan yang disimpan
        const [rows] = await db.query("SELECT * FROM pegawai ORDER BY urutan ASC, id DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPegawai = async (req, res) => {
    try {
        const { nip, nama, jabatan, golongan } = req.body;
        const sql = "INSERT INTO pegawai (nip, nama, jabatan, golongan) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(sql, [nip, nama, jabatan, golongan]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'CREATE',
            `Menambahkan pegawai baru "${nama}" (NIP: ${nip || '-'}, Jabatan: ${jabatan || '-'})`
        );

        res.status(201).json({ success: true, message: "Pegawai berhasil ditambahkan", id: result.insertId });
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

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'UPDATE',
            `Memperbarui data pegawai "${nama}" (ID: ${id})`
        );

        res.json({ success: true, message: "Data pegawai diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePegawai = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query("SELECT nama FROM pegawai WHERE id=?", [id]);
        const nama = rows.length > 0 ? rows[0].nama : `ID ${id}`;

        await db.query("DELETE FROM pegawai WHERE id=?", [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'DELETE',
            `Menghapus data pegawai "${nama}" (ID: ${id})`
        );

        res.json({ success: true, message: "Pegawai berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reorderPegawai = async (req, res) => {
    try {
        const { data } = req.body;
        for (let item of data) {
            await db.query("UPDATE pegawai SET urutan = ? WHERE id = ?", [item.urutan, item.id]);
        }
        
        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'UPDATE',
            `Memperbarui susunan urutan hierarki data pegawai`
        );

        res.json({ success: true, message: "Urutan berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};