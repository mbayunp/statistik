import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, Trash2, Save, GripHorizontal, Type, CheckSquare, CircleDot, AlignLeft, X } from 'lucide-react';import { API_BASE_URL } from '../../config';

interface Question {
  id: string; // ID sementara untuk UI
  question_text: string;
  question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  options: string[];
  is_required: boolean;
}

const FormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // State Utama Formulir
  const [title, setTitle] = useState('Formulir Tanpa Judul');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', question_text: 'Pertanyaan Tanpa Judul', question_type: 'radio', options: ['Opsi 1'], is_required: false }
  ]);

  // Fungsi Tambah Pertanyaan
  const addQuestion = () => {
    const newQ: Question = {
      id: `q${Date.now()}`,
      question_text: '',
      question_type: 'radio',
      options: ['Opsi 1'],
      is_required: false
    };
    setQuestions([...questions, newQ]);
  };

  // Fungsi Hapus Pertanyaan
  const removeQuestion = (id: string) => {
    if (questions.length === 1) return Swal.fire('Oops', 'Minimal harus ada 1 pertanyaan', 'warning');
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Fungsi Update Data Pertanyaan
  const updateQuestion = (id: string, field: keyof Question, value: string | string[] | boolean) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  // Fungsi Kelola Opsi (Untuk Radio/Checkbox/Select)
  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, `Opsi ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, optIndex: number, newValue: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOpts = [...q.options];
        newOpts[optIndex] = newValue;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const removeOption = (qId: string, optIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        if (q.options.length === 1) return q; // Minimal 1 opsi
        const newOpts = q.options.filter((_, i) => i !== optIndex);
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  // Fungsi Simpan ke Database
  const handleSaveForm = async () => {
    if (!title.trim()) return Swal.fire('Validasi', 'Judul formulir tidak boleh kosong', 'warning');
    
    // Auto-generate slug dari judul (Contoh: "Survei Pegawai" -> "survei-pegawai-168123456")
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    setIsLoading(true);
    try {
      const payload = { title, description, slug, questions };
      await axios.post(`${API_BASE_URL}/api/formulir`, payload);
      
      Swal.fire('Berhasil!', 'Formulir berhasil disimpan dan siap dibagikan.', 'success').then(() => {
        navigate('/formulir');
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Gagal', 'Gagal menyimpan formulir', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Ikon Tipe
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'text': return <Type size={16} />;
      case 'textarea': return <AlignLeft size={16} />;
      case 'radio': return <CircleDot size={16} />;
      case 'checkbox': return <CheckSquare size={16} />;
      default: return <CircleDot size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 text-left">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/formulir')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="text-slate-600" />
          </button>
          <h1 className="font-black text-slate-800 text-lg truncate max-w-[200px] sm:max-w-md">{title || 'Formulir Baru'}</h1>
        </div>
        <button 
          onClick={handleSaveForm} 
          disabled={isLoading}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={18} /> Simpan Formulir</>}
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto mt-8 px-4 flex flex-col gap-6 relative">
        
        {/* Header Form */}
        <div className="bg-white p-8 rounded-3xl border-t-12 border-t-brand-primary shadow-sm">
          <input 
            type="text" 
            placeholder="Judul Formulir" 
            className="w-full text-3xl font-black text-slate-800 border-none outline-none focus:ring-0 mb-4 placeholder:text-slate-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            placeholder="Deskripsi formulir (opsional)" 
            className="w-full text-slate-600 border-none outline-none focus:ring-0 resize-none placeholder:text-slate-400"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Daftar Pertanyaan */}
        {questions.map((q) => (
          <div key={q.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 group focus-within:border-l-[6px] focus-within:border-l-blue-500 transition-all">
            
            {/* Drag Handle (Visual only for now) */}
            <div className="flex justify-center mb-4 opacity-20 hover:opacity-100 cursor-grab">
              <GripHorizontal size={24} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input 
                type="text" 
                placeholder="Pertanyaan" 
                className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none focus:border-brand-primary font-bold text-slate-800"
                value={q.question_text}
                onChange={(e) => updateQuestion(q.id, 'question_text', e.target.value)}
              />
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2 sm:w-48 shrink-0">
                <span className="text-slate-500 ml-2">{getTypeIcon(q.question_type)}</span>
                <select 
                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 cursor-pointer"
                  value={q.question_type}
                  onChange={(e) => updateQuestion(q.id, 'question_type', e.target.value)}
                >
                  <option value="text">Jawaban Singkat</option>
                  <option value="textarea">Paragraf</option>
                  <option value="radio">Pilihan Ganda</option>
                  <option value="checkbox">Kotak Centang</option>
                </select>
              </div>
            </div>

            {/* Area Opsi Jawaban */}
            {['radio', 'checkbox', 'select'].includes(q.question_type) && (
              <div className="flex flex-col gap-3 pl-2 sm:pl-4 mb-6">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <span className="text-slate-300">
                      {q.question_type === 'radio' ? <CircleDot size={20} /> : <CheckSquare size={20} />}
                    </span>
                    <input 
                      type="text" 
                      className="flex-1 border-b border-transparent focus:border-slate-300 outline-none py-1 transition-colors"
                      value={opt}
                      onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                    />
                    <button onClick={() => removeOption(q.id, optIndex)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-slate-300">{q.question_type === 'radio' ? <CircleDot size={20} /> : <CheckSquare size={20} />}</span>
                  <button onClick={() => addOption(q.id)} className="text-sm font-bold text-slate-400 hover:text-brand-primary hover:bg-slate-50 px-3 py-1 rounded-lg transition-colors">
                    Tambahkan opsi
                  </button>
                </div>
              </div>
            )}

            {/* Tampilan untuk Teks Singkat/Paragraf */}
            {['text', 'textarea'].includes(q.question_type) && (
              <div className="mb-6 pl-4">
                <div className="w-1/2 border-b border-slate-200 border-dashed pb-2 text-sm text-slate-400 italic">
                  Teks jawaban {q.question_type === 'text' ? 'singkat' : 'panjang'}
                </div>
              </div>
            )}

            <hr className="border-slate-100 my-4" />

            {/* Footer Pertanyaan (Required & Delete) */}
            <div className="flex justify-end items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-bold text-slate-600">Wajib diisi</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${q.is_required ? 'bg-brand-primary' : 'bg-slate-300'}`}>
                  <input type="checkbox" className="hidden" checked={q.is_required} onChange={(e) => updateQuestion(q.id, 'is_required', e.target.checked)} />
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${q.is_required ? 'right-1' : 'left-1'}`}></div>
                </div>
              </label>
              <div className="w-px h-6 bg-slate-200"></div>
              <button onClick={() => removeQuestion(q.id)} className="text-slate-400 hover:bg-red-50 hover:text-red-500 p-2 rounded-xl transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button 
          onClick={addQuestion}
          className="bg-brand-dark text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
          title="Tambah Pertanyaan"
        >
          <Plus size={28} />
        </button>
      </div>

    </div>
  );
};

export default FormBuilder;