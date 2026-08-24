const db = require('../config/db');

async function migrate() {
    console.log('🔄 Memulai migrasi database Dynamic Form Builder...');
    const connection = await db.getConnection();

    try {
        // 1. Pastikan tabel forms ada
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS forms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                description TEXT NULL,
                is_active TINYINT(1) DEFAULT 1,
                settings JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✅ Tabel `forms` diverifikasi');

        // Helper untuk tambah kolom jika belum ada
        const addColumnIfNotExists = async (table, column, definition) => {
            try {
                const [cols] = await connection.execute(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
                    [table, column]
                );
                if (cols.length === 0) {
                    await connection.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
                    console.log(`  + Kolom \`${table}\`.\`${column}\` berhasil ditambahkan.`);
                } else {
                    console.log(`  - Kolom \`${table}\`.\`${column}\` sudah ada.`);
                }
            } catch (err) {
                console.error(`  ⚠️ Gagal menambahkan kolom ${table}.${column}:`, err.message);
            }
        };

        // Update kolom pada tabel forms
        await addColumnIfNotExists('forms', 'is_active', 'TINYINT(1) DEFAULT 1');
        await addColumnIfNotExists('forms', 'settings', 'JSON NULL');
        await addColumnIfNotExists('forms', 'updated_at', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        // 2. Pastikan tabel form_questions ada
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS form_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                form_id INT NOT NULL,
                element_category ENUM('input', 'layout') DEFAULT 'input',
                question_text TEXT NULL,
                question_type VARCHAR(50) NOT NULL,
                description TEXT NULL,
                placeholder VARCHAR(255) NULL,
                options JSON NULL,
                validation_rules JSON NULL,
                layout_config JSON NULL,
                is_required TINYINT(1) DEFAULT 0,
                urutan INT DEFAULT 0,
                FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✅ Tabel `form_questions` diverifikasi');

        // Update kolom pada form_questions
        try {
            await connection.execute(`ALTER TABLE form_questions MODIFY COLUMN question_type VARCHAR(50) NOT NULL`);
            console.log('  + Kolom `form_questions`.`question_type` dimodifikasi menjadi VARCHAR(50).');
        } catch (err) {
            console.log('  - Modifikasi question_type:', err.message);
        }

        try {
            await connection.execute(`ALTER TABLE form_questions MODIFY COLUMN question_text TEXT NULL`);
            console.log('  + Kolom `form_questions`.`question_text` dimodifikasi menjadi TEXT NULL.');
        } catch (err) {
            console.log('  - Modifikasi question_text:', err.message);
        }

        await addColumnIfNotExists('form_questions', 'element_category', "ENUM('input', 'layout') DEFAULT 'input'");
        await addColumnIfNotExists('form_questions', 'description', 'TEXT NULL');
        await addColumnIfNotExists('form_questions', 'placeholder', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('form_questions', 'validation_rules', 'JSON NULL');
        await addColumnIfNotExists('form_questions', 'layout_config', 'JSON NULL');
        await addColumnIfNotExists('form_questions', 'urutan', 'INT DEFAULT 0');

        // 3. Pastikan tabel form_responses ada
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS form_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                form_id INT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✅ Tabel `form_responses` diverifikasi');

        // 4. Pastikan tabel form_answers ada
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS form_answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                response_id INT NOT NULL,
                question_id INT NOT NULL,
                answer_text LONGTEXT NULL,
                answer_json JSON NULL,
                FOREIGN KEY (response_id) REFERENCES form_responses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✅ Tabel `form_answers` diverifikasi');

        // Modifikasi answer_text jadi LONGTEXT jika sebelumnya TEXT / VARCHAR
        try {
            await connection.execute(`ALTER TABLE form_answers MODIFY COLUMN answer_text LONGTEXT NULL`);
            console.log('  + Kolom `form_answers`.`answer_text` diubah menjadi LONGTEXT.');
        } catch (err) {
            console.log('  - Modifikasi answer_text:', err.message);
        }
        await addColumnIfNotExists('form_answers', 'answer_json', 'JSON NULL');

        console.log('🎉 Migrasi Dynamic Form Builder Selesai dengan Sukses!');
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat migrasi:', error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

migrate();
