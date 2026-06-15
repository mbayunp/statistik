const db = require('../config/db');

const formController = {
    // 1. Mengambil semua daftar formulir (Untuk Halaman Admin)
    getAllForms: async (req, res) => {
        try {
            // Mengambil form beserta jumlah responnya
            const query = `
                SELECT f.*, COUNT(r.id) as total_responses 
                FROM forms f 
                LEFT JOIN form_responses r ON f.id = r.form_id 
                GROUP BY f.id 
                ORDER BY f.created_at DESC
            `;
            const [rows] = await db.execute(query);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getAllForms:', error);
            res.status(500).json({ success: false, message: 'Gagal mengambil daftar formulir' });
        }
    },

    // 2. Membuat Formulir Baru & Menyimpan Pertanyaannya
    createForm: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction(); // Mulai transaksi

            const { title, slug, description, questions } = req.body;

            // Cek apakah slug sudah ada
            const [existing] = await connection.execute('SELECT id FROM forms WHERE slug = ?', [slug]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Slug / Link formulir sudah digunakan, gunakan yang lain!' });
            }

            // Insert ke tabel forms
            const [formResult] = await connection.execute(
                'INSERT INTO forms (title, slug, description) VALUES (?, ?, ?)',
                [title, slug, description || null]
            );
            const formId = formResult.insertId;

            // Insert semua pertanyaan (jika ada)
            if (questions && questions.length > 0) {
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    // Pastikan options diubah ke string JSON (misal dari array ["Pria", "Wanita"] ke string '["Pria", "Wanita"]')
                    const optionsString = q.options ? JSON.stringify(q.options) : null;
                    
                    await connection.execute(
                        'INSERT INTO form_questions (form_id, question_text, question_type, options, is_required, urutan) VALUES (?, ?, ?, ?, ?, ?)',
                        [formId, q.question_text, q.question_type, optionsString, q.is_required ? 1 : 0, i]
                    );
                }
            }

            await connection.commit(); // Simpan permanen ke database
            res.status(201).json({ success: true, message: 'Formulir berhasil dibuat!' });
        } catch (error) {
            await connection.rollback(); // Batalkan semua jika ada error
            console.error('Error createForm:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan formulir' });
        } finally {
            connection.release(); // Kembalikan koneksi ke pool
        }
    },

    // 3. Mengambil Detail 1 Formulir Beserta Pertanyaannya (Berdasarkan Slug untuk Public)
    getFormBySlug: async (req, res) => {
        try {
            const { slug } = req.params;

            // Ambil data form
            const [forms] = await db.execute('SELECT * FROM forms WHERE slug = ?', [slug]);
            if (forms.length === 0) {
                return res.status(404).json({ success: false, message: 'Formulir tidak ditemukan' });
            }
            const form = forms[0];

            // Ambil pertanyaan form ini
            const [questions] = await db.execute('SELECT * FROM form_questions WHERE form_id = ? ORDER BY urutan ASC', [form.id]);

            // Parsing kembali options dari string JSON ke Array agar mudah dibaca Frontend
            const parsedQuestions = questions.map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : []
            }));

            res.status(200).json({ 
                success: true, 
                data: {
                    ...form,
                    questions: parsedQuestions
                } 
            });
        } catch (error) {
            console.error('Error getFormBySlug:', error);
            res.status(500).json({ success: false, message: 'Gagal memuat formulir' });
        }
    },

    // 4. Menghapus Formulir (Berkat ON DELETE CASCADE di database, pertanyaan & jawaban akan otomatis ikut terhapus)
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

    // 5. Menyimpan Jawaban dari Halaman Publik (Public Submit)
submitResponse: async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { form_id, answers } = req.body; // format answers: { "id_pertanyaan": "jawabannya", ... }

        if (!form_id || !answers) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
        }

        // Insert ke tabel form_responses terlebih dahulu
        const [resResult] = await connection.execute(
            'INSERT INTO form_responses (form_id) VALUES (?)',
            [form_id]
        );
        const responseId = resResult.insertId;

        // Looping untuk menyimpan setiap jawaban pertanyaan
        for (const [questionId, answerText] of Object.entries(answers)) {
            // Jika jawaban berupa array (misal dari checkbox), gabungkan menjadi string pakai koma
            const finalAnswer = Array.isArray(answerText) ? answerText.join(', ') : String(answerText);

            await connection.execute(
                'INSERT INTO form_answers (response_id, question_id, answer_text) VALUES (?, ?, ?)',
                [responseId, questionId, finalAnswer]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Respon Anda berhasil dikirim!' });
    } catch (error) {
        await connection.rollback();
        console.error('Error submitResponse:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim respon formulir' });
    } finally {
        connection.release();
    }
},

// 6. Mengambil Semua Respon Jawaban Berdasarkan ID Form (Untuk Admin)
getFormResponses: async (req, res) => {
    try {
        const { formId } = req.params;

        // Ambil daftar pertanyaan untuk header tabel nantinya
        const [questions] = await db.execute(
            'SELECT id, question_text, question_type FROM form_questions WHERE form_id = ? ORDER BY urutan ASC',
            [formId]
        );

        // Ambil data baris jawaban responden
        const queryAnswers = `
            SELECT r.id as response_id, r.submitted_at, a.question_id, a.answer_text
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
                groupedResponses[row.response_id].answers[row.question_id] = row.answer_text;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                questions,
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

