import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  TextRun,
  PageOrientation,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import {
  ArrowLeft, Users, FileSpreadsheet, Loader2, Inbox, Calendar,
  ExternalLink, MapPin, Star, FileText, Image as ImageIcon, X,
  Download, ZoomIn, Trash2, CheckSquare, Square, BarChart3,
  PieChart as PieChartIcon, Table as TableIcon, Search,
  TrendingUp, AlertCircle, RefreshCw,
  CheckCircle2, Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { API_BASE_URL } from '../../config';

interface Question {
  id: string | number;
  question_text: string;
  question_type: string;
  element_category?: string;
  options?: string[];
  description?: string;
}

interface ResponseData {
  response_id: string;
  submitted_at: string;
  answers: Record<string, unknown>;
}

// Palet warna modern untuk chart
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#84cc16',
  '#a855f7', '#e11d48', '#0ea5e9', '#d97706', '#64748b'
];

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

// Helper mengambil Buffer gambar untuk Word (.docx)
const fetchImageBuffer = async (urlOrBase64: unknown): Promise<Uint8Array | null> => {
  try {
    if (!urlOrBase64 || typeof urlOrBase64 !== 'string') return null;
    const str = urlOrBase64.trim();
    if (!str) return null;

    // 1. Data URL Base64 (data:image/...)
    if (str.startsWith('data:image/') || str.startsWith('data:application/')) {
      const parts = str.split(',');
      if (parts.length < 2) return null;
      const base64Data = parts[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    // 2. Raw Base64 string tanpa header data:
    if (
      str.startsWith('iVBORw0KGgo') ||
      str.startsWith('/9j/') ||
      str.startsWith('R0lGOD') ||
      (str.length > 100 && !str.includes('/') && !str.includes(' ') && !str.includes(':'))
    ) {
      const binaryString = window.atob(str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    // 3. Absolute atau Relative URL (/uploads/...)
    const fullUrl = formatMediaSource(str);
    if (!fullUrl) return null;

    const response = await fetch(fullUrl);
    if (!response.ok) {
      console.warn(`Gagal fetch gambar Word (status: ${response.status}):`, fullUrl);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.error('Gagal memuat buffer gambar untuk Word:', err);
    return null;
  }
};

const getImageType = (val: unknown): 'png' | 'jpg' | 'gif' => {
  if (typeof val === 'string') {
    const lower = val.toLowerCase();
    if (lower.includes('data:image/jpeg') || lower.includes('data:image/jpg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return 'jpg';
    }
    if (lower.includes('data:image/gif') || lower.endsWith('.gif')) {
      return 'gif';
    }
  }
  return 'png';
};

const FormulirResponses: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chartTypeMap, setChartTypeMap] = useState<Record<string, 'bar' | 'pie'>>({});

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/formulir/responses/${formId}`);
      if (res.data.success) {
        setFormTitle(res.data.data.form?.title || '');
        setFormSlug(res.data.data.form?.slug || '');
        setFormDescription(res.data.data.form?.description || '');
        // Filter: Hanya tampilkan pertanyaan bertipe 'input' (bukan blok layout)
        const allQuestions: Question[] = res.data.data.questions || [];
        const inputQuestions = allQuestions.filter(
          (q) => q.element_category !== 'layout' && !['section_header', 'banner_media', 'paragraph_text', 'divider'].includes(q.question_type)
        );
        setQuestions(inputQuestions);
        setResponses(res.data.data.responses || []);
        setSelectedIds([]);
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

  // ==========================================
  // LOGIKA HAPUS RESPON FORMULIR (SATUAN & MASSAL)
  // ==========================================

  // Hapus Satu Respon
  const handleDeleteSingle = async (responseId: string, indexNumber: number) => {
    const result = await Swal.fire({
      title: `Hapus Respon #${indexNumber}?`,
      text: 'Respon ini beserta seluruh data jawabannya akan dihapus secara permanen dari basis data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus Respon!',
      cancelButtonText: 'Batal',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Menghapus...',
          text: 'Sedang menghapus data respon formulir',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const res = await axios.delete(`${API_BASE_URL}/api/formulir/responses/${responseId}`);
        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: 'Data respon telah berhasil dihapus.',
            timer: 1500,
            showConfirmButton: false
          });
          // Update data lokal langsung & refresh
          setResponses((prev) => prev.filter((r) => r.response_id !== responseId));
          setSelectedIds((prev) => prev.filter((id) => id !== responseId));
        }
      } catch (err) {
        console.error('Gagal hapus respon:', err);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus respon formulir', 'error');
      }
    }
  };

  // Hapus Beberapa Respon Terpilih (Bulk Delete)
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Hapus ${selectedIds.length} Respon Terpilih?`,
      text: `Semua (${selectedIds.length}) baris data yang dicentang akan dihapus permanen. Aksi ini tidak dapat dibatalkan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Ya, Hapus ${selectedIds.length} Data!`,
      cancelButtonText: 'Batal',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Menghapus Data...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const res = await axios.post(`${API_BASE_URL}/api/formulir/responses/bulk-delete`, {
          response_ids: selectedIds
        });

        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus!',
            text: `${selectedIds.length} data respon berhasil dihapus.`,
            timer: 1500,
            showConfirmButton: false
          });
          setResponses((prev) => prev.filter((r) => !selectedIds.includes(r.response_id)));
          setSelectedIds([]);
        }
      } catch (err) {
        console.error('Gagal hapus bulk:', err);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus beberapa data respon', 'error');
      }
    }
  };

  // Hapus Seluruh Respon Formulir (Reset / Clear All)
  const handleDeleteAll = async () => {
    if (responses.length === 0) return;

    const result = await Swal.fire({
      title: 'Kosongkan Semua Respon?',
      html: `
        <div class="text-left text-sm text-slate-600">
          <p class="mb-2">Anda akan menghapus <b>seluruh data masuk (${responses.length} responden)</b> untuk formulir ini.</p>
          <p class="text-rose-600 font-bold">⚠️ Perhatian: Aksi ini akan mereset semua jawaban dan tidak dapat dipulihkan kembali!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Kosongkan Semua!',
      cancelButtonText: 'Batal',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Mengosongkan Respon...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const res = await axios.delete(`${API_BASE_URL}/api/formulir/responses/form/${formId}/all`);
        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Respon Dikosongkan!',
            text: 'Seluruh data respon formulir telah berhasil dikosongkan.',
            timer: 1500,
            showConfirmButton: false
          });
          setResponses([]);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error('Gagal kosongkan respon:', err);
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengosongkan respon formulir', 'error');
      }
    }
  };

  // Toggle Seleksi Checkbox
  const toggleSelectRow = (responseId: string) => {
    setSelectedIds((prev) =>
      prev.includes(responseId) ? prev.filter((id) => id !== responseId) : [...prev, responseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredResponses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResponses.map((r) => r.response_id));
    }
  };

  // ==========================================
  // PENCARIAN & FILTER TABEL
  // ==========================================
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) return responses;
    const term = searchTerm.toLowerCase();

    return responses.filter((resp) => {
      // 1. Cek tanggal
      const dateStr = new Date(resp.submitted_at).toLocaleString('id-ID').toLowerCase();
      if (dateStr.includes(term)) return true;

      // 2. Cek semua jawaban
      return Object.values(resp.answers).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(term);
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [responses, searchTerm]);

  // ==========================================
  // STATISTIK & VISUALISASI GRAFIK
  // ==========================================

  // 1. Tren Respon Berdasarkan Waktu Masuk (AreaChart)
  const timelineData = useMemo(() => {
    if (responses.length === 0) return [];

    const dateCounts: Record<string, number> = {};
    const sortedResponses = [...responses].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );

    sortedResponses.forEach((resp) => {
      const dateKey = new Date(resp.submitted_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(dateCounts).map(([date, count]) => {
      cumulative += count;
      return {
        date,
        Respon: count,
        Akumulasi: cumulative
      };
    });
  }, [responses]);

  // 2. Ringkasan KPI
  const kpiStats = useMemo(() => {
    const total = responses.length;
    if (total === 0) {
      return {
        total: 0,
        latestDate: '-',
        firstDate: '-',
        completionRate: 0,
        todayCount: 0
      };
    }

    const sortedByDate = [...responses].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    const latestDate = new Date(sortedByDate[0].submitted_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const firstDate = new Date(sortedByDate[sortedByDate.length - 1].submitted_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Respon hari ini
    const todayStr = new Date().toDateString();
    const todayCount = responses.filter(
      (r) => new Date(r.submitted_at).toDateString() === todayStr
    ).length;

    // Tingkat kelengkapan
    let totalFilledFields = 0;
    const totalPossibleFields = total * (questions.length || 1);
    responses.forEach((resp) => {
      questions.forEach((q) => {
        const val = resp.answers[q.id];
        if (val !== undefined && val !== null && val !== '') {
          totalFilledFields++;
        }
      });
    });
    const completionRate = Math.round((totalFilledFields / totalPossibleFields) * 100) || 0;

    return {
      total,
      latestDate,
      firstDate,
      completionRate,
      todayCount
    };
  }, [responses, questions]);

  // Helper kalkulasi data visualisasi per pertanyaan
  const getQuestionChartData = useCallback(
    (q: Question) => {
      const counts: Record<string, number> = {};
      let totalAnswers = 0;
      const textResponses: string[] = [];
      const numericValues: number[] = [];

      responses.forEach((resp) => {
        const rawVal = resp.answers[q.id];
        if (rawVal === undefined || rawVal === null || rawVal === '') return;

        totalAnswers++;

        // Array (e.g. Checkbox)
        if (Array.isArray(rawVal)) {
          rawVal.forEach((item) => {
            const key = String(item).trim();
            if (key) {
              counts[key] = (counts[key] || 0) + 1;
            }
          });
        } else if (typeof rawVal === 'object') {
          // Object (e.g. geolocation)
          const str = JSON.stringify(rawVal);
          counts[str] = (counts[str] || 0) + 1;
        } else {
          const strVal = String(rawVal).trim();
          if (strVal) {
            counts[strVal] = (counts[strVal] || 0) + 1;
            textResponses.push(strVal);

            const num = Number(strVal);
            if (!isNaN(num)) {
              numericValues.push(num);
            }
          }
        }
      });

      // Format array untuk Recharts
      const chartData = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        percentage: totalAnswers > 0 ? Math.round((value / totalAnswers) * 100) : 0
      }));

      // Sort descending
      chartData.sort((a, b) => b.value - a.value);

      // Jika pertanyaan tipe rating
      let ratingStats = null;
      if (q.question_type === 'rating') {
        const ratingSum = numericValues.reduce((acc, curr) => acc + curr, 0);
        const ratingAvg = numericValues.length > 0 ? (ratingSum / numericValues.length).toFixed(1) : '0';
        
        // Buat data bintang 1 sampai 5
        const starData = [5, 4, 3, 2, 1].map((star) => {
          const count = counts[String(star)] || 0;
          return {
            name: `${star} Bintang`,
            star,
            value: count,
            percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
          };
        });

        ratingStats = {
          average: ratingAvg,
          totalVotes: numericValues.length,
          starData
        };
      }

      // Jika pertanyaan tipe number
      let numberStats = null;
      if (q.question_type === 'number' && numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = (sum / numericValues.length).toFixed(2);
        
        // Median
        const sortedNums = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sortedNums.length / 2);
        const median = sortedNums.length % 2 !== 0 ? sortedNums[mid] : ((sortedNums[mid - 1] + sortedNums[mid]) / 2).toFixed(1);

        numberStats = {
          min,
          max,
          sum,
          avg,
          median,
          count: numericValues.length
        };
      }

      return {
        totalAnswers,
        emptyAnswers: responses.length - totalAnswers,
        chartData,
        textResponses,
        ratingStats,
        numberStats
      };
    },
    [responses]
  );

  // ==========================================
  // EXPORT EXCEL & WORD
  // ==========================================

  // Export Excel
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

  // Export Word (.docx)
  const handleExportWord = async () => {
    if (responses.length === 0) {
      return Swal.fire('Peringatan', 'Tidak ada data respon untuk diekspor!', 'warning');
    }

    Swal.fire({
      title: 'Membuat Dokumen Word...',
      html: `
        <div class="py-2 text-center">
          <p class="text-sm text-slate-600 mb-2 font-medium">Sedang memproses seluruh baris respon dan mengonversi media / tanda tangan digital.</p>
          <p class="text-xs text-slate-400">Mohon tunggu beberapa saat...</p>
        </div>
      `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const isLandscape = questions.length > 4;
      const exportTimeStr = new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      const documentHeaders = [
        new Paragraph({
          text: `REKAPITULASI RESPON FORMULIR: ${(formTitle || 'FORMULIR').toUpperCase()}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Waktu Export: ', bold: true, size: 20 }),
            new TextRun({ text: `${exportTimeStr}   |   `, size: 20 }),
            new TextRun({ text: 'Total Respon: ', bold: true, size: 20 }),
            new TextRun({ text: `${responses.length} Responden`, size: 20 })
          ]
        })
      ];

      if (formDescription) {
        documentHeaders.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: 'Deskripsi: ', bold: true, italics: true, size: 18, color: '64748B' }),
              new TextRun({ text: formDescription, italics: true, size: 18, color: '64748B' })
            ]
          })
        );
      } else {
        documentHeaders.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
      }

      const tableHeaderRow = new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            shading: { fill: '1E293B' },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF', size: 18 })]
              })
            ]
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: '1E293B' },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Waktu Submit', bold: true, color: 'FFFFFF', size: 18 })]
              })
            ]
          }),
          ...questions.map((q) => {
            return new TableCell({
              shading: { fill: '1E293B' },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: q.question_text || 'Pertanyaan', bold: true, color: 'FFFFFF', size: 18 })]
                })
              ]
            });
          })
        ]
      });

      const dataRows = await Promise.all(
        responses.map(async (resp, index) => {
          const rowCells: TableCell[] = [
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              shading: { fill: index % 2 === 1 ? 'F8FAFC' : 'FFFFFF' },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: String(index + 1), size: 18, color: '334155' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              shading: { fill: index % 2 === 1 ? 'F8FAFC' : 'FFFFFF' },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: new Date(resp.submitted_at).toLocaleString('id-ID'),
                      size: 18,
                      color: '475569'
                    })
                  ]
                })
              ]
            })
          ];

          for (const q of questions) {
            const rawVal = resp.answers[q.id];
            let val = rawVal;
            if (typeof rawVal === 'string' && (rawVal.startsWith('{') || rawVal.startsWith('['))) {
              try {
                val = JSON.parse(rawVal);
              } catch {
                val = rawVal;
              }
            }

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

            let cellParagraph: Paragraph;

            if (isSignatureOrCamera || isImageString) {
              const imageBuffer = await fetchImageBuffer(val);
              if (imageBuffer) {
                cellParagraph = new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: imageBuffer,
                      transformation: {
                        width: 100,
                        height: 50
                      },
                      type: getImageType(val)
                    })
                  ]
                });
              } else {
                cellParagraph = new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: isSignatureOrCamera ? '(Tanpa TTD)' : '(Tanpa Foto)',
                      italics: true,
                      size: 16,
                      color: '94A3B8'
                    })
                  ]
                });
              }
            } else if ((typeof val === 'object' && val !== null && 'lat' in val && 'lng' in val) || q.question_type === 'geolocation') {
              if (typeof val === 'object' && val !== null && 'lat' in val && 'lng' in val) {
                const geo = val as { lat: number; lng: number };
                cellParagraph = new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({ text: `Lat: ${geo.lat}, Lng: ${geo.lng}`, size: 18, color: '1E40AF', bold: true })
                  ]
                });
              } else {
                cellParagraph = new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: String(val || '-'), size: 18, color: '64748B' })]
                });
              }
            } else if (
              q.question_type === 'file_upload' ||
              (typeof val === 'string' &&
                (val.includes('/uploads/') || val.endsWith('.pdf') || val.endsWith('.docx') || val.endsWith('.xlsx') || val.endsWith('.zip')))
            ) {
              const fileUrl = formatMediaSource(val);
              const fileName = (typeof val === 'string' ? val.split('/').pop() : '') || 'Lampiran Berkas';
              cellParagraph = new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: `[Berkas] ${fileName}`, size: 18, color: '0369A1', bold: true }),
                  new TextRun({ text: `\n${fileUrl}`, size: 14, color: '64748B', italics: true })
                ]
              });
            } else if (q.question_type === 'rating') {
              const ratingNum = Number(val) || 0;
              cellParagraph = new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `⭐ ${ratingNum} / 5`, size: 18, color: 'D97706', bold: true })
                ]
              });
            } else if (val === undefined || val === null || val === '') {
              cellParagraph = new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '-', size: 18, color: '94A3B8' })]
              });
            } else {
              const textContent = Array.isArray(val)
                ? val.join(', ')
                : typeof val === 'object'
                ? JSON.stringify(val)
                : String(val);
              cellParagraph = new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: textContent, size: 18, color: '334155' })]
              });
            }

            rowCells.push(
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: index % 2 === 1 ? 'F8FAFC' : 'FFFFFF' },
                children: [cellParagraph]
              })
            );
          }

          return new TableRow({
            children: rowCells
          });
        })
      );

      const wordTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
        rows: [tableHeaderRow, ...dataRows]
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT
                },
                margin: {
                  top: 720,
                  bottom: 720,
                  left: 720,
                  right: 720
                }
              }
            },
            children: [...documentHeaders, wordTable]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const safeSlug = (formSlug || formTitle || `Form_${formId}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      saveAs(blob, `Rekap_Formulir_${safeSlug}_${Date.now()}.docx`);

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diekspor!',
        text: 'Dokumen Word (.docx) telah berhasil diunduh.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error export Word:', error);
      Swal.close();
      Swal.fire('Error', 'Gagal membuat dan mengekspor dokumen Word (.docx)', 'error');
    }
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
            className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 cursor-pointer"
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
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen text-left font-sans">
      
      {/* Header Utama */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/formulir')}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-primary uppercase tracking-widest mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Users size={36} className="text-brand-secondary" /> Hasil Respon Formulir
            </h1>
            <span className="bg-brand-primary/10 text-brand-primary font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              {responses.length} Responden
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1">
            Rekap dan visualisasi data masuk untuk <span className="font-bold text-slate-800">"{formTitle || `Formulir #${formId}`}"</span>
          </p>
        </div>

        {/* Tombol Export & Aksi Global */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={fetchResponses}
            className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-brand-primary transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {responses.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-95 cursor-pointer"
              title="Kosongkan seluruh respon formulir"
            >
              <Trash2 size={16} /> Kosongkan Semua
            </button>
          )}

          <button
            onClick={handleExportWord}
            className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
            title="Download Rekap Respon dalam Format Word (.docx)"
          >
            <FileText size={18} /> Export Word
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Download Rekap Respon dalam Format Excel (.xlsx)"
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Navigasi Tab (Tabel Data vs Visualisasi & Grafik) */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white text-slate-800 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon size={16} /> Tabel Respon ({responses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 size={16} /> Visualisasi & Grafik
          </button>
        </div>

        {/* Tab Table: Search Bar & Bulk Action */}
        {activeTab === 'table' && (
          <div className="flex items-center gap-3 flex-wrap">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-200">
                <span className="text-xs font-bold text-rose-700">
                  {selectedIds.length} data terpilih
                </span>
                <button
                  type="button"
                  onClick={handleDeleteBulk}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Trash2 size={13} /> Hapus Terpilih
                </button>
              </div>
            )}

            <div className="relative min-w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari respon / jawaban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Ringkasan Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Respon</p>
            <h3 className="text-2xl font-black text-slate-800">{kpiStats.total}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Masuk ke formulir</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Respon Hari Ini</p>
            <h3 className="text-2xl font-black text-slate-800">{kpiStats.todayCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Pengiriman baru</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelengkapan Data</p>
            <h3 className="text-2xl font-black text-slate-800">{kpiStats.completionRate}%</h3>
            <p className="text-[11px] text-slate-500 font-medium">Field terisi lengkap</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Respon Terakhir</p>
            <h3 className="text-xs font-black text-slate-800 truncate max-w-40">{kpiStats.latestDate}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Waktu submit terbaru</p>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA: TABEL vs GRAFIK */}
      {loading ? (
        <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center shadow-sm">
          <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
          <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat Hasil Respon...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center shadow-sm">
          <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="font-black text-slate-700 text-lg mb-1">Belum Ada Respon Masuk</h3>
          <p className="font-medium text-slate-400 text-xs max-w-md mx-auto">
            Bagikan link publik formulir ini untuk mulai menerima pengisian dan melihat visualisasi grafik.
          </p>
        </div>
      ) : activeTab === 'table' ? (
        /* ================= TAB 1: TABEL RESPON LENGKAP ================= */
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="p-6 text-center w-12 bg-slate-50 sticky left-0 z-20">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
                      title={selectedIds.length === filteredResponses.length ? 'Batalkan Semua' : 'Pilih Semua'}
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredResponses.length ? (
                        <CheckSquare size={18} className="text-brand-primary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="p-6 text-center w-16 bg-slate-50 sticky left-12 z-20">No</th>
                  <th className="p-6 w-48">Waktu Masuk</th>
                  {questions.map((q) => (
                    <th key={q.id} className="p-6 min-w-50">{q.question_text}</th>
                  ))}
                  <th className="p-6 text-center w-24 sticky right-0 bg-slate-50 z-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                {filteredResponses.length > 0 ? (
                  filteredResponses.map((resp, index) => {
                    const isSelected = selectedIds.includes(resp.response_id);
                    return (
                      <tr
                        key={resp.response_id}
                        className={`transition-colors group ${
                          isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox Sel */}
                        <td className="p-6 text-center bg-white group-hover:bg-slate-50/80 sticky left-0 z-10">
                          <button
                            type="button"
                            onClick={() => toggleSelectRow(resp.response_id)}
                            className="text-slate-300 group-hover:text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-brand-primary" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>

                        {/* Nomor Urut */}
                        <td className="p-6 text-center font-bold text-slate-400 bg-white group-hover:bg-slate-50/80 sticky left-12 z-10">
                          {index + 1}
                        </td>

                        {/* Waktu Masuk */}
                        <td className="p-6 text-xs text-slate-500 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-brand-primary" />
                            {new Date(resp.submitted_at).toLocaleString('id-ID')}
                          </div>
                        </td>

                        {/* Nilai Jawaban Dinamis */}
                        {questions.map((q) => (
                          <td key={q.id} className="p-6">
                            {renderAnswerCell(q, resp.answers[q.id])}
                          </td>
                        ))}

                        {/* Tombol Aksi Hapus */}
                        <td className="p-6 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 z-10">
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(resp.response_id, index + 1)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                            title="Hapus Respon Ini"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={questions.length + 4} className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                      Tidak ada data respon yang cocok dengan kata kunci "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: VISUALISASI GRAFIK & ANALISIS ================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Grafik 1: Tren Jumlah Respon Sepanjang Waktu */}
          {timelineData.length > 0 && (
            <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand-primary" /> Tren Waktu Pengiriman Respon
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Frekuensi respon masuk yang diterima berdasarkan tanggal</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Respon Harian
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Total Akumulasi
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRespon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAkumulasi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '1rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="Respon" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRespon)" />
                    <Area type="monotone" dataKey="Akumulasi" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorAkumulasi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Grid Visualisasi Per Pertanyaan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questions.map((q, qIndex) => {
              const qAnalysis = getQuestionChartData(q);
              const currentChartMode = chartTypeMap[String(q.id)] || 'bar';

              const isCategorical = ['radio', 'select', 'checkbox'].includes(q.question_type);
              const isRating = q.question_type === 'rating';
              const isNumber = q.question_type === 'number';
              const isDate = ['date', 'time'].includes(q.question_type);
              const isLocation = q.question_type === 'geolocation';
              const isFileOrMedia = ['file_upload', 'signature', 'camera_capture'].includes(q.question_type);

              return (
                <div
                  key={q.id}
                  className="bg-white p-6 lg:p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  {/* Header Kartu Pertanyaan */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2.5 py-1 rounded-lg inline-block mb-1.5">
                          Pertanyaan #{qIndex + 1} • {q.question_type.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base leading-snug">
                          {q.question_text || 'Pertanyaan Tanpa Judul'}
                        </h4>
                        {q.description && (
                          <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
                        )}
                      </div>

                      {/* Toggle Bar / Pie jika Categorical */}
                      {isCategorical && qAnalysis.chartData.length > 0 && (
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => setChartTypeMap((prev) => ({ ...prev, [String(q.id)]: 'bar' as const }))}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              currentChartMode === 'bar'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                            title="Tampilan Diagram Batang"
                          >
                            <BarChart3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartTypeMap((prev) => ({ ...prev, [String(q.id)]: 'pie' as const }))}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              currentChartMode === 'pie'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                            title="Tampilan Diagram Donat / Lingkaran"
                          >
                            <PieChartIcon size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Ringkasan Jawaban */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-5 border-b border-slate-100 pb-3">
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <CheckCircle2 size={13} /> {qAnalysis.totalAnswers} Terisi
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertCircle size={13} /> {qAnalysis.emptyAnswers} Kosong
                      </span>
                    </div>
                  </div>

                  {/* KONTEN CHART SESUAI TIPE */}
                  <div className="mt-auto">
                    {/* A. TIPE PILIHAN GANDA & CHECKBOX (Radio, Select, Checkbox) */}
                    {isCategorical && qAnalysis.chartData.length > 0 ? (
                      <div>
                        {currentChartMode === 'pie' ? (
                          <div className="h-60 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={qAnalysis.chartData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={4}
                                >
                                  {qAnalysis.chartData.map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name, item) => [
                                    `${value} pemilih (${item.payload.percentage}%)`,
                                    name
                                  ]}
                                  contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '12px'
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={qAnalysis.chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                                  width={100}
                                />
                                <Tooltip
                                  formatter={(val, _, item) => [`${val} suara (${item.payload.percentage}%)`, 'Jumlah']}
                                  contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '12px'
                                  }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                  {qAnalysis.chartData.map((_, i) => (
                                    <Cell key={`bar-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* List Breakdown Rinci */}
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          {qAnalysis.chartData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-semibold text-slate-700 truncate max-w-[65%]">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                ></span>
                                <span className="truncate">{item.name}</span>
                              </span>
                              <span className="font-bold text-slate-500">
                                {item.value} suara <span className="text-brand-primary font-black ml-1">({item.percentage}%)</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : isRating && qAnalysis.ratingStats ? (
                      /* B. TIPE RATING BINTANG */
                      <div>
                        <div className="flex items-center justify-between bg-amber-50/60 border border-amber-100 p-4 rounded-2xl mb-4">
                          <div>
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Rata-rata Skor</p>
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-3xl font-black text-amber-600">{qAnalysis.ratingStats.average}</h3>
                              <span className="text-xs text-amber-500 font-bold">/ 5.0</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                className={i < Math.round(Number(qAnalysis.ratingStats?.average || 0)) ? 'fill-amber-400' : 'text-amber-200'}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Distribusi Bintang 1-5 */}
                        <div className="space-y-2">
                          {qAnalysis.ratingStats.starData.map((item) => (
                            <div key={item.star} className="flex items-center gap-3 text-xs">
                              <span className="font-bold text-slate-600 w-16 shrink-0 flex items-center gap-1">
                                {item.star} <Star size={12} className="fill-amber-400 text-amber-400" />
                              </span>
                              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-slate-500 w-16 text-right shrink-0">
                                {item.value} ({item.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : isNumber && qAnalysis.numberStats ? (
                      /* C. TIPE ANGKA / NUMBER */
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata</p>
                            <p className="text-base font-black text-slate-800">{qAnalysis.numberStats.avg}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Median</p>
                            <p className="text-base font-black text-slate-800">{qAnalysis.numberStats.median}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Nilai Min</p>
                            <p className="text-base font-black text-slate-800">{qAnalysis.numberStats.min}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Nilai Max</p>
                            <p className="text-base font-black text-slate-800">{qAnalysis.numberStats.max}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-800 flex justify-between">
                          <span>Total Akumulasi (Sum):</span>
                          <span className="font-bold">{qAnalysis.numberStats.sum.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ) : isDate && qAnalysis.chartData.length > 0 ? (
                      /* D. TIPE TANGGAL / DATE */
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {qAnalysis.chartData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-700 flex items-center gap-2">
                              <Calendar size={13} className="text-brand-primary" /> {item.name}
                            </span>
                            <span className="font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg">
                              {item.value} responden
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : isLocation ? (
                      /* E. TIPE GEOLOKASI */
                      <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
                        <MapPin size={28} className="mx-auto text-blue-500 mb-2" />
                        <h5 className="font-bold text-slate-800 text-sm">{qAnalysis.totalAnswers} Titik Lokasi Tercatat</h5>
                        <p className="text-xs text-slate-500 mt-1">Koordinat GPS dapat dilihat langsung melalui tab Tabel Respon</p>
                      </div>
                    ) : isFileOrMedia ? (
                      /* F. TIPE FILE / MEDIA */
                      <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-center">
                        <ImageIcon size={28} className="mx-auto text-cyan-500 mb-2" />
                        <h5 className="font-bold text-slate-800 text-sm">{qAnalysis.totalAnswers} Berkas / Media Terkumpul</h5>
                        <p className="text-xs text-slate-500 mt-1">Lampiran gambar, tanda tangan digital, atau berkas dapat dilihat dan diunduh di tab Tabel Respon</p>
                      </div>
                    ) : (
                      /* G. TIPE TEKS BEBAS (Short Text, Long Text, Email, Phone) */
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                          <span>Entri Respon Terbaru</span>
                          <span>{qAnalysis.textResponses.length} total</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {qAnalysis.textResponses.length > 0 ? (
                            qAnalysis.textResponses.slice(0, 6).map((text, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium truncate"
                                title={text}
                              >
                                "{text}"
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-300 italic text-center py-4">Belum ada jawaban teks terisi</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

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
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-primary hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-brand-primary/20 cursor-pointer"
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