const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.uploadLaporan = async (req, res) => {
    try {
        // Tangkap variabel kategori dari form
        const { bulan, tahun, kategori } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Harap unggah file laporan!' });
        }

        if (!bulan || !tahun || !kategori) {
            return res.status(400).json({ success: false, message: 'Bulan, tahun, dan kategori harus diisi!' });
        }

        // Path file yang akan disimpan di database
        const filePath = `/uploads/laporan/${file.filename}`;
        const namaFile = file.originalname;

        // Tambahkan kategori ke query INSERT
        const query = 'INSERT INTO laporan_bulanan (bulan, tahun, kategori, nama_file, file_path) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [bulan, tahun, kategori, namaFile, filePath]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'LAPORAN_BULANAN',
            'CREATE',
            `Mengunggah file laporan bulanan tenaga ahli "${namaFile}" (${kategori} - ${bulan} ${tahun})`
        );

        res.status(201).json({ success: true, message: 'Laporan berhasil diunggah!', id: result.insertId });
    } catch (error) {
        console.error('Error upload laporan:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

exports.getLaporan = async (req, res) => {
    try {
        // Ambil semua data, pengelompokan akan di-handle secara instan oleh Frontend
        const query = 'SELECT * FROM laporan_bulanan ORDER BY tahun DESC, FIELD(bulan, "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember") DESC';
        const [rows] = await db.execute(query);
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error get laporan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data laporan' });
    }
};

exports.deleteLaporan = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute('SELECT nama_file, bulan, tahun, kategori FROM laporan_bulanan WHERE id = ?', [id]);
        const info = rows.length > 0 ? `"${rows[0].nama_file}" (${rows[0].kategori} - ${rows[0].bulan} ${rows[0].tahun})` : `ID ${id}`;

        const query = 'DELETE FROM laporan_bulanan WHERE id = ?';
        await db.execute(query, [id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'LAPORAN_BULANAN',
            'DELETE',
            `Menghapus file laporan bulanan tenaga ahli ${info} (ID: ${id})`
        );
        
        res.status(200).json({ success: true, message: 'Laporan berhasil dihapus!' });
    } catch (error) {
        console.error('Error delete laporan:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus laporan' });
    }
};