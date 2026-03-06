const db = require('../config/db');

// Ambil semua data berkas
exports.getAllBerkas = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM berkas_arsip ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tambah berkas baru
exports.createBerkas = async (req, res) => {
    try {
        const { nama_berkas, kategori, tahun, keterangan } = req.body;
        // Tangkap nama file dari middleware upload
        const file_arsip = req.file ? req.file.filename : null;

        if (!file_arsip) {
            return res.status(400).json({ success: false, message: "File dokumen wajib diunggah!" });
        }

        const sql = "INSERT INTO berkas_arsip (nama_berkas, kategori, tahun, keterangan, file_arsip) VALUES (?, ?, ?, ?, ?)";
        const values = [
            nama_berkas, 
            kategori, 
            tahun, 
            keterangan || "-", // Jika kosong, isi dengan strip (-)
            file_arsip
        ];

        const [result] = await db.query(sql, values);
        
        res.status(201).json({ success: true, message: "Berkas arsip berhasil disimpan", id: result.insertId });
    } catch (error) {
        console.error("ERROR UPLOAD BERKAS:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hapus berkas
exports.deleteBerkas = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM berkas_arsip WHERE id=?", [id]);
        res.json({ success: true, message: "Berkas arsip berhasil dihapus permanen" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};