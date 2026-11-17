const db = require('../config/db');

async function migrateMicrosites() {
    console.log('🔄 Memeriksa & membuat tabel microsites jika belum ada...');
    try {
        const query = `
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
        `;
        await db.query(query);
        console.log('✅ Tabel `microsites` siap digunakan!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error saat migrasi microsites:', error.message);
        process.exit(1);
    }
}

migrateMicrosites();
