const db = require('../config/db');
const { logActivity } = require('../utils/logger');

const linkController = {
    // 1. Ambil semua link untuk halaman Admin
    getAllLinks: async (req, res) => {
        try {
            const [rows] = await db.execute('SELECT * FROM short_links ORDER BY created_at DESC');
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Gagal mengambil data link' });
        }
    },

    // 2. Buat Short Link Baru
    createLink: async (req, res) => {
        try {
            const { original_url, short_code } = req.body;

            // Validasi: Pastikan original_url diawali http:// atau https://
            let finalUrl = original_url;
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'http://' + finalUrl;
            }

            // Validasi: Cek apakah short_code sudah dipakai
            const [existing] = await db.execute('SELECT id FROM short_links WHERE short_code = ?', [short_code]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Tautan pendek / custom url tersebut sudah digunakan!' });
            }

            const cleanedCode = short_code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            await db.execute(
                'INSERT INTO short_links (original_url, short_code) VALUES (?, ?)',
                [finalUrl, cleanedCode]
            );

            // Log Aktivitas
            const userId = req.user ? req.user.id : null;
            await logActivity(
                userId,
                'SHORTLINK',
                'CREATE',
                `Membuat tautan pendek baru "/s/${cleanedCode}" -> ${finalUrl}`
            );

            res.status(201).json({ success: true, message: 'Short link berhasil dibuat!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // 3. Proses Redirect (Pengalihan) saat link diakses oleh publik
    redirectLink: async (req, res) => {
        try {
            const { code } = req.params;

            const [links] = await db.execute('SELECT original_url FROM short_links WHERE short_code = ?', [code]);
            
            if (links.length === 0) {
                return res.status(404).json({ success: false, message: 'Link tidak ditemukan' });
            }

            // Tambah hitungan klik +1
            await db.execute('UPDATE short_links SET clicks = clicks + 1 WHERE short_code = ?', [code]);

            // Kirim URL asli ke frontend agar bisa di-redirect
            res.status(200).json({ success: true, url: links[0].original_url });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    },

    // 4. Hapus Link
    deleteLink: async (req, res) => {
        try {
            const { id } = req.params;

            const [rows] = await db.execute('SELECT short_code, original_url FROM short_links WHERE id = ?', [id]);
            const codeInfo = rows.length > 0 ? `"/s/${rows[0].short_code}"` : `ID ${id}`;

            await db.execute('DELETE FROM short_links WHERE id = ?', [id]);

            // Log Aktivitas
            const userId = req.user ? req.user.id : null;
            await logActivity(
                userId,
                'SHORTLINK',
                'DELETE',
                `Menghapus tautan pendek ${codeInfo} (ID: ${id})`
            );

            res.status(200).json({ success: true, message: 'Link berhasil dihapus' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Gagal menghapus link' });
        }
    }
};

module.exports = linkController;