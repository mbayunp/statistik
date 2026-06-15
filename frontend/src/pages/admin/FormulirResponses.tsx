import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ArrowLeft, Users, FileSpreadsheet, Loader2, Inbox, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Question {
  id: string;
  question_text: string;
}

interface ResponseData {
  response_id: string;
  submitted_at: string;
  answers: Record<string, string>;
}

const FormulirResponses: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseData[]>([]);

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/formulir/responses/${formId}`);
      if (res.data.success) {
        setQuestions(res.data.data.questions || []);
        setResponses(res.data.data.responses || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat respon formulir', 'error');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  // Fungsi Export Excel Dinamis
  const handleExportExcel = () => {
    if (responses.length === 0) return Swal.fire('Peringatan', 'Tidak ada data untuk diekspor!', 'warning');

    const excelData = responses.map((resp, index) => {
      const rowData: Record<string, string | number> = {
        'No': index + 1,
        'Waktu Pengisian': new Date(resp.submitted_at).toLocaleString('id-ID'),
      };
      
      // Ambil nilai jawaban untuk setiap pertanyaan secara dinamis
      questions.forEach((q) => {
        rowData[q.question_text] = resp.answers[q.id] || '-';
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Respon Formulir");
    XLSX.writeFile(workbook, `Rekap_Respon_Formulir_${formId}.xlsx`);
  };

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <button onClick={() => navigate('/admin/formulir')} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-primary uppercase tracking-widest mb-3 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Daftar
          </button>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Users size={36} className="text-brand-secondary" /> Hasil Respon Formulir
          </h1>
          <p className="text-slate-500 font-medium mt-1">Melihat ringkasan data masuk dari responden.</p>
        </div>
        
        <button onClick={handleExportExcel} className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-xl transition-all">
          <FileSpreadsheet size={20} /> Export Excel
        </button>
      </div>

      {/* Tabel Hasil Respon */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
              <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat Hasil Respon...</p>
            </div>
          ) : responses.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="p-6 text-center w-16 bg-slate-50 sticky left-0">No</th>
                  <th className="p-6 w-48">Waktu Masuk</th>
                  {/* Render Judul Pertanyaan sebagai Header Tabel */}
                  {questions.map((q) => (
                    <th key={q.id} className="p-6 min-w-[200px]">{q.question_text}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm text-slate-700">
                {responses.map((resp, index) => (
                  <tr key={resp.response_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 text-center font-bold text-slate-400 bg-white group-hover:bg-slate-50/80 sticky left-0">
                      {index + 1}
                    </td>
                    <td className="p-6 text-xs text-slate-500 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-brand-primary" />
                        {new Date(resp.submitted_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    {/* Render Jawaban Responden Berdasarkan ID Pertanyaan */}
                    {questions.map((q) => (
                      <td key={q.id} className="p-6 whitespace-pre-line leading-relaxed text-slate-600">
                        {resp.answers[q.id] || <span className="text-slate-300 italic text-xs">Kosong</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Belum ada respon masuk untuk formulir ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulirResponses;