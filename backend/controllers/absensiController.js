const db = require('../config/db');
const { logActivity } = require('../utils/logger');

/**
 * Helper: Menghitung jarak antara 2 koordinat bumi dalam satuan meter (Formula Haversine)
 */
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * 1. GET /api/absensi/pengaturan
 * Mengambil 1 baris pengaturan absensi aktif (koordinat kantor, radius, jam kerja)
 */
exports.getPengaturan = async (req, res) => {
    try {
        let [rows] = await db.query("SELECT * FROM absensi_pengaturan LIMIT 1");
        
        // Buat default pengaturan jika tabel masih kosong
        if (rows.length === 0) {
            await db.query(`
                INSERT INTO absensi_pengaturan (nama_lokasi, latitude, longitude, radius_meter, jam_masuk, jam_pulang)
                VALUES ('Kantor Diskominfo Kab. Garut', -7.20378529, 107.88695705, 100, '08:00:00', '16:00:00')
            `);
            [rows] = await db.query("SELECT * FROM absensi_pengaturan LIMIT 1");
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error getPengaturan:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. PUT /api/absensi/pengaturan (Protected)
 * Memperbarui titik koordinat kantor, radius geofence, dan jam kerja masuk/pulang
 */
exports.updatePengaturan = async (req, res) => {
    try {
        const { nama_lokasi, latitude, longitude, radius_meter, jam_masuk, jam_pulang } = req.body;

        if (!nama_lokasi || latitude == null || longitude == null || !radius_meter || !jam_masuk || !jam_pulang) {
            return res.status(400).json({ 
                success: false, 
                message: "Semua kolom pengaturan (nama lokasi, latitude, longitude, radius, jam masuk, jam pulang) wajib diisi!" 
            });
        }

        const [existing] = await db.query("SELECT id FROM absensi_pengaturan LIMIT 1");

        if (existing.length > 0) {
            await db.query(`
                UPDATE absensi_pengaturan 
                SET nama_lokasi = ?, latitude = ?, longitude = ?, radius_meter = ?, jam_masuk = ?, jam_pulang = ?
                WHERE id = ?
            `, [nama_lokasi, latitude, longitude, radius_meter, jam_masuk, jam_pulang, existing[0].id]);
        } else {
            await db.query(`
                INSERT INTO absensi_pengaturan (nama_lokasi, latitude, longitude, radius_meter, jam_masuk, jam_pulang)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [nama_lokasi, latitude, longitude, radius_meter, jam_masuk, jam_pulang]);
        }

        // Catat Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'ABSENSI',
            'UPDATE_SETTING',
            `Memperbarui pengaturan absensi: "${nama_lokasi}" (Radius: ${radius_meter}m, Jam: ${jam_masuk} - ${jam_pulang})`
        );

        res.json({ success: true, message: "Pengaturan absensi berhasil diperbarui" });
    } catch (error) {
        console.error('Error updatePengaturan:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 3. GET /api/absensi/tenaga-ahli (Public)
 * Mengambil daftar pegawai bertipe 'tenaga_ahli' beserta status absensi hari ini (CURDATE())
 */
exports.getDaftarTenagaAhli = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.nama, 
                p.jabatan, 
                p.nip, 
                p.foto_referensi, 
                p.face_descriptor,
                (p.face_descriptor IS NOT NULL AND p.face_descriptor != '') AS has_face,
                a.jam_masuk,
                a.jam_pulang,
                a.kategori_kerja,
                a.status_kehadiran,
                a.foto_masuk,
                a.foto_pulang,
                a.jarak_meter,
                a.face_score,
                (a.jam_masuk IS NOT NULL) AS is_checked_in,
                (a.jam_pulang IS NOT NULL) AS is_checked_out
            FROM pegawai p
            LEFT JOIN absensi_tenaga_ahli a ON p.id = a.pegawai_id AND a.tanggal = CURDATE()
            WHERE p.jenis_pegawai = 'tenaga_ahli'
            ORDER BY p.urutan ASC, p.nama ASC
        `;
        const [rows] = await db.query(query);

        // Parsing face_descriptor jika disimpan sebagai JSON string
        const formatted = rows.map(r => {
            let parsedDescriptor = null;
            if (r.face_descriptor) {
                try {
                    parsedDescriptor = typeof r.face_descriptor === 'string' 
                        ? JSON.parse(r.face_descriptor) 
                        : r.face_descriptor;
                } catch {
                    parsedDescriptor = null;
                }
            }
            return {
                ...r,
                face_descriptor: parsedDescriptor
            };
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Error getDaftarTenagaAhli:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 4. POST /api/absensi/enroll-face (Protected)
 * Merekam face descriptor dan foto referensi wajah tenaga ahli ke tabel pegawai
 */
exports.enrollFace = async (req, res) => {
    try {
        const pegawai_id = req.params.pegawaiId || req.body.pegawai_id;
        const { face_descriptor } = req.body;

        if (!pegawai_id) {
            return res.status(400).json({ success: false, message: "ID Pegawai wajib disertakan!" });
        }
        if (!face_descriptor) {
            return res.status(400).json({ success: false, message: "Face descriptor wajib disertakan!" });
        }

        const [pRows] = await db.query("SELECT id, nama, jenis_pegawai FROM pegawai WHERE id = ?", [pegawai_id]);
        if (pRows.length === 0) {
            return res.status(404).json({ success: false, message: "Data Pegawai tidak ditemukan!" });
        }

        const descriptorStr = typeof face_descriptor === 'string' 
            ? face_descriptor 
            : JSON.stringify(face_descriptor);

        const fotoPath = req.file ? `/uploads/absensi/${req.file.filename}` : null;

        if (fotoPath) {
            await db.query(
                "UPDATE pegawai SET face_descriptor = ?, foto_referensi = ? WHERE id = ?",
                [descriptorStr, fotoPath, pegawai_id]
            );
        } else {
            await db.query(
                "UPDATE pegawai SET face_descriptor = ? WHERE id = ?",
                [descriptorStr, pegawai_id]
            );
        }

        // Catat Log Aktivitas
        const userId = req.user ? req.user.id : null;
        await logActivity(
            userId,
            'ABSENSI',
            'ENROLL_FACE',
            `Merekam data referensi biometrik wajah untuk Tenaga Ahli "${pRows[0].nama}" (ID: ${pegawai_id})`
        );

        res.json({ 
            success: true, 
            message: "Referensi wajah berhasil disimpan!",
            foto_referensi: fotoPath 
        });
    } catch (error) {
        console.error('Error enrollFace:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 5. POST /api/absensi/submit (Public)
 * Menerima absensi masuk atau absensi pulang dengan validasi Face Recognition & Geofence
 */
exports.submitAbsensi = async (req, res) => {
    try {
        const { 
            pegawai_id, 
            tipe, 
            kategori_kerja = 'WFO', 
            latitude, 
            longitude, 
            face_score, 
            keterangan 
        } = req.body;

        if (!pegawai_id || !tipe) {
            return res.status(400).json({ 
                success: false, 
                message: "ID Pegawai dan tipe presensi ('masuk' atau 'pulang') wajib diisi!" 
            });
        }

        if (!['masuk', 'pulang'].includes(tipe)) {
            return res.status(400).json({ 
                success: false, 
                message: "Tipe presensi tidak valid. Gunakan 'masuk' atau 'pulang'!" 
            });
        }

        // 1. Verifikasi Tenaga Ahli
        const [pRows] = await db.query(
            "SELECT id, nama, jenis_pegawai, face_descriptor FROM pegawai WHERE id = ?", 
            [pegawai_id]
        );
        if (pRows.length === 0) {
            return res.status(404).json({ success: false, message: "Data Pegawai tidak ditemukan!" });
        }
        const pegawai = pRows[0];

        // 2. Ambil Pengaturan Absensi Aktif
        let [cfgRows] = await db.query("SELECT * FROM absensi_pengaturan LIMIT 1");
        const pengaturan = cfgRows.length > 0 ? cfgRows[0] : {
            latitude: -7.204567,
            longitude: 107.890123,
            radius_meter: 100,
            jam_masuk: '08:00:00',
            jam_pulang: '16:00:00'
        };

        // 3. Perhitungan Geofence (Haversine)
        let jarak_meter = null;
        if (latitude != null && longitude != null) {
            jarak_meter = getDistanceFromLatLonInMeters(
                Number(latitude),
                Number(longitude),
                Number(pengaturan.latitude),
                Number(pengaturan.longitude)
            );
        }

        // Validasi Geofence khusus WFO
        if (kategori_kerja === 'WFO') {
            if (latitude == null || longitude == null) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Koordinat GPS perangkat wajib diaktifkan untuk presensi WFO!" 
                });
            }
            if (jarak_meter !== null && jarak_meter > Number(pengaturan.radius_meter)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Lokasi Anda berada di luar radius kantor (${jarak_meter} meter dari titik kantor, batas maksimal ${pengaturan.radius_meter} meter). Silakan mendekat ke area kantor.` 
                });
            }
        }

        // Foto file
        const fotoPath = req.file ? `/uploads/absensi/${req.file.filename}` : null;

        // Cek record absensi hari ini
        const [todayRows] = await db.query(
            "SELECT * FROM absensi_tenaga_ahli WHERE pegawai_id = ? AND tanggal = CURDATE()",
            [pegawai_id]
        );
        const todayRecord = todayRows.length > 0 ? todayRows[0] : null;

        // === KASUS 1: ABSENSI MASUK ===
        if (tipe === 'masuk') {
            if (todayRecord && todayRecord.jam_masuk) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Anda sudah melakukan presensi masuk hari ini pada pukul ${String(todayRecord.jam_masuk).slice(0, 5)} WIB.` 
                });
            }

            if (!fotoPath && kategori_kerja !== 'Izin/Sakit') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Foto wajah saat presensi masuk wajib dilampirkan!" 
                });
            }

            // Tentukan status kehadiran
            let status_kehadiran = 'Tepat Waktu';
            if (kategori_kerja === 'Izin/Sakit') {
                status_kehadiran = 'Izin';
            } else {
                // Ambil jam saat ini di server
                const now = new Date();
                const currentHms = [
                    String(now.getHours()).padStart(2, '0'),
                    String(now.getMinutes()).padStart(2, '0'),
                    String(now.getSeconds()).padStart(2, '0')
                ].join(':');

                const batasJamMasuk = String(pengaturan.jam_masuk).slice(0, 8);
                if (currentHms > batasJamMasuk) {
                    status_kehadiran = 'Terlambat';
                }
            }

            // Simpan / Insert
            await db.query(`
                INSERT INTO absensi_tenaga_ahli 
                (pegawai_id, tanggal, jam_masuk, kategori_kerja, status_kehadiran, lat_masuk, lng_masuk, jarak_meter, foto_masuk, face_score, keterangan)
                VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    jam_masuk = VALUES(jam_masuk),
                    kategori_kerja = VALUES(kategori_kerja),
                    status_kehadiran = VALUES(status_kehadiran),
                    lat_masuk = VALUES(lat_masuk),
                    lng_masuk = VALUES(lng_masuk),
                    jarak_meter = VALUES(jarak_meter),
                    foto_masuk = VALUES(foto_masuk),
                    face_score = VALUES(face_score),
                    keterangan = VALUES(keterangan)
            `, [
                pegawai_id,
                kategori_kerja,
                status_kehadiran,
                latitude || null,
                longitude || null,
                jarak_meter,
                fotoPath,
                face_score || null,
                keterangan || null
            ]);

            // Catat Log Aktivitas
            await logActivity(
                null,
                'ABSENSI',
                'CHECK_IN',
                `Tenaga Ahli "${pegawai.nama}" Presensi Masuk [${status_kehadiran}] (${kategori_kerja})${jarak_meter !== null ? ` - Radius: ${jarak_meter}m` : ''}`
            );

            return res.status(201).json({
                success: true,
                message: `Presensi Masuk berhasil dicatat (${status_kehadiran})!`,
                status_kehadiran,
                jarak_meter
            });
        }

        // === KASUS 2: ABSENSI PULANG ===
        if (tipe === 'pulang') {
            if (!todayRecord || !todayRecord.jam_masuk) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Anda belum melakukan presensi masuk hari ini!" 
                });
            }

            if (todayRecord.jam_pulang) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Anda sudah melakukan presensi pulang hari ini pada pukul ${String(todayRecord.jam_pulang).slice(0, 5)} WIB.` 
                });
            }

            if (!fotoPath && kategori_kerja !== 'Izin/Sakit') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Foto wajah saat presensi pulang wajib dilampirkan!" 
                });
            }

            await db.query(`
                UPDATE absensi_tenaga_ahli 
                SET jam_pulang = CURTIME(), 
                    foto_pulang = COALESCE(?, foto_pulang),
                    keterangan = CASE 
                        WHEN ? IS NOT NULL AND ? != '' 
                        THEN CONCAT(COALESCE(keterangan, ''), ' | Pulang: ', ?) 
                        ELSE keterangan 
                    END
                WHERE pegawai_id = ? AND tanggal = CURDATE()
            `, [fotoPath, keterangan, keterangan, keterangan, pegawai_id]);

            // Catat Log Aktivitas
            await logActivity(
                null,
                'ABSENSI',
                'CHECK_OUT',
                `Tenaga Ahli "${pegawai.nama}" melakukan Presensi Pulang`
            );

            return res.json({
                success: true,
                message: "Presensi Pulang berhasil dicatat. Terima kasih atas kerja keras Anda hari ini!"
            });
        }
    } catch (error) {
        console.error('Error submitAbsensi:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 6. GET /api/absensi/rekap (Protected)
 * Mengambil rekap absensi harian (LEFT JOIN dari pegawai agar yang belum absen tetap tampil)
 * atau rekap bulanan dengan ringkasan statistik
 */
exports.getRekapAbsensi = async (req, res) => {
    try {
        const { tanggal, bulan, tahun, pegawai_id } = req.query;

        // MODE 1: Rekap Bulanan
        if (bulan && tahun) {
            let sql = `
                SELECT 
                    a.*,
                    p.nama,
                    p.jabatan,
                    p.nip,
                    p.foto_referensi
                FROM absensi_tenaga_ahli a
                JOIN pegawai p ON a.pegawai_id = p.id
                WHERE MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
            `;
            const params = [Number(bulan), Number(tahun)];

            if (pegawai_id) {
                sql += " AND a.pegawai_id = ?";
                params.push(pegawai_id);
            }

            sql += " ORDER BY a.tanggal DESC, a.jam_masuk DESC";

            const [rows] = await db.query(sql, params);
            return res.json({
                success: true,
                filter: { bulan, tahun, pegawai_id },
                total: rows.length,
                data: rows
            });
        }

        // MODE 2: Rekap Harian (Default: Tanggal Tertentu atau Hari Ini)
        const targetDate = tanggal || null;
        let query = '';
        let params = [];

        if (targetDate) {
            query = `
                SELECT 
                    p.id AS pegawai_id,
                    p.nama,
                    p.jabatan,
                    p.nip,
                    p.foto_referensi,
                    p.urutan,
                    a.id AS absensi_id,
                    COALESCE(a.tanggal, ?) AS tanggal,
                    a.jam_masuk,
                    a.jam_pulang,
                    a.kategori_kerja,
                    a.status_kehadiran,
                    a.lat_masuk,
                    a.lng_masuk,
                    a.jarak_meter,
                    a.foto_masuk,
                    a.foto_pulang,
                    a.face_score,
                    a.keterangan,
                    (a.jam_masuk IS NOT NULL) AS is_hadir
                FROM pegawai p
                LEFT JOIN absensi_tenaga_ahli a ON p.id = a.pegawai_id AND a.tanggal = ?
                WHERE p.jenis_pegawai = 'tenaga_ahli'
            `;
            params = [targetDate, targetDate];
        } else {
            query = `
                SELECT 
                    p.id AS pegawai_id,
                    p.nama,
                    p.jabatan,
                    p.nip,
                    p.foto_referensi,
                    p.urutan,
                    a.id AS absensi_id,
                    COALESCE(a.tanggal, CURDATE()) AS tanggal,
                    a.jam_masuk,
                    a.jam_pulang,
                    a.kategori_kerja,
                    a.status_kehadiran,
                    a.lat_masuk,
                    a.lng_masuk,
                    a.jarak_meter,
                    a.foto_masuk,
                    a.foto_pulang,
                    a.face_score,
                    a.keterangan,
                    (a.jam_masuk IS NOT NULL) AS is_hadir
                FROM pegawai p
                LEFT JOIN absensi_tenaga_ahli a ON p.id = a.pegawai_id AND a.tanggal = CURDATE()
                WHERE p.jenis_pegawai = 'tenaga_ahli'
            `;
        }

        if (pegawai_id) {
            query += " AND p.id = ?";
            params.push(pegawai_id);
        }

        query += " ORDER BY p.urutan ASC, p.nama ASC";

        const [rows] = await db.query(query, params);

        // Ringkasan Statistik
        const total_ta = rows.length;
        let hadir = 0;
        let tepat_waktu = 0;
        let terlambat = 0;
        let dinas_luar = 0;
        let izin = 0;
        let belum_absen = 0;
        let sudah_pulang = 0;

        rows.forEach(r => {
            if (r.jam_masuk) {
                if (r.kategori_kerja === 'Izin/Sakit') {
                    izin++;
                } else if (r.kategori_kerja === 'Dinas Luar') {
                    dinas_luar++;
                    hadir++;
                } else {
                    hadir++;
                    if (r.status_kehadiran === 'Tepat Waktu') tepat_waktu++;
                    else if (r.status_kehadiran === 'Terlambat') terlambat++;
                }
                if (r.jam_pulang) sudah_pulang++;
            } else {
                belum_absen++;
            }
        });

        res.json({
            success: true,
            tanggal: targetDate || 'Hari Ini',
            summary: {
                total_ta,
                hadir,
                tepat_waktu,
                terlambat,
                dinas_luar,
                izin,
                belum_absen,
                sudah_pulang
            },
            data: rows
        });
    } catch (error) {
        console.error('Error getRekapAbsensi:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
