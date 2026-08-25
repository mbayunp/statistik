const db = require('../config/db');

// Helper function untuk parsing JSON yang aman
function safeJsonParse(value, defaultValue = null) {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch (e) {
        return defaultValue;
    }
}

const formController = {
    // 1. Mengambil semua daftar formulir (Untuk Halaman Admin)
    getAllForms: async (req, res) => {
        try {
            const query = `
                SELECT f.id, f.title, f.slug, f.description, f.is_active, f.settings, f.created_at, f.updated_at,
                       COUNT(r.id) as total_responses 
                FROM forms f 
                LEFT JOIN form_responses r ON f.id = r.form_id 
                GROUP BY f.id 
                ORDER BY f.created_at DESC
            `;
            const [rows] = await db.execute(query);
            const data = rows.map(form => ({
                ...form,
                is_active: form.is_active === null ? 1 : Number(form.is_active),
                settings: safeJsonParse(form.settings, {})
            }));
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('Error getAllForms:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil daftar formulir' });
        }
    },

    // 2. Membuat Formulir Baru & Menyimpan Elemen / Pertanyaannya
    createForm: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction(); // Mulai transaksi

            const { title, slug, description, is_active, settings, questions } = req.body;

            if (!title || !slug) {
                return res.status(400).json({ success: false, message: 'Judul dan link slug formulir wajib diisi!' });
            }

            // Cek apakah slug sudah digunakan
            const [existing] = await connection.execute('SELECT id FROM forms WHERE slug = ?', [slug]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Slug / Link formulir sudah digunakan, silakan gunakan yang lain!' });
            }

            const settingsString = settings ? JSON.stringify(settings) : null;
            const activeStatus = is_active === undefined || is_active === null ? 1 : (is_active ? 1 : 0);

            // Insert ke tabel forms
            const [formResult] = await connection.execute(
                'INSERT INTO forms (title, slug, description, is_active, settings) VALUES (?, ?, ?, ?, ?)',
                [title, slug, description || null, activeStatus, settingsString]
            );
            const formId = formResult.insertId;

            // Insert semua elemen / pertanyaan (jika ada)
            if (questions && Array.isArray(questions) && questions.length > 0) {
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const optionsString = q.options ? JSON.stringify(q.options) : null;
                    const validationString = q.validation_rules ? JSON.stringify(q.validation_rules) : (q.validation ? JSON.stringify(q.validation) : null);
                    const layoutConfigString = q.layout_config ? JSON.stringify(q.layout_config) : null;
                    const elementCategory = q.element_category || (['section_header', 'banner_media', 'paragraph_text', 'divider'].includes(q.question_type) ? 'layout' : 'input');

                    await connection.execute(
                        `INSERT INTO form_questions 
                        (form_id, element_category, question_text, question_type, description, placeholder, options, validation_rules, layout_config, is_required, urutan) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            formId,
                            elementCategory,
                            q.question_text || '',
                            q.question_type || 'short_text',
                            q.description || null,
                            q.placeholder || null,
                            optionsString,
                            validationString,
                            layoutConfigString,
                            q.is_required ? 1 : 0,
                            i
                        ]
                    );
                }
            }

            await connection.commit(); // Simpan permanen ke database
            res.status(201).json({ success: true, message: 'Formulir berhasil dibuat!', data: { id: formId, slug } });
        } catch (error) {
            await connection.rollback(); // Batalkan jika ada error
            console.error('Error createForm:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan formulir', error: error.message });
        } finally {
            connection.release();
        }
    },

    // 3. Mengupdate Formulir & Menyinkronkan Pertanyaan (Edit Form)
    updateForm: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { id } = req.params;
            const { title, slug, description, is_active, settings, questions } = req.body;

            // 1. Cek apakah form ada
            const [forms] = await connection.execute('SELECT * FROM forms WHERE id = ?', [id]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }

            // 2. Cek slug bentrok dengan form lain
            if (slug) {
                const [existing] = await connection.execute('SELECT id FROM forms WHERE slug = ? AND id != ?', [slug, id]);
                if (existing.length > 0) {
                    return res.status(400).json({ success: false, message: 'Slug / Link formulir sudah digunakan oleh formulir lain!' });
                }
            }

            // 3. Update data pada tabel forms
            const settingsString = settings !== undefined ? (settings ? JSON.stringify(settings) : null) : forms[0].settings;
            const activeStatus = is_active !== undefined ? (is_active ? 1 : 0) : forms[0].is_active;

            await connection.execute(
                'UPDATE forms SET title = ?, slug = ?, description = ?, is_active = ?, settings = ?, updated_at = NOW() WHERE id = ?',
                [
                    title || forms[0].title,
                    slug || forms[0].slug,
                    description !== undefined ? description : forms[0].description,
                    activeStatus,
                    settingsString,
                    id
                ]
            );

            // 4. Sinkronisasi elemen / pertanyaan
            if (questions && Array.isArray(questions)) {
                // Ambil daftar question_id yang sudah ada di database untuk formulir ini
                const [existingQuestions] = await connection.execute('SELECT id FROM form_questions WHERE form_id = ?', [id]);
                const existingIds = existingQuestions.map(eq => eq.id);
                const keptIds = [];

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const optionsString = q.options ? JSON.stringify(q.options) : null;
                    const validationString = q.validation_rules ? JSON.stringify(q.validation_rules) : (q.validation ? JSON.stringify(q.validation) : null);
                    const layoutConfigString = q.layout_config ? JSON.stringify(q.layout_config) : null;
                    const elementCategory = q.element_category || (['section_header', 'banner_media', 'paragraph_text', 'divider'].includes(q.question_type) ? 'layout' : 'input');

                    const qId = Number(q.id);
                    if (!isNaN(qId) && existingIds.includes(qId)) {
                        // Update pertanyaan yang sudah ada
                        await connection.execute(
                            `UPDATE form_questions SET 
                                element_category = ?,
                                question_text = ?, 
                                question_type = ?, 
                                description = ?,
                                placeholder = ?,
                                options = ?, 
                                validation_rules = ?,
                                layout_config = ?,
                                is_required = ?, 
                                urutan = ? 
                            WHERE id = ? AND form_id = ?`,
                            [
                                elementCategory,
                                q.question_text || '',
                                q.question_type || 'short_text',
                                q.description || null,
                                q.placeholder || null,
                                optionsString,
                                validationString,
                                layoutConfigString,
                                q.is_required ? 1 : 0,
                                i,
                                qId,
                                id
                            ]
                        );
                        keptIds.push(qId);
                    } else {
                        // Tambahkan pertanyaan baru
                        const [insertResult] = await connection.execute(
                            `INSERT INTO form_questions 
                            (form_id, element_category, question_text, question_type, description, placeholder, options, validation_rules, layout_config, is_required, urutan) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                id,
                                elementCategory,
                                q.question_text || '',
                                q.question_type || 'short_text',
                                q.description || null,
                                q.placeholder || null,
                                optionsString,
                                validationString,
                                layoutConfigString,
                                q.is_required ? 1 : 0,
                                i
                            ]
                        );
                        keptIds.push(insertResult.insertId);
                    }
                }

                // Hapus pertanyaan yang tidak ada lagi di payload editor
                if (keptIds.length > 0) {
                    const placeholders = keptIds.map(() => '?').join(',');
                    await connection.execute(
                        `DELETE FROM form_questions WHERE form_id = ? AND id NOT IN (${placeholders})`,
                        [id, ...keptIds]
                    );
                } else {
                    await connection.execute('DELETE FROM form_questions WHERE form_id = ?', [id]);
                }
            }

            await connection.commit();
            res.status(200).json({ success: true, message: 'Formulir berhasil diperbarui!' });
        } catch (error) {
            await connection.rollback();
            console.error('Error updateForm:', error);
            res.status(500).json({ success: false, message: 'Gagal memperbarui formulir', error: error.message });
        } finally {
            connection.release();
        }
    },

    // 4. Mengambil Detail 1 Formulir Beserta Pertanyaannya (Berdasarkan Slug untuk Publik)
    getFormBySlug: async (req, res) => {
        try {
            const { slug } = req.params;

            const [forms] = await db.execute('SELECT * FROM forms WHERE slug = ?', [slug]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }
            const form = forms[0];

            if (form.is_active === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Formulir ini sedang tidak aktif atau telah ditutup.',
                    is_inactive: true
                });
            }

            const [questions] = await db.execute('SELECT * FROM form_questions WHERE form_id = ? ORDER BY urutan ASC', [form.id]);

            const parsedQuestions = questions.map(q => ({
                ...q,
                options: safeJsonParse(q.options, []),
                validation_rules: safeJsonParse(q.validation_rules, {}),
                layout_config: safeJsonParse(q.layout_config, {})
            }));

            res.status(200).json({ 
                success: true, 
                data: {
                    ...form,
                    settings: safeJsonParse(form.settings, {}),
                    questions: parsedQuestions
                } 
            });
        } catch (error) {
            console.error('Error getFormBySlug:', error);
            res.status(500).json({ success: false, message: 'Gagal memuat formulir' });
        }
    },

    // 5. Mengambil Detail Formulir untuk Admin Builder (Berdasarkan ID)
    getFormByIdAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            const [forms] = await db.execute('SELECT * FROM forms WHERE id = ?', [id]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }
            const form = forms[0];

            const [questions] = await db.execute('SELECT * FROM form_questions WHERE form_id = ? ORDER BY urutan ASC', [form.id]);

            const parsedQuestions = questions.map(q => ({
                ...q,
                options: safeJsonParse(q.options, []),
                validation_rules: safeJsonParse(q.validation_rules, {}),
                layout_config: safeJsonParse(q.layout_config, {})
            }));

            res.status(200).json({ 
                success: true, 
                data: {
                    ...form,
                    settings: safeJsonParse(form.settings, {}),
                    questions: parsedQuestions
                } 
            });
        } catch (error) {
            console.error('Error getFormByIdAdmin:', error);
            res.status(500).json({ success: false, message: 'Gagal memuat detail formulir' });
        }
    },

    // 6. Endpoint Upload Media Khusus Formulir (Banner, Lampiran, Signature, Webcam)
    uploadMedia: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah!' });
            }

            const fileUrl = `/uploads/${req.file.filename}`;
            res.status(200).json({
                success: true,
                message: 'Berkas formulir berhasil diunggah',
                file_url: fileUrl,
                original_name: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } catch (error) {
            console.error('Error uploadMedia:', error);
            res.status(500).json({ success: false, message: 'Gagal mengunggah berkas', error: error.message });
        }
    },

    // 7. Menghapus Formulir (Cascade delete pada pertanyaan & jawaban)
    deleteForm: async (req, res) => {
        try {
            const { id } = req.params;
            const [result] = await db.execute('DELETE FROM forms WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }

            res.status(200).json({ success: true, message: 'Formulir berhasil dihapus' });
        } catch (error) {
            console.error('Error deleteForm:', error);
            res.status(500).json({ success: false, message: 'Gagal menghapus formulir' });
        }
    },

    // 8. Menyimpan Jawaban dari Halaman Publik (Public Submit)
    submitResponse: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { form_id, answers } = req.body;

            if (!form_id || !answers || typeof answers !== 'object') {
                return res.status(400).json({ success: false, message: 'Data formulir tidak lengkap' });
            }

            // Cek apakah formulir ada dan masih aktif
            const [forms] = await connection.execute('SELECT id, is_active FROM forms WHERE id = ?', [form_id]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }
            if (forms[0].is_active === 0) {
                return res.status(403).json({ success: false, message: 'Formulir ini sudah tidak menerima respon baru' });
            }

            // Insert ke tabel form_responses
            const [resResult] = await connection.execute(
                'INSERT INTO form_responses (form_id) VALUES (?)',
                [form_id]
            );
            const responseId = resResult.insertId;

            // Looping dan simpan setiap jawaban pertanyaan
            for (const [questionId, answerValue] of Object.entries(answers)) {
                if (answerValue === undefined || answerValue === null) continue;

                let answerText = '';
                let answerJson = null;

                if (typeof answerValue === 'object') {
                    // Bisa array (checkbox) atau object (geolocation, file metadata, dll)
                    answerJson = JSON.stringify(answerValue);
                    if (Array.isArray(answerValue)) {
                        answerText = answerValue.join(', ');
                    } else {
                        answerText = JSON.stringify(answerValue);
                    }
                } else {
                    answerText = String(answerValue);
                    // Deteksi string JSON jika ada
                    if ((answerText.startsWith('{') && answerText.endsWith('}')) || (answerText.startsWith('[') && answerText.endsWith(']'))) {
                        try {
                            JSON.parse(answerText);
                            answerJson = answerText;
                        } catch (e) {
                            answerJson = null;
                        }
                    }
                }

                await connection.execute(
                    'INSERT INTO form_answers (response_id, question_id, answer_text, answer_json) VALUES (?, ?, ?, ?)',
                    [responseId, questionId, answerText, answerJson]
                );
            }

            await connection.commit();
            res.status(201).json({ success: true, message: 'Respon Anda berhasil dikirim!', response_id: responseId });
        } catch (error) {
            await connection.rollback();
            console.error('Error submitResponse:', error);
            res.status(500).json({ success: false, message: 'Gagal mengirim respon formulir', error: error.message });
        } finally {
            connection.release();
        }
    },

    // 9. Mengambil Semua Respon Jawaban Berdasarkan ID Form (Untuk Admin)
    getFormResponses: async (req, res) => {
        try {
            const { formId } = req.params;

            // Ambil info formulir
            const [forms] = await db.execute('SELECT id, title, slug, description FROM forms WHERE id = ?', [formId]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }

            // Ambil daftar pertanyaan untuk header tabel (urutan ASC)
            const [questions] = await db.execute(
                'SELECT id, element_category, question_text, question_type, options, layout_config FROM form_questions WHERE form_id = ? ORDER BY urutan ASC',
                [formId]
            );

            const parsedQuestions = questions.map(q => ({
                ...q,
                options: safeJsonParse(q.options, []),
                layout_config: safeJsonParse(q.layout_config, {})
            }));

            // Ambil data baris jawaban responden
            const queryAnswers = `
                SELECT r.id as response_id, r.submitted_at, a.question_id, a.answer_text, a.answer_json
                FROM form_responses r
                LEFT JOIN form_answers a ON r.id = a.response_id
                WHERE r.form_id = ?
                ORDER BY r.submitted_at DESC
            `;
            const [answersRows] = await db.execute(queryAnswers, [formId]);

            // Kelompokkan jawaban berdasarkan response_id (baris pengisian)
            const groupedResponses = {};
            answersRows.forEach(row => {
                if (!groupedResponses[row.response_id]) {
                    groupedResponses[row.response_id] = {
                        response_id: row.response_id,
                        submitted_at: row.submitted_at,
                        answers: {}
                    };
                }
                if (row.question_id) {
                    let finalAns = row.answer_text;
                    if (row.answer_json) {
                        finalAns = safeJsonParse(row.answer_json, row.answer_text);
                    } else if (row.answer_text && (row.answer_text.startsWith('{') || row.answer_text.startsWith('['))) {
                        finalAns = safeJsonParse(row.answer_text, row.answer_text);
                    }

                    groupedResponses[row.response_id].answers[row.question_id] = finalAns;
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    form: forms[0],
                    questions: parsedQuestions,
                    responses: Object.values(groupedResponses)
                }
            });
        } catch (error) {
            console.error('Error getFormResponses:', error);
            res.status(500).json({ success: false, message: 'Gagal memuat respon formulir' });
        }
    }
};

module.exports = formController;
