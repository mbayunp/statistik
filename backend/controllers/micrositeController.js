const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// In-memory cache untuk halaman publik microsite berdasarkan slug (TTL: 60 detik)
const micrositeSlugCache = new Map();
const MICROSITE_CACHE_TTL_MS = 60 * 1000;

function invalidateMicrositeCache(slug) {
    if (slug) {
        micrositeSlugCache.delete(slug);
    } else {
        micrositeSlugCache.clear();
    }
}

function safeJsonParse(value, defaultValue = null) {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return defaultValue;
    }
}

// Auto-initialization tabel microsites (berjalan sekali saat startup/request pertama)
let ensureTablePromise = null;
async function ensureMicrositesTable() {
    if (!ensureTablePromise) {
        ensureTablePromise = db.query(`
            CREATE TABLE IF NOT EXISTS microsites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT NULL,
                theme_config JSON NULL,
                links_item JSON NOT NULL,
                is_active TINYINT(1) DEFAULT 1,
                view_count INT DEFAULT 0,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `).catch((err) => {
            ensureTablePromise = null;
            console.error('Error auto-creating microsites table:', err);
        });
    }
    return ensureTablePromise;
}

const micrositeController = {
    // 1. GET /api/microsites (Admin) - Ambil semua daftar microsite
    getAllMicrosites: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const [rows] = await db.execute(
                'SELECT id, title, slug, description, theme_config, links_item, is_active, view_count, created_by, created_at, updated_at FROM microsites ORDER BY created_at DESC'
            );
            const data = rows.map((row) => ({
                ...row,
                is_active: row.is_active === null ? 1 : Number(row.is_active),
                view_count: Number(row.view_count || 0),
                theme_config: safeJsonParse(row.theme_config, {}),
                links_item: safeJsonParse(row.links_item, [])
            }));
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error getAllMicrosites:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil daftar portal microsite' });
        }
    },

    // 2. GET /api/microsites/id/:id (Admin) - Ambil detail microsite berdasarkan ID
    getMicrositeById: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const { id } = req.params;
            const [rows] = await db.execute('SELECT * FROM microsites WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Portal microsite tidak ditemukan' });
            }
            const row = rows[0];
            res.status(200).json({
                success: true,
                data: {
                    ...row,
                    is_active: row.is_active === null ? 1 : Number(row.is_active),
                    view_count: Number(row.view_count || 0),
                    theme_config: safeJsonParse(row.theme_config, {}),
                    links_item: safeJsonParse(row.links_item, [])
                }
            });
        } catch (error) {
            console.error('Error getMicrositeById:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil detail portal microsite' });
        }
    },

    // 3. POST /api/microsites (Admin) - Buat microsite baru
    createMicrosite: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const { title, slug, description, theme_config, links_item, is_active } = req.body;

            if (!title || !slug) {
                return res.status(400).json({ success: false, message: 'Judul dan slug portal wajib diisi!' });
            }

            const cleanSlug = String(slug)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-_]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            if (!cleanSlug) {
                return res.status(400).json({ success: false, message: 'Slug portal tidak valid!' });
            }

            const [existing] = await db.execute('SELECT id FROM microsites WHERE slug = ?', [cleanSlug]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Slug portal sudah digunakan, silakan pilih slug lain!' });
            }

            const themeStr = JSON.stringify(theme_config || {});
            const linksStr = JSON.stringify(Array.isArray(links_item) ? links_item : []);
            const activeStatus = is_active === undefined || is_active === null ? 1 : (is_active ? 1 : 0);
            const userId = req.user ? req.user.id : null;

            const [result] = await db.execute(
                'INSERT INTO microsites (title, slug, description, theme_config, links_item, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title.trim(), cleanSlug, description || null, themeStr, linksStr, activeStatus, userId]
            );

            invalidateMicrositeCache(cleanSlug);

            await logActivity(
                userId,
                'MICROSITE',
                'CREATE',
                `Membuat portal microsite baru "${title.trim()}" (Slug: /p/${cleanSlug})`
            );

            res.status(201).json({
                success: true,
                message: 'Portal microsite berhasil dibuat!',
                data: { id: result.insertId, slug: cleanSlug }
            });
        } catch (error) {
            console.error('Error createMicrosite:', error);
            res.status(500).json({ success: false, message: 'Gagal membuat portal microsite', error: error.message });
        }
    },

    // 4. PUT /api/microsites/:id (Admin) - Update microsite
    updateMicrosite: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const { id } = req.params;
            const { title, slug, description, theme_config, links_item, is_active } = req.body;

            const [rows] = await db.execute('SELECT * FROM microsites WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Portal microsite tidak ditemukan' });
            }

            const existingRow = rows[0];
            let finalSlug = existingRow.slug;

            if (slug !== undefined) {
                const cleanSlug = String(slug)
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9-_]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                if (!cleanSlug) {
                    return res.status(400).json({ success: false, message: 'Slug portal tidak valid!' });
                }

                const [conflict] = await db.execute('SELECT id FROM microsites WHERE slug = ? AND id != ?', [cleanSlug, id]);
                if (conflict.length > 0) {
                    return res.status(400).json({ success: false, message: 'Slug portal sudah digunakan oleh microsite lain!' });
                }
                finalSlug = cleanSlug;
            }

            const finalTitle = title !== undefined ? String(title).trim() : existingRow.title;
            const finalDesc = description !== undefined ? description : existingRow.description;
            const finalTheme = theme_config !== undefined ? JSON.stringify(theme_config) : (typeof existingRow.theme_config === 'string' ? existingRow.theme_config : JSON.stringify(existingRow.theme_config || {}));
            const finalLinks = links_item !== undefined ? JSON.stringify(Array.isArray(links_item) ? links_item : []) : (typeof existingRow.links_item === 'string' ? existingRow.links_item : JSON.stringify(existingRow.links_item || []));
            const finalActive = is_active !== undefined ? (is_active ? 1 : 0) : existingRow.is_active;

            await db.execute(
                'UPDATE microsites SET title = ?, slug = ?, description = ?, theme_config = ?, links_item = ?, is_active = ? WHERE id = ?',
                [finalTitle, finalSlug, finalDesc || null, finalTheme, finalLinks, finalActive, id]
            );

            invalidateMicrositeCache(existingRow.slug);
            if (finalSlug !== existingRow.slug) {
                invalidateMicrositeCache(finalSlug);
            }

            const userId = req.user ? req.user.id : null;
            await logActivity(
                userId,
                'MICROSITE',
                'UPDATE',
                `Memperbarui portal microsite "${finalTitle}" (Slug: /p/${finalSlug})`
            );

            res.status(200).json({ success: true, message: 'Portal microsite berhasil diperbarui!', data: { id: Number(id), slug: finalSlug } });
        } catch (error) {
            console.error('Error updateMicrosite:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui portal microsite', error: error.message });
        }
    },

    // 5. DELETE /api/microsites/:id (Admin) - Hapus microsite
    deleteMicrosite: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const { id } = req.params;
            const [rows] = await db.execute('SELECT id, title, slug FROM microsites WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Portal microsite tidak ditemukan' });
            }

            await db.execute('DELETE FROM microsites WHERE id = ?', [id]);
            invalidateMicrositeCache(rows[0].slug);

            const userId = req.user ? req.user.id : null;
            await logActivity(
                userId,
                'MICROSITE',
                'DELETE',
                `Menghapus portal microsite "${rows[0].title}" (/p/${rows[0].slug})`
            );

            res.status(200).json({ success: true, message: 'Portal microsite berhasil dihapus' });
        } catch (error) {
            console.error('Error deleteMicrosite:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus portal microsite' });
        }
    },

    // 6. GET /api/microsites/public/:slug (Publik, High-Traffic Ready dengan In-Memory Cache)
    getPublicMicrositeBySlug: async (req, res) => {
        try {
            await ensureMicrositesTable();
            const { slug } = req.params;

            // Tambah view_count secara asynchronous tanpa memblokir response
            const incrementViewAsync = () => {
                db.execute('UPDATE microsites SET view_count = view_count + 1 WHERE slug = ?', [slug])
                    .catch((err) => console.error('Async view_count increment error:', err.message));
            };

            // Cek In-Memory Cache
            const cached = micrositeSlugCache.get(slug);
            if (cached && (Date.now() - cached.timestamp < MICROSITE_CACHE_TTL_MS)) {
                if (cached.data.is_active === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Portal kegiatan ini sedang tidak aktif atau telah ditutup.',
                        is_inactive: true
                    });
                }
                incrementViewAsync();
                return res.status(200).json({
                    success: true,
                    data: cached.data
                });
            }

            const [rows] = await db.execute(
                'SELECT id, title, slug, description, theme_config, links_item, is_active, view_count FROM microsites WHERE slug = ?',
                [slug]
            );

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Portal microsite tidak ditemukan' });
            }

            const microsite = rows[0];
            const isActiveNum = microsite.is_active === null ? 1 : Number(microsite.is_active);
            const themeConfig = safeJsonParse(microsite.theme_config, {});
            let linksItem = safeJsonParse(microsite.links_item, []);
            if (!Array.isArray(linksItem)) linksItem = [];

            // Cek status aktif formulir terkait untuk item bertipe 'form'
            const formSlugs = linksItem
                .filter((item) => item && item.type === 'form' && item.form_slug)
                .map((item) => item.form_slug);

            let formStatusMap = {};
            if (formSlugs.length > 0) {
                const uniqueSlugs = [...new Set(formSlugs)];
                const placeholders = uniqueSlugs.map(() => '?').join(',');
                const [formRows] = await db.execute(
                    `SELECT slug, is_active FROM forms WHERE slug IN (${placeholders})`,
                    uniqueSlugs
                );
                formRows.forEach((f) => {
                    formStatusMap[f.slug] = f.is_active === null ? 1 : Number(f.is_active);
                });
            }

            const enrichedLinks = linksItem.map((item) => {
                if (item && item.type === 'form' && item.form_slug) {
                    const existsInMap = Object.prototype.hasOwnProperty.call(formStatusMap, item.form_slug);
                    const isFormActive = existsInMap ? formStatusMap[item.form_slug] !== 0 : false;
                    return {
                        ...item,
                        is_form_active: isFormActive
                    };
                }
                return item;
            });

            const payload = {
                id: microsite.id,
                title: microsite.title,
                slug: microsite.slug,
                description: microsite.description,
                theme_config: themeConfig,
                links_item: enrichedLinks,
                is_active: isActiveNum,
                view_count: Number(microsite.view_count || 0)
            };

            micrositeSlugCache.set(slug, {
                timestamp: Date.now(),
                data: payload
            });

            if (isActiveNum === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Portal kegiatan ini sedang tidak aktif atau telah ditutup.',
                    is_inactive: true
                });
            }

            incrementViewAsync();
            res.status(200).json({
                success: true,
                data: payload
            });
        } catch (error) {
            console.error('Error getPublicMicrositeBySlug:', error);
            res.status(500).json({ success: false, message: 'Gagal memuat portal microsite' });
        }
    }
};

module.exports = micrositeController;
