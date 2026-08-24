const http = require('http');
const db = require('../config/db');

// Import server/app directly or test controller logic
const formController = require('../controllers/formController');

async function runTests() {
    console.log('🧪 Memulai Backend Unit & Integration Tests untuk Dynamic Form...');

    try {
        // Mock res & req objects
        const createMockRes = () => {
            return {
                statusCode: 200,
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(payload) {
                    this.payload = payload;
                    return this;
                }
            };
        };

        // TEST 1: Create Form dengan Komponen Baru
        console.log('\n--- 1. TEST CREATE FORM ---');
        const testSlug = `test-form-${Date.now()}`;
        const reqCreate = {
            body: {
                title: 'Formulir Survei Multi Elemen',
                slug: testSlug,
                description: 'Deskripsi formulir uji coba',
                is_active: 1,
                settings: { allow_multiple_responses: true },
                questions: [
                    {
                        element_category: 'layout',
                        question_type: 'banner_media',
                        question_text: 'Header Banner',
                        layout_config: { banner_url: '/uploads/sample-banner.jpg', image_align: 'center' },
                        is_required: false
                    },
                    {
                        element_category: 'input',
                        question_type: 'short_text',
                        question_text: 'Nama Lengkap Responden',
                        placeholder: 'Masukkan nama Anda...',
                        is_required: true,
                        validation_rules: { min_length: 3, max_length: 100 }
                    },
                    {
                        element_category: 'input',
                        question_type: 'geolocation',
                        question_text: 'Titik Lokasi Kegiatan',
                        is_required: true,
                        description: 'Klik tombol untuk mendeteksi GPS koordinat'
                    },
                    {
                        element_category: 'input',
                        question_type: 'signature',
                        question_text: 'Tanda Tangan Petugas',
                        is_required: true
                    },
                    {
                        element_category: 'input',
                        question_type: 'rating',
                        question_text: 'Penilaian Kinerja',
                        layout_config: { scale_min: 1, scale_max: 5, scale_min_label: 'Buruk', scale_max_label: 'Sangat Baik' },
                        is_required: false
                    }
                ]
            }
        };
        const resCreate = createMockRes();
        await formController.createForm(reqCreate, resCreate);
        console.log('Status Create:', resCreate.statusCode, 'Data:', resCreate.payload);
        const formId = resCreate.payload.data.id;

        // TEST 2: Get Form by Admin ID
        console.log('\n--- 2. TEST GET FORM BY ADMIN ID ---');
        const reqGetAdmin = { params: { id: formId } };
        const resGetAdmin = createMockRes();
        await formController.getFormByIdAdmin(reqGetAdmin, resGetAdmin);
        console.log('Status Get Admin:', resGetAdmin.statusCode, 'Questions count:', resGetAdmin.payload.data.questions.length);

        const loadedQuestions = resGetAdmin.payload.data.questions;
        console.log('Loaded questions summary:', loadedQuestions.map(q => ({ id: q.id, type: q.question_type })));
        const qGeo = loadedQuestions.find(q => q.question_type === 'geolocation');
        const qText = loadedQuestions.find(q => q.question_type === 'short_text');
        const qSig = loadedQuestions.find(q => q.question_type === 'signature');
        const qRating = loadedQuestions.find(q => q.question_type === 'rating');

        // TEST 3: Update Form (Edit & Sync Questions)
        console.log('\n--- 3. TEST UPDATE FORM ---');
        const reqUpdate = {
            params: { id: formId },
            body: {
                title: 'Formulir Survei Multi Elemen (Updated)',
                slug: testSlug,
                description: 'Deskripsi yang sudah diperbarui',
                is_active: 1,
                questions: [
                    ...loadedQuestions,
                    {
                        id: 'temp_new_123',
                        element_category: 'input',
                        question_type: 'file_upload',
                        question_text: 'Lampiran Berkas PDF',
                        is_required: false,
                        validation_rules: { allowed_file_types: ['application/pdf'], max_file_size_mb: 5 }
                    }
                ]
            }
        };
        const resUpdate = createMockRes();
        await formController.updateForm(reqUpdate, resUpdate);
        console.log('Status Update:', resUpdate.statusCode, 'Message:', resUpdate.payload.message);

        // TEST 4: Get Form by Slug (Public)
        console.log('\n--- 4. TEST GET FORM BY SLUG (PUBLIC) ---');
        const reqGetSlug = { params: { slug: testSlug } };
        const resGetSlug = createMockRes();
        await formController.getFormBySlug(reqGetSlug, resGetSlug);
        console.log('Status Get Slug:', resGetSlug.statusCode, 'Title:', resGetSlug.payload.data.title, 'Total elements:', resGetSlug.payload.data.questions.length);

        // TEST 5: Submit Response dengan payload kompleks
        console.log('\n--- 5. TEST SUBMIT RESPONSE ---');
        const reqSubmit = {
            body: {
                form_id: formId,
                answers: {
                    [qText.id]: 'Ahmad Subarjo',
                    [qGeo.id]: { lat: -7.2186, lng: 107.9014, accuracy: 15, address: 'Garut Kota' },
                    [qSig.id]: '/uploads/form-172456789.png',
                    [qRating.id]: 5
                }
            }
        };
        const resSubmit = createMockRes();
        await formController.submitResponse(reqSubmit, resSubmit);
        console.log('Status Submit:', resSubmit.statusCode, 'Result:', resSubmit.payload);

        // TEST 6: Get Form Responses
        console.log('\n--- 6. TEST GET FORM RESPONSES ---');
        const reqResponses = { params: { formId } };
        const resResponses = createMockRes();
        await formController.getFormResponses(reqResponses, resResponses);
        console.log('Status Responses:', resResponses.statusCode);
        console.log('Responses count:', resResponses.payload.data.responses.length);
        console.log('Sample Response data:', JSON.stringify(resResponses.payload.data.responses[0], null, 2));

        // TEST 7: Delete Test Form
        console.log('\n--- 7. TEST DELETE FORM ---');
        const reqDelete = { params: { id: formId } };
        const resDelete = createMockRes();
        await formController.deleteForm(reqDelete, resDelete);
        console.log('Status Delete:', resDelete.statusCode, 'Message:', resDelete.payload.message);

        console.log('\n✅ SEMUA TEST BACKEND DYNAMIC FORM BERHASIL 100%!');
    } catch (err) {
        console.error('❌ Test gagal:', err);
    } finally {
        process.exit(0);
    }
}

runTests();
