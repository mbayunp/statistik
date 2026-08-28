const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getAset = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM aset_bidang ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAset = async (req, res) => {
    try {
        const { nama_barang, jenis_barang, merk_model, tahun_pembelian, jumlah, penempatan, keadaan } = req.body;
        const sql = "INSERT INTO aset_bidang (nama_barang, jenis_barang, merk_model, tahun_pembelian, jumlah, penempatan, keadaan) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [nama_barang, jenis_barang, merk_model, tahun_pembelian, jumlah, penempatan || '-', keadaan];

        const [result] = await db.query(sql, values);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'ASET',
            'CREATE',
            `Menambahkan data aset "${nama_barang}" (${merk_model || '-'}, ${jumlah} unit, Lokasi: ${penempatan || '-'})`
        );

        res.status(201).json({ success: true, message: "Aset berhasil ditambahkan", id: result.insertId });
    } catch (error) {
        console.error("ERROR ASET:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAset = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query("SELECT nama_barang FROM aset_bidang WHERE id=?", [id]);
        const nama = rows.length > 0 ? rows[0].nama_barang : `ID ${id}`;

        await db.query("DELETE FROM aset_bidang WHERE id=?", [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'ASET',
            'DELETE',
            `Menghapus data aset "${nama}" (ID: ${id})`
        );

        res.json({ success: true, message: "Aset berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAset = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_barang, jenis_barang, merk_model, tahun_pembelian, jumlah, penempatan, keadaan } = req.body;
        
        const sql = `
            UPDATE aset_bidang 
            SET nama_barang=?, jenis_barang=?, merk_model=?, tahun_pembelian=?, jumlah=?, penempatan=?, keadaan=? 
            WHERE id=?
        `;
        
        await db.query(sql, [nama_barang, jenis_barang, merk_model, tahun_pembelian, jumlah, penempatan, keadaan, id]);
        
        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'ASET',
            'UPDATE',
            `Memperbarui data aset "${nama_barang}" (ID: ${id})`
        );

        res.json({ success: true, message: "Data aset berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};