const db = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getAllPegawai = async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                nip, 
                nama, 
                jabatan, 
                golongan, 
                jenis_pegawai, 
                foto_referensi, 
                urutan, 
                created_at, 
                (face_descriptor IS NOT NULL AND face_descriptor != '') AS has_face
            FROM pegawai 
            ORDER BY urutan ASC, id DESC
        `;
        const [rows] = await db.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPegawai = async (req, res) => {
    try {
        const { nip, nama, jabatan, golongan, jenis_pegawai } = req.body;
        const tipePegawai = jenis_pegawai === 'tenaga_ahli' ? 'tenaga_ahli' : 'asn';
        const sql = "INSERT INTO pegawai (nip, nama, jabatan, golongan, jenis_pegawai) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [nip || null, nama, jabatan || null, golongan || null, tipePegawai]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'CREATE',
            `Menambahkan pegawai baru "${nama}" (NIP: ${nip || '-'}, Tipe: ${tipePegawai}, Jabatan: ${jabatan || '-'})`
        );

        res.status(201).json({ success: true, message: "Pegawai berhasil ditambahkan", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePegawai = async (req, res) => {
    try {
        const { id } = req.params;
        const { nip, nama, jabatan, golongan, jenis_pegawai } = req.body;
        const tipePegawai = jenis_pegawai === 'tenaga_ahli' ? 'tenaga_ahli' : 'asn';
        const sql = "UPDATE pegawai SET nip=?, nama=?, jabatan=?, golongan=?, jenis_pegawai=? WHERE id=?";
        await db.query(sql, [nip || null, nama, jabatan || null, golongan || null, tipePegawai, id]);

        // Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'PEGAWAI',
            'UPDATE',
            `Memperbarui data pegawai "${nama}" (ID: ${id}, Tipe: ${tipePegawai})`
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