const db = require('../config/db');

const Kegiatan = {
    // Mengambil semua data kegiatan (bisa difilter per tipe)
    getAll: async (tipe) => {
        let query = 'SELECT * FROM kegiatan';
        const params = [];

        if (tipe) {
            query += ' WHERE tipe = ?';
            params.push(tipe);
        }
        query += ' ORDER BY tanggal DESC'; // Urutkan dari yang terbaru
        
        const [rows] = await db.execute(query, params);
        return rows;
    },

    // Menyimpan kegiatan baru
    create: async (data) => {
        const query = 'INSERT INTO kegiatan (tanggal, nama_kegiatan, dokumentasi, tipe) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [data.tanggal, data.nama_kegiatan, data.dokumentasi, data.tipe]);
        return result;
    }
};

module.exports = Kegiatan;