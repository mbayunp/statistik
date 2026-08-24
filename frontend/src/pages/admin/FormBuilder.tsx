import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  ArrowLeft, Plus, Trash2, Save, Type, CheckSquare, CircleDot, AlignLeft, X,
  Heading, Image as ImageIcon, Minus, FileText, Hash, List, Phone, Mail,
  MapPin, Compass, Star, UploadCloud, Camera, Calendar, Clock, Link as LinkIcon,
  PenTool, Copy, ArrowUp, ArrowDown, Sparkles, Eye, Loader2, Upload
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export type ElementCategory = 'layout' | 'input';

export type QuestionType =
  // Layout
  | 'section_header'
  | 'paragraph_text'
  | 'banner_media'
  | 'divider'
  // Input
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'phone'
  | 'email'
  | 'address'
  | 'geolocation'
  | 'rating'
  | 'file_upload'
  | 'camera_capture'
  | 'date'
  | 'time'
  | 'url'
  | 'signature';

export interface FormElement {
  id: string | number;
  element_category: ElementCategory;
  question_type: QuestionType;
  question_text: string;
  description?: string;
  placeholder?: string;
  options: string[];
  is_required: boolean;
  validation_rules?: {
    min?: number;
    max?: number;
    min_length?: number;
    max_length?: number;
    allowed_file_types?: string[];
    max_file_size_mb?: number;
  };
  layout_config?: {
    banner_url?: string;
    image_align?: 'left' | 'center' | 'right';
    scale_min?: number;
    scale_max?: number;
    scale_min_label?: string;
    scale_max_label?: string;
    display_mode?: 'stars' | 'numbers';
  };
}

interface PaletteItem {
  type: QuestionType;
  label: string;
  category: ElementCategory;
  icon: React.ReactNode;
  description: string;
  defaultText: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Layout Blocks
  {
    type: 'section_header',
    label: 'Judul Bagian',
    category: 'layout',
    icon: <Heading size={18} className="text-purple-600" />,
    description: 'Header seksi pembagi dengan judul & subteks',
    defaultText: 'Bagian Formulir Baru'
  },
  {
    type: 'paragraph_text',
    label: 'Teks Panduan / Paragraf',
    category: 'layout',
    icon: <AlignLeft size={18} className="text-amber-600" />,
    description: 'Instruksi, disclaimer, atau pengumuman panjang',
    defaultText: 'Silakan isi data berikut sesuai dengan petunjuk yang berlaku.'
  },
  {
    type: 'banner_media',
    label: 'Banner Media / Foto',
    category: 'layout',
    icon: <ImageIcon size={18} className="text-rose-600" />,
    description: 'Gambar ilustrasi, poster, atau banner info',
    defaultText: 'Poster / Banner Informasi'
  },
  {
    type: 'divider',
    label: 'Garis Pemisah',
    category: 'layout',
    icon: <Minus size={18} className="text-slate-500" />,
    description: 'Garis pembatas visual antar bagian',
    defaultText: 'Pemisah Bagian'
  },

  // Input Fields - Teks & Kontak
  {
    type: 'short_text',
    label: 'Jawaban Singkat',
    category: 'input',
    icon: <Type size={18} className="text-blue-600" />,
    description: 'Nama, NIP, judul, atau isian singkat',
    defaultText: 'Pertanyaan Teks Singkat'
  },
  {
    type: 'long_text',
    label: 'Paragraf / Teks Panjang',
    category: 'input',
    icon: <FileText size={18} className="text-indigo-600" />,
    description: 'Keterangan rinci, saran, atau narasi',
    defaultText: 'Keterangan / Uraian Lengkap'
  },
  {
    type: 'number',
    label: 'Nilai Angka / Jumlah',
    category: 'input',
    icon: <Hash size={18} className="text-cyan-600" />,
    description: 'Umur, nominal, kuantitas, atau statistik',
    defaultText: 'Jumlah / Nilai Angka'
  },
  {
    type: 'phone',
    label: 'Nomor Telepon / WA',
    category: 'input',
    icon: <Phone size={18} className="text-emerald-600" />,
    description: 'Kontak nomor HP / WhatsApp',
    defaultText: 'Nomor WhatsApp Aktif'
  },
  {
    type: 'email',
    label: 'Alamat Email',
    category: 'input',
    icon: <Mail size={18} className="text-sky-600" />,
    description: 'Validasi otomatis format email resmi',
    defaultText: 'Alamat Email'
  },
  {
    type: 'address',
    label: 'Alamat Lengkap',
    category: 'input',
    icon: <MapPin size={18} className="text-red-500" />,
    description: 'Alamat domisili, kantor, atau tempat kegiatan',
    defaultText: 'Alamat Lengkap'
  },
  {
    type: 'url',
    label: 'Tautan / Website',
    category: 'input',
    icon: <LinkIcon size={18} className="text-teal-600" />,
    description: 'Tautan link portal, drive, atau web',
    defaultText: 'Tautan Website / Dokumen'
  },

  // Input Fields - Pilihan
  {
    type: 'radio',
    label: 'Pilihan Ganda',
    category: 'input',
    icon: <CircleDot size={18} className="text-orange-500" />,
    description: 'Pilih salah satu dari daftar opsi',
    defaultText: 'Pilih Salah Satu Jawaban'
  },
  {
    type: 'checkbox',
    label: 'Kotak Centang (Banyak Opsi)',
    category: 'input',
    icon: <CheckSquare size={18} className="text-emerald-500" />,
    description: 'Dapat memilih lebih dari satu opsi',
    defaultText: 'Pilih Opsi yang Sesuai'
  },
  {
    type: 'select',
    label: 'Dropdown / Menu Pilihan',
    category: 'input',
    icon: <List size={18} className="text-violet-600" />,
    description: 'Menu dropdown hemat tempat',
    defaultText: 'Pilih dari Dropdown'
  },

  // Input Fields - Media, Sensor & Khusus
  {
    type: 'geolocation',
    label: 'Deteksi Lokasi GPS',
    category: 'input',
    icon: <Compass size={18} className="text-blue-500" />,
    description: 'Ambil titik koordinat Latitude & Longitude otomatis',
    defaultText: 'Titik Lokasi Pengambilan Data (GPS)'
  },
  {
    type: 'rating',
    label: 'Rating / Skala Kepuasan',
    category: 'input',
    icon: <Star size={18} className="text-amber-500" />,
    description: 'Penilaian bintang atau skala numerik 1-5',
    defaultText: 'Tingkat Kepuasan Layanan'
  },
  {
    type: 'file_upload',
    label: 'Unggah Berkas / Dokumen',
    category: 'input',
    icon: <UploadCloud size={18} className="text-cyan-500" />,
    description: 'Lampiran PDF, Word, Excel, atau ZIP',
    defaultText: 'Unggah Dokumen Lampiran'
  },
  {
    type: 'camera_capture',
    label: 'Foto Kamera Langsung',
    category: 'input',
    icon: <Camera size={18} className="text-pink-500" />,
    description: 'Ambil foto dokumentasi langsung dari kamera perangkat',
    defaultText: 'Ambil Foto Dokumentasi Lapangan'
  },
  {
    type: 'signature',
    label: 'Tanda Tangan Digital',
    category: 'input',
    icon: <PenTool size={18} className="text-indigo-500" />,
    description: 'Kanvas tanda tangan digital dengan mouse/sentuhan',
    defaultText: 'Tanda Tangan Pengesahan / Petugas'
  },
  {
    type: 'date',
    label: 'Pemilih Tanggal',
    category: 'input',
    icon: <Calendar size={18} className="text-amber-600" />,
    description: 'Pilih tanggal dari kalender pop-up',
    defaultText: 'Tanggal Pelaksanaan'
  },
  {
    type: 'time',
    label: 'Pemilih Waktu',
    category: 'input',
    icon: <Clock size={18} className="text-slate-600" />,
    description: 'Pilih jam dan menit (HH:mm)',
    defaultText: 'Waktu / Jam Pelaksanaan'
  }
];

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'layout' | 'input'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State Utama Formulir
  const [title, setTitle] = useState('Formulir Tanpa Judul');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<FormElement[]>([
    {
      id: `q_${Date.now()}`,
      element_category: 'input',
      question_type: 'short_text',
      question_text: 'Nama Lengkap',
      placeholder: 'Masukkan nama Anda...',
      options: [],
      is_required: true
    }
  ]);

  // Load Existing Form for Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchFormDetail = async () => {
        setIsFetching(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/formulir/admin/${id}`);
          if (res.data.success) {
            const formData = res.data.data;
            setTitle(formData.title || '');
            setSlug(formData.slug || '');
            setDescription(formData.description || '');
            setIsActive(formData.is_active !== 0);

            if (formData.questions && formData.questions.length > 0) {
              setQuestions(
                formData.questions.map((q: FormElement) => ({
                  ...q,
                  element_category: q.element_category || (['section_header', 'banner_media', 'paragraph_text', 'divider'].includes(q.question_type) ? 'layout' : 'input'),
                  options: Array.isArray(q.options) ? q.options : [],
                  validation_rules: q.validation_rules || {},
                  layout_config: q.layout_config || {}
                }))
              );
            }
          }
        } catch (error) {
          console.error('Gagal memuat formulir:', error);
          Swal.fire('Error', 'Gagal memuat data formulir untuk diedit', 'error').then(() => {
            navigate('/admin/formulir');
          });
        } finally {
          setIsFetching(false);
        }
      };
      fetchFormDetail();
    }
  }, [id, isEditMode, navigate]);

  // Auto slug generation on new form title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode && !slug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  // Tambah Elemen dari Palette
  const addElement = (item: PaletteItem) => {
    const newElement: FormElement = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      element_category: item.category,
      question_type: item.type,
      question_text: item.defaultText,
      description: '',
      placeholder: ['short_text', 'long_text', 'phone', 'email', 'number', 'address', 'url'].includes(item.type)
        ? `Masukkan ${item.label.toLowerCase()}...`
        : '',
      options: ['radio', 'checkbox', 'select'].includes(item.type) ? ['Opsi 1', 'Opsi 2'] : [],
      is_required: item.category === 'input',
      validation_rules: item.type === 'file_upload' ? { allowed_file_types: ['application/pdf'], max_file_size_mb: 5 } : {},
      layout_config: item.type === 'rating'
        ? { scale_min: 1, scale_max: 5, scale_min_label: 'Sangat Buruk', scale_max_label: 'Sangat Baik', display_mode: 'stars' }
        : item.type === 'banner_media'
        ? { banner_url: '', image_align: 'center' }
        : {}
    };

    setQuestions([...questions, newElement]);
    setIsPaletteOpen(false);

    // Smooth scroll ke elemen baru
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  // Hapus Elemen
  const removeElement = (elementId: string | number) => {
    if (questions.length === 1) {
      return Swal.fire('Perhatian', 'Formulir minimal harus memiliki 1 elemen!', 'warning');
    }
    setQuestions(questions.filter((q) => q.id !== elementId));
  };

  // Duplikat Elemen
  const duplicateElement = (elementId: string | number) => {
    const index = questions.findIndex((q) => q.id === elementId);
    if (index === -1) return;
    const original = questions[index];
    const duplicated: FormElement = {
      ...JSON.parse(JSON.stringify(original)),
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      question_text: `${original.question_text} (Salinan)`
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
  };

  // Pindah Elemen Atas / Bawah
  const moveElement = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setQuestions(newQuestions);
  };

  // Update Field Elemen
  const updateElement = (elementId: string | number, field: keyof FormElement, value: unknown) => {
    setQuestions(questions.map((q) => (q.id === elementId ? { ...q, [field]: value } : q)));
  };

  // Update Sub-Field (layout_config / validation_rules)
  const updateSubField = (elementId: string | number, parent: 'layout_config' | 'validation_rules', subKey: string, value: unknown) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === elementId) {
          return {
            ...q,
            [parent]: {
              ...(q[parent] || {}),
              [subKey]: value
            }
          };
        }
        return q;
      })
    );
  };

  // Opsi List Handler
  const addOption = (elementId: string | number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === elementId) {
          return { ...q, options: [...q.options, `Opsi ${q.options.length + 1}`] };
        }
        return q;
      })
    );
  };

  const updateOption = (elementId: string | number, optIndex: number, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === elementId) {
          const newOpts = [...q.options];
          newOpts[optIndex] = text;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const removeOption = (elementId: string | number, optIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === elementId) {
          if (q.options.length <= 1) return q;
          return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
        }
        return q;
      })
    );
  };

  // Handle Upload Banner Media Langsung
  const handleBannerUpload = async (elementId: string | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file_attachment', file);

    try {
      Swal.fire({
        title: 'Mengunggah Banner...',
        text: 'Mohon tunggu beberapa saat',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await axios.post(`${API_BASE_URL}/api/formulir/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.close();

      if (res.data.success) {
        updateSubField(elementId, 'layout_config', 'banner_url', res.data.file_url);
        Swal.fire('Berhasil', 'Gambar banner berhasil diunggah', 'success');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat mengunggah gambar', 'error');
    }
  };

  // Simpan Formulir (Create or Update)
  const handleSaveForm = async () => {
    if (!title.trim()) {
      return Swal.fire('Validasi', 'Judul formulir tidak boleh kosong!', 'warning');
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!finalSlug) {
      return Swal.fire('Validasi', 'Link slug formulir tidak valid!', 'warning');
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        slug: finalSlug,
        description,
        is_active: isActive ? 1 : 0,
        questions
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/formulir/${id}`, payload);
        Swal.fire('Berhasil!', 'Formulir berhasil diperbarui.', 'success').then(() => {
          navigate('/admin/formulir');
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/formulir`, payload);
        Swal.fire('Berhasil!', 'Formulir baru berhasil dibuat dan siap dibagikan.', 'success').then(() => {
          navigate('/admin/formulir');
        });
      }
    } catch (error: unknown) {
      console.error(error);
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan saat menyimpan formulir';
      Swal.fire('Gagal', errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Ikon Tipe Elemen
  const getElementBadge = (element: FormElement) => {
    const item = PALETTE_ITEMS.find((p) => p.type === element.question_type);
    const isLayout = element.element_category === 'layout';
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
        isLayout ? 'bg-purple-100 text-purple-700' : 'bg-brand-primary/10 text-brand-primary'
      }`}>
        {item?.icon || <Type size={14} />}
        <span>{item?.label || element.question_type}</span>
      </div>
    );
  };

  // Filter Palette Items
  const filteredPalette = PALETTE_ITEMS.filter((item) => {
    const matchesCategory = paletteFilter === 'all' || item.category === paletteFilter;
    const matchesQuery = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary mb-4" size={48} />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Memuat Data Formulir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 text-left font-sans">
      
      {/* 1. TOPBAR STICKY */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/formulir')}
            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"
            title="Kembali ke Daftar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                isEditMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isEditMode ? 'Mode Edit' : 'Formulir Baru'}
              </span>
              <span className="text-xs text-slate-400 font-bold">{questions.length} Elemen</span>
            </div>
            <h1 className="font-black text-slate-800 text-lg truncate max-w-xs sm:max-w-md mt-0.5">
              {title || 'Formulir Tanpa Judul'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditMode && slug && (
            <button
              onClick={() => window.open(`/form/${slug}`, '_blank')}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <Eye size={16} /> Preview Publik
            </button>
          )}

          <button
            onClick={handleSaveForm}
            disabled={isLoading}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={18} /> Menyimpan...</>
            ) : (
              <><Save size={18} /> {isEditMode ? 'Simpan Perubahan' : 'Simpan Formulir'}</>
            )}
          </button>
        </div>
      </header>

      {/* 2. FORM BUILDER CANVAS */}
      <main className="max-w-4xl w-full mx-auto mt-8 px-4 flex flex-col gap-6">

        {/* Form Meta Header Card */}
        <div className="bg-white p-8 rounded-3xl border-t-8 border-t-brand-primary shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Judul Formulir
            </label>
            <input
              type="text"
              placeholder="Ketik Judul Formulir di sini..."
              className="w-full text-2xl sm:text-3xl font-black text-slate-800 border-b border-transparent focus:border-brand-primary outline-none py-1 transition-colors placeholder:text-slate-300"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Link Kustom / Slug URL
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600">
                <span className="text-slate-400 font-medium mr-1">/form/</span>
                <input
                  type="text"
                  placeholder="link-formulir"
                  className="w-full bg-transparent border-none outline-none font-bold text-brand-dark placeholder:font-normal"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Status Penerimaan Respon
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <span className="text-xs font-bold text-slate-700">
                  {isActive ? '🟢 Formulir Aktif (Menerima Jawaban)' : '🔴 Formulir Ditutup (Nonaktif)'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Deskripsi Formulir (Opsional)
            </label>
            <textarea
              placeholder="Tuliskan petunjuk umum atau deskripsi untuk responden..."
              className="w-full text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-brand-primary resize-none placeholder:text-slate-400 leading-relaxed"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Elemen-elemen Pertanyaan & Layout */}
        <div className="space-y-6">
          {questions.map((element, index) => {
            const isLayout = element.element_category === 'layout';

            return (
              <div
                key={element.id}
                className={`bg-white p-6 sm:p-8 rounded-3xl shadow-sm border transition-all duration-200 group hover:shadow-md ${
                  isLayout
                    ? 'border-purple-200/80 bg-purple-50/20 focus-within:border-l-[6px] focus-within:border-l-purple-600'
                    : 'border-slate-200 focus-within:border-l-[6px] focus-within:border-l-brand-primary'
                }`}
              >
                {/* Header Elemen: Badge Tipe & Kontrol Urutan */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
                      {index + 1}
                    </span>
                    {getElementBadge(element)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveElement(index, 'up')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Pindah ke Atas"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={() => moveElement(index, 'down')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Pindah ke Bawah"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => duplicateElement(element.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplikat Elemen"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeElement(element.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Elemen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Body Elemen: Input Teks & Konfigurasi Khusus */}
                <div className="space-y-4">
                  
                  {/* Judul Pertanyaan / Label Blok */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {isLayout ? 'Judul / Teks Blok' : 'Label Pertanyaan'}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 text-sm outline-none focus:border-brand-primary transition-all"
                      placeholder={isLayout ? 'Judul seksi / teks pengantar...' : 'Ketik pertanyaan di sini...'}
                      value={element.question_text}
                      onChange={(e) => updateElement(element.id, 'question_text', e.target.value)}
                    />
                  </div>

                  {/* Deskripsi Tambahan (Opsional) */}
                  {element.question_type !== 'divider' && (
                    <div>
                      <input
                        type="text"
                        className="w-full bg-transparent border-b border-slate-200 px-1 py-1.5 text-xs text-slate-600 outline-none focus:border-brand-primary placeholder:text-slate-400 transition-colors"
                        placeholder="Tambahkan teks petunjuk / deskripsi pembantu (opsional)..."
                        value={element.description || ''}
                        onChange={(e) => updateElement(element.id, 'description', e.target.value)}
                      />
                    </div>
                  )}

                  {/* === AREA KONFIGURASI KHUSUS PER TIPE === */}

                  {/* 1. Divider Preview */}
                  {element.question_type === 'divider' && (
                    <div className="py-3">
                      <hr className="border-t-2 border-slate-200 border-dashed" />
                      <p className="text-center text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">
                        Pemisah Bagian Halaman
                      </p>
                    </div>
                  )}

                  {/* 2. Banner Media Upload & URL */}
                  {element.question_type === 'banner_media' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {element.layout_config?.banner_url ? (
                          <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative group">
                            <img
                              src={element.layout_config.banner_url}
                              alt="Banner Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => updateSubField(element.id, 'layout_config', 'banner_url', '')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus Gambar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full sm:w-48 h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 hover:border-brand-primary bg-white cursor-pointer transition-colors text-center">
                            <Upload size={20} className="text-slate-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-600">Upload Gambar</span>
                            <span className="text-[9px] text-slate-400">JPG, PNG, WebP (Maks 10MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleBannerUpload(element.id, e)}
                            />
                          </label>
                        )}

                        <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            Atau Masukkan URL Gambar Eksternal
                          </label>
                          <input
                            type="text"
                            placeholder="https://domain.com/banner.jpg"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-primary"
                            value={element.layout_config?.banner_url || ''}
                            onChange={(e) => updateSubField(element.id, 'layout_config', 'banner_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Opsi Jawaban (Radio, Checkbox, Select) */}
                  {['radio', 'checkbox', 'select'].includes(element.question_type) && (
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Daftar Pilihan Jawaban
                      </span>
                      {element.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <span className="text-slate-400">
                            {element.question_type === 'radio' && <CircleDot size={18} />}
                            {element.question_type === 'checkbox' && <CheckSquare size={18} />}
                            {element.question_type === 'select' && <List size={18} />}
                          </span>
                          <input
                            type="text"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-primary"
                            value={opt}
                            onChange={(e) => updateOption(element.id, optIdx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(element.id, optIdx)}
                            className="text-slate-300 hover:text-red-500 p-1.5 transition-colors"
                            title="Hapus Opsi"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addOption(element.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-emerald-700 hover:bg-brand-primary/10 px-3 py-2 rounded-xl transition-colors mt-2"
                      >
                        <Plus size={16} /> Tambah Opsi Pilihan
                      </button>
                    </div>
                  )}

                  {/* 4. Rating & Skala Kepuasan */}
                  {element.question_type === 'rating' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            Label Terendah (Nilai 1)
                          </label>
                          <input
                            type="text"
                            placeholder="Sangat Buruk"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-primary"
                            value={element.layout_config?.scale_min_label || ''}
                            onChange={(e) => updateSubField(element.id, 'layout_config', 'scale_min_label', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            Label Tertinggi (Nilai Maksimal)
                          </label>
                          <input
                            type="text"
                            placeholder="Sangat Baik"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-primary"
                            value={element.layout_config?.scale_max_label || ''}
                            onChange={(e) => updateSubField(element.id, 'layout_config', 'scale_max_label', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">Rentang Skala:</span>
                          <select
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                            value={element.layout_config?.scale_max || 5}
                            onChange={(e) => updateSubField(element.id, 'layout_config', 'scale_max', Number(e.target.value))}
                          >
                            <option value={5}>1 sampai 5</option>
                            <option value={10}>1 sampai 10</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Tampilan Preview Mini untuk Field Sensor & Khusus */}
                  {element.question_type === 'geolocation' && (
                    <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-2xl flex items-center gap-3 text-blue-700 text-xs font-semibold">
                      <Compass size={20} className="text-blue-500 shrink-0" />
                      <span>Responden akan diminta mendeteksi titik koordinat GPS lokasi secara otomatis.</span>
                    </div>
                  )}

                  {element.question_type === 'signature' && (
                    <div className="bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-2xl flex items-center gap-3 text-indigo-700 text-xs font-semibold">
                      <PenTool size={20} className="text-indigo-500 shrink-0" />
                      <span>Kanvas tanda tangan digital touch/mouse interaktif akan dirender untuk responden.</span>
                    </div>
                  )}

                  {element.question_type === 'camera_capture' && (
                    <div className="bg-pink-50/60 border border-pink-200/80 p-3.5 rounded-2xl flex items-center gap-3 text-pink-700 text-xs font-semibold">
                      <Camera size={20} className="text-pink-500 shrink-0" />
                      <span>Responden dapat langsung mengambil foto snapshot dari kamera HP atau Webcam laptop.</span>
                    </div>
                  )}

                  {element.question_type === 'file_upload' && (
                    <div className="bg-cyan-50/60 border border-cyan-200/80 p-3.5 rounded-2xl flex items-center gap-3 text-cyan-800 text-xs font-semibold">
                      <UploadCloud size={20} className="text-cyan-600 shrink-0" />
                      <span>Mendukung upload lampiran berkas dokumen (PDF, Word, Excel, ZIP) hingga 10MB.</span>
                    </div>
                  )}

                </div>

                {/* Footer Elemen: Saklar Wajib Diisi (Hanya untuk tipe Input) */}
                {!isLayout && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <span className="text-xs font-bold text-slate-600">Wajib Diisi</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={element.is_required}
                        onChange={(e) => updateElement(element.id, 'is_required', e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Tombol Tambah Elemen Utama di Bawah */}
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="w-full py-5 rounded-3xl border-2 border-dashed border-brand-primary/40 bg-brand-primary/5 hover:bg-brand-primary/10 hover:border-brand-primary text-brand-primary font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
        >
          <Plus size={20} /> Tambah Elemen / Blok Formulir Baru
        </button>

      </main>

      {/* 3. MODAL PALET PILIHAN 18+ ELEMEN */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Sparkles size={20} className="text-brand-primary" /> Pilih Tipe Elemen Formulir
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pilih blok tata letak atau tipe isian interaktif yang ingin ditambahkan.
                </p>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Filter Tabs & Search */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPaletteFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paletteFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Semua ({PALETTE_ITEMS.length})
                </button>
                <button
                  onClick={() => setPaletteFilter('input')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paletteFilter === 'input' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Input Data ({PALETTE_ITEMS.filter((p) => p.category === 'input').length})
                </button>
                <button
                  onClick={() => setPaletteFilter('layout')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    paletteFilter === 'layout' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tata Letak ({PALETTE_ITEMS.filter((p) => p.category === 'layout').length})
                </button>
              </div>

              <input
                type="text"
                placeholder="Cari tipe elemen..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Modal Elements Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              {filteredPalette.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addElement(item)}
                  className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-100 hover:border-brand-primary/40 hover:bg-brand-primary/5 text-left transition-all group active:scale-95"
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-white shadow-xs shrink-0 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-800 text-sm group-hover:text-brand-primary transition-colors">
                        {item.label}
                      </h4>
                      {item.category === 'layout' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          Layout
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-tight mt-1">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 4. FLOATING ACTION BUTTON UNTUK TAMBAH ELEMEN CEPAT */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="bg-brand-dark text-white hover:bg-brand-primary px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-xs uppercase tracking-wider"
          title="Buka Palet Elemen"
        >
          <Plus size={20} /> Tambah Elemen
        </button>
      </div>

    </div>
  );
};

export default FormBuilder;