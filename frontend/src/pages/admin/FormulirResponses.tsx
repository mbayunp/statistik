import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Users, FileSpreadsheet, Loader2, Inbox, Calendar,
  ExternalLink, MapPin, Star, FileText, Image as ImageIcon, X,
  Download, ZoomIn
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Question {
  id: string | number;
  question_text: string;
  question_type: string;
  element_category?: string;
}

interface ResponseData {
  response_id: string;
  submitted_at: string;
  answers: Record<string, unknown>;
}

// Helper sanitasi URL gambar / media
const formatMediaSource = (value: unknown): string => {
  if (!value || typeof value !== 'string') return '';

  const str = value.trim();

  // 1. Format Data URL (Base64 dengan prefix data:image/)
  if (str.startsWith('data:image/') || str.startsWith('data:application/')) {
    return str;
  }

  // 2. Raw Base64 string tanpa header data: (PNG/JPEG signatures)
  if (
    str.startsWith('iVBORw0KGgo') ||
    str.startsWith('/9j/') ||
    str.startsWith('R0lGOD') ||
    (str.length > 100 && !str.includes('/') && !str.includes(' ') && !str.includes(':'))
  ) {
    return `data:image/png;base64,${str}`;
  }

  // 3. Absolute URL (http:// atau https://)
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  // 4. Relative Path (/uploads/...)
  if (str.startsWith('/uploads/') || str.startsWith('uploads/')) {
    const cleanPath = str.startsWith('/') ? str : `/${str}`;
    const base = API_BASE_URL ? API_BASE_URL.replace(/\/+$/, '') : '';
    return `${base}${cleanPath}`;
  }

  return str;
};

const FormulirResponses: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/formulir/responses/${formId}`);
      if (res.data.success) {
        setFormTitle(res.data.data.form?.title || '');
        // Filter: Hanya tampilkan pertanyaan bertipe 'input' (bukan blok layout)
        const allQuestions: Question[] = res.data.data.questions || [];
        const inputQuestions = allQuestions.filter(
          (q) => q.element_category !== 'layout' && !['section_header', 'banner_media', 'paragraph_text', 'divider'].includes(q.question_type)
        );
        setQuestions(inputQuestions);
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

  // Fungsi Export Excel Dinamis & Cerdas
  const handleExportExcel = () => {
    if (responses.length === 0) {
      return Swal.fire('Peringatan', 'Tidak ada data respon untuk diekspor!', 'warning');
    }

    const excelData = responses.map((resp, index) => {
      const rowData: Record<string, string | number> = {
        No: index + 1,
        'Waktu Masuk': new Date(resp.submitted_at).toLocaleString('id-ID')
      };

      questions.forEach((q) => {
        const val = resp.answers[q.id];
        if (val === undefined || val === null) {
          rowData[q.question_text] = '-';
        } else if (typeof val === 'object' && val !== null && 'lat' in val && 'lng' in val) {
          const geo = val as { lat: number; lng: number };
          rowData[q.question_text] = `${geo.lat}, ${geo.lng} (Maps: https://www.google.com/maps?q=${geo.lat},${geo.lng})`;
        } else if (typeof val === 'object') {
          rowData[q.question_text] = JSON.stringify(val);
        } else if (typeof val === 'string' && (val.startsWith('/uploads/') || val.startsWith('uploads/'))) {
          rowData[q.question_text] = formatMediaSource(val);
        } else {
          rowData[q.question_text] = String(val);
        }
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Respon Formulir');
    const safeTitle = (formTitle || `Form_${formId}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Rekap_Respon_${safeTitle}.xlsx`);
  };

  // Helper Renderer Sel Jawaban Cerdas
  const renderAnswerCell = (q: Question, rawVal: unknown) => {
    if (rawVal === undefined || rawVal === null || rawVal === '') {
      return <span className="text-slate-300 italic text-xs">Kosong</span>;
    }

    let val = rawVal;
    if (typeof rawVal === 'string' && (rawVal.startsWith('{') || rawVal.startsWith('['))) {
      try {
        val = JSON.parse(rawVal);
      } catch {
        val = rawVal;
      }
    }

    // 1. Geolocation Object
    const isGeoObj = typeof val === 'object' && val !== null && 'lat' in val && 'lng' in val;
    if (q.question_type === 'geolocation' || isGeoObj) {
      const geo = val as { lat: number; lng: number };
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200">
            <MapPin size={12} className="text-blue-500" /> {geo.lat}, {geo.lng}
          </span>
          <a
            href={`https://www.google.com/maps?q=${geo.lat},${geo.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            title="Buka Peta"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    // 2. Media Gambar / Tanda Tangan Digital / Snapshot Kamera
    const isSignatureOrCamera = ['signature', 'camera_capture'].includes(q.question_type);
    const isImageString =
      typeof val === 'string' &&
      (val.startsWith('data:image/') ||
        val.startsWith('iVBORw0KGgo') ||
        val.startsWith('/9j/') ||
        val.includes('/uploads/') ||
        val.endsWith('.png') ||
        val.endsWith('.jpg') ||
        val.endsWith('.jpeg') ||
        val.endsWith('.webp'));

    if (isSignatureOrCamera || isImageString) {
      const mediaSrc = formatMediaSource(val);

      if (!mediaSrc) {
        return <span className="text-slate-300 italic text-xs">Kosong</span>;
      }

      return (
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setPreviewImage(mediaSrc)}
            className="h-12 w-24 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden cursor-pointer hover:border-brand-primary hover:shadow-sm transition-all flex items-center justify-center p-1 group bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[8px_8px]"
            title="Klik untuk memperbesar"
          >
            <img
              src={mediaSrc}
              alt={q.question_text || 'Media'}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <button
            type="button"
            onClick={() => setPreviewImage(mediaSrc)}
            className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200"
          >
            <ZoomIn size={13} className="text-brand-primary" /> Lihat
          </button>
        </div>
      );
    }

    // 3. File Upload / Dokumen (PDF, Word, Excel, ZIP)
    if (
      q.question_type === 'file_upload' ||
      (typeof val === 'string' &&
        (val.includes('/uploads/') || val.endsWith('.pdf') || val.endsWith('.docx') || val.endsWith('.xlsx') || val.endsWith('.zip')))
    ) {
      const fileUrl = formatMediaSource(val);
      const fileName = (typeof val === 'string' ? val.split('/').pop() : '') || 'Dokumen Lampiran';
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-cyan-200 hover:bg-cyan-100 transition-colors"
        >
          <FileText size={14} className="text-cyan-600" />
          <span className="truncate max-w-37.5">{fileName}</span>
          <Download size={12} />
        </a>
      );
    }

    // 4. Rating Bintang
    if (q.question_type === 'rating') {
      const ratingNum = Number(val) || 0;
      return (
        <div className="flex items-center gap-1 text-amber-400">
          <span className="font-black text-slate-800 mr-1 text-xs">{ratingNum}</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < ratingNum ? 'fill-amber-400' : 'text-slate-200'} />
          ))}
        </div>
      );
    }

    // 5. Tautan URL
    if (q.question_type === 'url' && typeof val === 'string' && val.startsWith('http')) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:underline font-bold text-xs flex items-center gap-1"
        >
          {val} <ExternalLink size={12} />
        </a>
      );
    }

    // 6. Text Biasa / Array Checkbox
    return (
      <span className="whitespace-pre-line leading-relaxed text-slate-700 font-medium">
        {Array.isArray(val) ? val.join(', ') : String(val)}
      </span>
    );
  };

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/formulir')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-primary uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar
          </button>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Users size={36} className="text-brand-secondary" /> Hasil Respon Formulir
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Melihat rekap data masuk untuk <span className="font-bold text-slate-800">"{formTitle || `Formulir #${formId}`}"</span>
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-xl transition-all active:scale-95 shrink-0"
        >
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
                  {questions.map((q) => (
                    <th key={q.id} className="p-6 min-w-50">{q.question_text}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
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
                    {questions.map((q) => (
                      <td key={q.id} className="p-6">
                        {renderAnswerCell(q, resp.answers[q.id])}
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

      {/* Modal Preview Gambar / Tanda Tangan Digital */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl max-w-xl w-full shadow-2xl relative border border-slate-100">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-primary" /> Preview Berkas / Tanda Tangan Digital
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 max-h-[70vh] flex items-center justify-center p-4 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[12px_12px]">
              <img src={previewImage} alt="Preview Media" className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-primary hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-brand-primary/20"
              >
                Buka Ukuran Penuh <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormulirResponses;