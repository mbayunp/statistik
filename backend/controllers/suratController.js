const db = require('../config/db');

exports.getAllSurat = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM surat_masuk ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSurat = async (req, res) => {
    try {
        const { nomor_surat, asal_surat, tanggal_surat, tanggal_terima, perihal, keterangan } = req.body;
        const file_surat = req.file ? req.file.filename : null;

        // Pastikan nama kolom di bawah ini SAMA PERSIS dengan di database
        const sql = "INSERT INTO surat_masuk (nomor_surat, asal_surat, tanggal_surat, tanggal_terima, perihal, keterangan, file_surat) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        const values = [
            nomor_surat || "-", 
            asal_surat || "-", 
            tanggal_surat || null, 
            tanggal_terima || null, 
            perihal || "-", 
            keterangan || "-", 
            file_surat
        ];

        const [result] = await db.query(sql, values);
        
        res.status(201).json({ success: true, message: "Surat masuk berhasil dicatat", id: result.insertId });
    } catch (error) {
        console.error("ERROR DETAIL:", error); // Lihat ini di terminal backend!
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSurat = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM surat_masuk WHERE id=?", [id]);
        res.json({ success: true, message: "Data surat berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};