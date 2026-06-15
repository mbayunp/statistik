import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Question {
  id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';
  options: string[];
  is_required: boolean;
}

interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

const PublicForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk menyimpan jawaban responden
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STATE BARU UNTUK HALAMAN SUKSES
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/formulir/${slug}`);
        if (res.data.success) {
          setForm(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Formulir tidak ditemukan atau sudah tidak aktif.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  // Handle perubahan input
  const handleChange = (questionId: string, value: string | string[], isCheckbox = false) => {
    if (isCheckbox) {
      const currentVals = (answers[questionId] || []) as string[];
      const newVals = currentVals.includes(value as string)
        ? currentVals.filter((v: string) => v !== value)
        : [...currentVals, value as string];
      setAnswers({ ...answers, [questionId]: newVals });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        form_id: form.id,
        answers: answers
      };

      const res = await axios.post(`${API_BASE_URL}/api/formulir/submit`, payload);
      
      if (res.data.success) {
        // Alih-alih reload, kita ubah state menjadi sukses
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim jawaban', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. TAMPILAN LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  // 2. TAMPILAN ERROR (TIDAK DITEMUKAN)
  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="text-slate-300 mb-4" size={64} />
        <h1 className="text-2xl font-black text-slate-800 mb-2">Oops!</h1>
        <p className="text-slate-500 font-medium">{error}</p>
      </div>
    );
  }

  // 3. TAMPILAN SUKSES (UCAPAN TERIMA KASIH)
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-2xl w-full border-t-16 border-t-emerald-500 animate-in zoom-in-95 duration-500">
          <CheckCircle2 size={72} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-800 mb-4">Terima Kasih!</h1>
          <p className="text-slate-600 font-medium mb-8 text-lg">
            Tanggapan Anda untuk formulir <span className="font-bold text-slate-800">"{form.title}"</span> telah berhasil direkam oleh sistem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                setAnswers({});
                setIsSuccess(false);
              }} 
              className="text-brand-primary font-bold hover:underline transition-all"
            >
              Kirim tanggapan lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. TAMPILAN UTAMA (FORMULIR PENGISIAN)
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex justify-center text-left">
      <div className="max-w-3xl w-full">
        
        {/* Form Header */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border-t-16 border-t-brand-primary mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight leading-snug">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
              {form.description}
            </p>
          )}
          <hr className="mt-8 border-slate-100" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">
            * Menunjukkan pertanyaan yang wajib diisi
          </p>
        </div>

        {/* Form Questions */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((q) => (
            <div key={q.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug">
                {q.question_text} {q.is_required && <span className="text-red-500 ml-1">*</span>}
              </h3>

              <div className="space-y-3">
                {/* Teks Singkat */}
                {q.question_type === 'text' && (
                  <input
                    type="text"
                    required={q.is_required}
                    className="w-full sm:w-2/3 border-b border-slate-300 outline-none focus:border-brand-primary py-2 transition-colors font-medium text-slate-700 bg-transparent"
                    placeholder="Jawaban Anda"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}

                {/* Teks Panjang (Textarea) */}
                {q.question_type === 'textarea' && (
                  <textarea
                    required={q.is_required}
                    rows={4}
                    className="w-full border border-slate-300 rounded-xl outline-none focus:border-brand-primary p-4 transition-colors font-medium text-slate-700 bg-slate-50 resize-none"
                    placeholder="Jawaban Anda"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}

                {/* Pilihan Ganda (Radio) */}
                {q.question_type === 'radio' && q.options.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={opt}
                      required={q.is_required && !answers[q.id]}
                      className="w-5 h-5 text-brand-primary border-slate-300 focus:ring-brand-primary cursor-pointer"
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <span className="font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{opt}</span>
                  </label>
                ))}

                {/* Kotak Centang (Checkbox) */}
                {q.question_type === 'checkbox' && q.options.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <input
                      type="checkbox"
                      value={opt}
                      className="w-5 h-5 text-brand-primary rounded border-slate-300 focus:ring-brand-primary cursor-pointer"
                      checked={(answers[q.id] || []).includes(opt)}
                      onChange={(e) => handleChange(q.id, e.target.value, true)}
                    />
                    <span className="font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{opt}</span>
                  </label>
                ))}

                {/* Dropdown (Select) */}
                {q.question_type === 'select' && (
                  <select
                    required={q.is_required}
                    className="w-full sm:w-2/3 p-4 rounded-xl border border-slate-300 bg-slate-50 outline-none focus:border-brand-primary font-medium text-slate-700 cursor-pointer"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="">Pilih jawaban...</option>
                    {q.options.map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-4 pb-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-brand-primary transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Mengirim...</> : <><CheckCircle2 size={18} /> Kirim Jawaban</>}
            </button>
            <p className="text-[10px] font-bold text-slate-400">Garut Satu Data</p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PublicForm;