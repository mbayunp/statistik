const db = require('../config/db');

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
        res.status(201).json({ success: true, message: "Aset berhasil ditambahkan", id: result.insertId });
    } catch (error) {
        console.error("ERROR ASET:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAset = async (req, res) => {
    try {
        await db.query("DELETE FROM aset_bidang WHERE id=?", [req.params.id]);
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
        
        res.json({ success: true, message: "Data aset berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};