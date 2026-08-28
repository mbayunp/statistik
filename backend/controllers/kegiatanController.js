const Kegiatan = require('../models/kegiatanModel');
const db = require('../config/db'); // Database dengan promise pool
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../utils/logger');

// 1. Ambil Semua Data
exports.getAllKegiatan = async (req, res) => {
    try {
        const { tipe } = req.query; 
        const data = await Kegiatan.getAll(tipe);
        
        res.status(200).json({
            success: true,
            message: 'Data kegiatan berhasil diambil',
            data: data
        });
    } catch (error) {
        console.error('Error get kegiatan:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

// 2. Tambah Data (Create) - DIPERBAIKI MENGGUNAKAN ASYNC/AWAIT
exports.create = async (req, res) => {
    try {
        const { tanggal, keterangan } = req.body;
        const gambarPath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!gambarPath) {
            return res.status(400).json({ success: false, message: "Gambar wajib diunggah" });
        }

        const sql = "INSERT INTO kegiatan (tanggal, keterangan, gambar) VALUES (?, ?, ?)";
        
        // Perbaikan: Menggunakan 'await' karena db.query me-return Promise
        const [result] = await db.query(sql, [tanggal, keterangan, gambarPath]);
        
        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PUBLIKASI',
            'CREATE',
            `Menambahkan publikasi kegiatan baru "${keterangan || 'Tanpa Keterangan'}" (ID: ${result.insertId})`
        );

        // Respon ini sekarang pasti akan terkirim ke frontend
        return res.status(201).json({ 
            success: true, 
            message: "Data berhasil ditambahkan", 
            id: result.insertId 
        });

    } catch (error) {
        console.error("Database/System Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Terjadi kesalahan sistem" 
        });
    }
};

// 3. Edit Data (Update) - DIPERBAIKI MENGGUNAKAN ASYNC/AWAIT
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { tanggal, keterangan } = req.body;
        
        let sql = "";
        let params = [];

        if (req.file) {
            const gambarPath = `/uploads/${req.file.filename}`;
            sql = "UPDATE kegiatan SET tanggal = ?, keterangan = ?, gambar = ? WHERE id = ?";
            params = [tanggal, keterangan, gambarPath, id];
        } else {
            sql = "UPDATE kegiatan SET tanggal = ?, keterangan = ? WHERE id = ?";
            params = [tanggal, keterangan, id];
        }

        await db.query(sql, params);
        
        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PUBLIKASI',
            'UPDATE',
            `Memperbarui data publikasi kegiatan "${keterangan || 'ID ' + id}" (ID: ${id})`
        );

        return res.status(200).json({ success: true, message: "Data berhasil diperbarui" });
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Gagal update database" });
    }
};

// 4. Hapus Data (Delete) - DIPERBAIKI MENGGUNAKAN ASYNC/AWAIT
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const selectSql = "SELECT keterangan, gambar FROM kegiatan WHERE id = ?";
        const [results] = await db.query(selectSql, [id]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        const ket = results[0].keterangan || `ID ${id}`;
        const filename = results[0].gambar;

        const deleteSql = "DELETE FROM kegiatan WHERE id = ?";
        await db.query(deleteSql, [id]);

        // Hapus file fisik (jika ada)
        if (filename) {
            const fullPath = path.join(__dirname, '..', filename);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PUBLIKASI',
            'DELETE',
            `Menghapus data publikasi kegiatan "${ket}" (ID: ${id})`
        );

        return res.json({ success: true, message: "Kegiatan berhasil dihapus" });
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};