import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Copy,
  Printer,
  Link as LinkIcon,
  ListChecks,
  Sparkles,
  RefreshCw,
  Sliders,
  Type,
  Check,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Layers,
  FileCheck2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import defaultLogo from '../../assets/images/logo.png';
import gsdLogo from '../../assets/images/logo-gsd.png';

interface FormItem {
  id: number;
  title: string;
  slug: string;
}

interface ShortlinkItem {
  id: number;
  short_code: string;
  original_url: string;
}

type CardFrameStyle = 'clean' | 'badge' | 'card' | 'tent';

const COLOR_PRESETS = [
  { name: 'Default Dark', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Brand Toska', fg: '#008374', bg: '#ffffff' },
  { name: 'Royal Navy', fg: '#1e3a8a', bg: '#ffffff' },
  { name: 'Emerald Forest', fg: '#065f46', bg: '#ffffff' },
  { name: 'Modern Charcoal', fg: '#27272a', bg: '#f8fafc' },
  { name: 'Dark Mode Invert', fg: '#ffffff', bg: '#0f172a' },
];

const QrCodeGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Mode Input
  const [inputMode, setInputMode] = useState<'custom' | 'form' | 'shortlink'>('custom');

  // Value Utama
  const [url, setUrl] = useState('https://statistik.garutkab.go.id');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showUrlText, setShowUrlText] = useState(true);

  // Styling & Kustomisasi
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [exportResolution, setExportResolution] = useState<number>(1024); // 512, 1024, 2048
  const [frameStyle, setFrameStyle] = useState<CardFrameStyle>('card');

  // Logo Overlay
  const [useLogo, setUseLogo] = useState(true);
  const [logoSource, setLogoSource] = useState<'default' | 'gsd' | 'custom'>('default');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Sumber Data Backend
  const [formsList, setFormsList] = useState<FormItem[]>([]);
  const [shortlinksList, setShortlinksList] = useState<ShortlinkItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  // Loading Aksi
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Ref container untuk QR Canvas & Print
  const qrCanvasContainerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Resolusi Domain saat ini
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://statistik.garutkab.go.id';

  // 1. Membaca Query Params untuk Shortcut / Auto-Fill
  useEffect(() => {
    const qUrl = searchParams.get('url');
    const qTitle = searchParams.get('title');
    const qSubtitle = searchParams.get('subtitle');

    if (qUrl) {
      setUrl(qUrl);
      setInputMode('custom');
    }
    if (qTitle) {
      setTitle(qTitle);
    }
    if (qSubtitle) {
      setSubtitle(qSubtitle);
    }
  }, [searchParams]);

  // 2. Fetch Data Formulir & Shortlink untuk Quick-Select
  const fetchSources = async () => {
    setIsLoadingSources(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [formsRes, linksRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/formulir`, { headers }),
        axios.get(`${API_BASE_URL}/api/links`, { headers })
      ]);

      if (formsRes.status === 'fulfilled' && formsRes.value.data?.success) {
        setFormsList(formsRes.value.data.data || []);
      }
      if (linksRes.status === 'fulfilled' && linksRes.value.data?.success) {
        setShortlinksList(linksRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching sources for QR Generator:', err);
    } finally {
      setIsLoadingSources(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Handler Ganti Sumber Form
  const handleSelectForm = (slug: string) => {
    const selected = formsList.find((f) => f.slug === slug);
    if (selected) {
      setUrl(`${currentOrigin}/form/${selected.slug}`);
      setTitle(selected.title);
      setSubtitle('Pindai untuk Mengisi Formulir');
    }
  };

  // Handler Ganti Sumber Shortlink
  const handleSelectShortlink = (code: string) => {
    const selected = shortlinksList.find((s) => s.short_code === code);
    if (selected) {
      setUrl(`${currentOrigin}/s/${selected.short_code}`);
      setTitle(`Tautan: ${selected.short_code}`);
      setSubtitle(selected.original_url);
    }
  };

  // Logo URL terhitung
  const activeLogoSrc = !useLogo
    ? null
    : logoSource === 'default'
    ? defaultLogo
    : logoSource === 'gsd'
    ? gsdLogo
    : customLogoUrl || defaultLogo;

  // Handler upload logo kustom
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Format Salah', 'Mohon pilih berkas gambar (PNG, JPG, SVG)', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target?.result as string);
        setLogoSource('custom');
        setUseLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // COMPOSITE CANVAS DRAWING ENGINE (PNG EXPORT)
  // ==========================================
  const generateCompositeCanvas = async (exportWidth: number): Promise<HTMLCanvasElement> => {
    // 1. Ambil canvas QR Code mentah dari DOM
    const rawQrCanvas = qrCanvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!rawQrCanvas) {
      throw new Error('Canvas QR Code belum siap');
    }

    // Jika frameStyle == 'clean' dan tidak ada judul maupun subjudul, ekspor QR murni sesuai ukuran
    const isCleanOnly = frameStyle === 'clean' && !title.trim() && !subtitle.trim() && !showUrlText;

    if (isCleanOnly) {
      const pureCanvas = document.createElement('canvas');
      pureCanvas.width = exportWidth;
      pureCanvas.height = exportWidth;
      const pureCtx = pureCanvas.getContext('2d');
      if (!pureCtx) throw new Error('Gagal menginisialisasi canvas context');

      pureCtx.fillStyle = bgColor;
      pureCtx.fillRect(0, 0, exportWidth, exportWidth);
      pureCtx.imageSmoothingEnabled = true;
      pureCtx.imageSmoothingQuality = 'high';
      pureCtx.drawImage(rawQrCanvas, 0, 0, exportWidth, exportWidth);
      return pureCanvas;
    }

    // Buat Canvas Komposit Poster/Card
    const compositeCanvas = document.createElement('canvas');
    const scale = exportWidth / 600; // Skala patokan lebar 600px
    const cardWidth = exportWidth;
    
    // Perhitungan dinamis tinggi kartu berdasarkan konten teks
    let headerHeight = 0;
    if (title.trim()) headerHeight += 50 * scale;
    if (subtitle.trim()) headerHeight += 30 * scale;

    let footerHeight = 0;
    if (showUrlText) footerHeight += 40 * scale;

    const qrSize = Math.round(cardWidth * 0.65); // QR mengambil 65% lebar
    const paddingY = Math.round(48 * scale);
    const spacing = Math.round(20 * scale);

    const cardHeight = Math.round(paddingY * 2 + headerHeight + spacing + qrSize + spacing + footerHeight);

    compositeCanvas.width = cardWidth;
    compositeCanvas.height = cardHeight;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) throw new Error('Gagal menginisialisasi canvas context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background Kartu Keseluruhan
    ctx.fillStyle = bgColor === '#ffffff' ? '#ffffff' : bgColor;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // 2. Frame Styling (jika frameStyle 'card' atau 'tent')
    if (frameStyle === 'card' || frameStyle === 'tent') {
      const margin = 20 * scale;
      const innerW = cardWidth - margin * 2;
      const innerH = cardHeight - margin * 2;
      const radius = 24 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(margin, margin, innerW, innerH, radius);
      ctx.fillStyle = bgColor === '#ffffff' ? '#ffffff' : bgColor;
      ctx.fill();
      ctx.lineWidth = 3 * scale;
      ctx.strokeStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)';
      ctx.stroke();

      if (frameStyle === 'tent') {
        // Aksen Header Badge ala Tent Card Meja
        ctx.beginPath();
        ctx.roundRect(margin, margin, innerW, 16 * scale, [radius, radius, 0, 0]);
        ctx.fillStyle = fgColor;
        ctx.fill();
      }
      ctx.restore();
    } else if (frameStyle === 'badge') {
      // Border luar tipis elegan
      ctx.save();
      ctx.lineWidth = 6 * scale;
      ctx.strokeStyle = fgColor;
      ctx.strokeRect(16 * scale, 16 * scale, cardWidth - 32 * scale, cardHeight - 32 * scale);
      ctx.restore();
    }

    // 3. Render Header Text (Judul & Subjudul)
    let currentY = paddingY;
    const textColor = fgColor === '#ffffff' ? '#ffffff' : (bgColor === '#ffffff' ? '#0f172a' : fgColor);

    if (title.trim()) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(26 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Truncate jika terlalu panjang
      const maxTitleWidth = cardWidth - (80 * scale);
      ctx.fillText(title.trim(), cardWidth / 2, currentY, maxTitleWidth);
      ctx.restore();
      currentY += (34 * scale);
    }

    if (subtitle.trim()) {
      ctx.save();
      ctx.fillStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : '#64748b';
      ctx.font = `500 ${Math.round(15 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxSubWidth = cardWidth - (80 * scale);
      ctx.fillText(subtitle.trim(), cardWidth / 2, currentY, maxSubWidth);
      ctx.restore();
      currentY += (24 * scale);
    }

    if (title.trim() || subtitle.trim()) {
      currentY += (14 * scale);
    }

    // 4. Render QR Code Canvas di Tengah
    const qrX = Math.round((cardWidth - qrSize) / 2);
    const qrY = currentY;

    // Background kotak pembungkus QR agar tetap bersih kontrasnya
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(qrX - (12 * scale), qrY - (12 * scale), qrSize + (24 * scale), qrSize + (24 * scale), 16 * scale);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(rawQrCanvas, qrX, qrY, qrSize, qrSize);
    currentY += qrSize + (24 * scale);

    // 5. Render URL Text di Bawah
    if (showUrlText && url.trim()) {
      ctx.save();
      ctx.fillStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#475569';
      ctx.font = `bold ${Math.round(13 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxUrlWidth = cardWidth - (80 * scale);
      ctx.fillText(url.trim(), cardWidth / 2, currentY, maxUrlWidth);
      ctx.restore();
    }

    return compositeCanvas;
  };

  // ==========================================
  // ACTION: DOWNLOAD PNG
  // ==========================================
  const handleDownload = async () => {
    if (!url.trim()) {
      Swal.fire('Perhatian', 'URL atau teks QR Code tidak boleh kosong!', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await generateCompositeCanvas(exportResolution);
      const safeTitle = (title.trim() || 'qrcode')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');
      const filename = `${safeTitle}-${Date.now()}.png`;

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diunduh!',
        text: `QR Code resolusi ${exportResolution}x${exportResolution}px siap digunakan.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses gambar QR Code.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // ACTION: COPY IMAGE KE CLIPBOARD
  // ==========================================
  const handleCopyImage = async () => {
    if (!url.trim()) return;

    if (!navigator.clipboard || !window.ClipboardItem) {
      Swal.fire(
        'Peramban Tidak Mendukung',
        'Fitur salin gambar langsung ke clipboard memerlukan browser modern dan izin HTTPS.',
        'info'
      );
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await generateCompositeCanvas(exportResolution);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Gagal membuat blob gambar');
        }
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);

        Swal.fire({
          icon: 'success',
          title: 'Gambar Tersalin!',
          text: 'Gambar QR Code tersalin ke clipboard. Anda bisa langsung menempelkannya (Ctrl+V) di Canva, Word, atau pesan.',
          timer: 2000,
          showConfirmButton: false
        });
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      Swal.fire('Gagal Menyalin', 'Gagal menyalin gambar ke clipboard sistem.', 'error');
    }
  };

  // ==========================================
  // ACTION: DIRECT PRINT
  // ==========================================
  const handlePrint = () => {
    if (!url.trim()) return;
    window.print();
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen text-left font-sans">
      
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-dark text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-brand-primary" /> Generator QR Code Kedinasan
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <QrCode size={36} className="text-brand-primary" /> QR Code Generator
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Konversi tautan portal, formulir publik, dan shortlink menjadi QR Code beresolusi tinggi siap cetak & bagikan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setUrl('https://statistik.garutkab.go.id');
              setTitle('');
              setSubtitle('');
              setFgColor('#0f172a');
              setBgColor('#ffffff');
              setFrameStyle('card');
              setUseLogo(true);
              setLogoSource('default');
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw size={15} /> Reset
          </button>
        </div>
      </div>

      {/* 2. Layout Grid 2 Kolom (Kiri: Pengaturan, Kanan: Pratinjau & Aksi) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================== */}
        {/* KOLOM KIRI (PANEL KONTROL & PENGATURAN): 7 Kolom               */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* Card 1: Pilihan Sumber & Isi Konten */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LinkIcon size={18} />
                </div>
                <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">1. Sumber & Konten Tautan</h3>
              </div>
            </div>

            {/* Tab Pilihan Mode Input */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setInputMode('custom')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inputMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders size={14} /> URL Bebas
              </button>
              <button
                type="button"
                onClick={() => setInputMode('form')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inputMode === 'form'
                    ? 'bg-white text-brand-dark shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListChecks size={14} className="text-brand-primary" /> Dari Formulir
              </button>
              <button
                type="button"
                onClick={() => setInputMode('shortlink')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inputMode === 'shortlink'
                    ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LinkIcon size={14} className="text-blue-600" /> Dari Tautan
              </button>
            </div>

            {/* Quick-Select: Formulir Publik */}
            {inputMode === 'form' && (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2 animate-in fade-in duration-200">
                <label className="text-[11px] font-black text-teal-800 uppercase tracking-wider block">
                  Pilih Formulir Publik:
                </label>
                {isLoadingSources ? (
                  <div className="text-xs text-slate-400 font-bold py-2">Memuat daftar formulir...</div>
                ) : formsList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-1 font-medium">Belum ada formulir aktif yang tersedia.</div>
                ) : (
                  <select
                    className="w-full bg-white border border-teal-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                    onChange={(e) => handleSelectForm(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih salah satu formulir --</option>
                    {formsList.map((f) => (
                      <option key={f.id} value={f.slug}>
                        {f.title} ({f.slug})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Quick-Select: Shortlinks */}
            {inputMode === 'shortlink' && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 animate-in fade-in duration-200">
                <label className="text-[11px] font-black text-blue-800 uppercase tracking-wider block">
                  Pilih Tautan Pendek (Shortlink):
                </label>
                {isLoadingSources ? (
                  <div className="text-xs text-slate-400 font-bold py-2">Memuat data tautan pendek...</div>
                ) : shortlinksList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-1 font-medium">Belum ada data shortlink.</div>
                ) : (
                  <select
                    className="w-full bg-white border border-blue-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                    onChange={(e) => handleSelectShortlink(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih salah satu tautan pendek --</option>
                    {shortlinksList.map((s) => (
                      <option key={s.id} value={s.short_code}>
                        /s/{s.short_code} ➔ {s.original_url.length > 50 ? s.original_url.substring(0, 50) + '...' : s.original_url}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Input URL Target */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                Target URL / Teks QR Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://contoh.garutkab.go.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-10 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary p-1"
                    title="Buka URL"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Input Teks Judul & Subjudul (Opsional untuk Poster / Frame) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  Judul Kartu / Acara (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Presensi FGD Statistik"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                  Sub-keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pindai untuk registrasi kehadiran"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
            </div>

            {/* Toggle Tampilkan URL Text */}
            <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUrlText}
                onChange={(e) => setShowUrlText(e.target.checked)}
                className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">
                Tampilkan teks URL lengkap di bawah QR Code
              </span>
            </label>
          </div>

          {/* Card 2: Personalisasi Tampilan & Logo */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Type size={18} />
                </div>
                <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">2. Desain, Warna & Logo</h3>
              </div>
            </div>

            {/* Pilihan Gaya Bingkai (Frame Style) */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                Pilihan Bingkai Kartu (Frame Layout):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'clean', label: 'Clean (Murni)', desc: 'Hanya QR' },
                  { id: 'card', label: 'Modern Card', desc: 'Kartu Berbingkai' },
                  { id: 'badge', label: 'Formal Border', desc: 'Garis Elegan' },
                  { id: 'tent', label: 'Tent Registrasi', desc: 'Aksen Meja' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrameStyle(item.id as CardFrameStyle)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      frameStyle === item.id
                        ? 'border-brand-primary bg-brand-primary/5 text-slate-900 ring-2 ring-brand-primary/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Instansi di Tengah QR */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-slate-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Sisipkan Logo di Tengah QR
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLogo}
                    onChange={(e) => setUseLogo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {useLogo && (
                <div className="pt-2 border-t border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLogoSource('default')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        logoSource === 'default'
                          ? 'bg-white border-brand-primary shadow-xs text-brand-dark ring-1 ring-brand-primary'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <img src={defaultLogo} alt="Logo" className="w-5 h-5 object-contain" />
                      Logo Pemkab
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogoSource('gsd')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        logoSource === 'gsd'
                          ? 'bg-white border-brand-primary shadow-xs text-brand-dark ring-1 ring-brand-primary'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <img src={gsdLogo} alt="Logo GSD" className="w-5 h-5 object-contain" />
                      Logo Satu Data
                    </button>

                    <label className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      logoSource === 'custom'
                        ? 'bg-white border-brand-primary shadow-xs text-brand-dark ring-1 ring-brand-primary'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                    }`}>
                      <Upload size={14} />
                      <span>{customLogoUrl ? 'Logo Kustom Aktif' : 'Unggah Logo...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomLogoUpload}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                    Level koreksi otomatis diatur ke <strong>Level H (High 30%)</strong> agar QR tetap 100% terbaca dengan logo.
                  </p>
                </div>
              )}
            </div>

            {/* Skema Warna & Preset */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Warna & Tema QR:
                </label>
              </div>

              {/* Preset Palet Cepat */}
              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      fgColor === preset.fg && bgColor === preset.bg
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-dark ring-1 ring-brand-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 inline-block"
                      style={{ backgroundColor: preset.fg }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warna Titik QR</div>
                    <div className="text-xs font-mono font-bold text-slate-700">{fgColor}</div>
                  </div>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warna Latar</div>
                    <div className="text-xs font-mono font-bold text-slate-700">{bgColor}</div>
                  </div>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Resolusi Ekspor */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                Resolusi Ekspor Berkas (Ukuran PNG):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 512, label: '512 px', tag: 'Web / Layar' },
                  { size: 1024, label: '1024 px', tag: 'Standar Cetak' },
                  { size: 2048, label: '2048 px', tag: 'Ultra HD / Banner' },
                ].map((res) => (
                  <button
                    key={res.size}
                    type="button"
                    onClick={() => setExportResolution(res.size)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      exportResolution === res.size
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-dark ring-1 ring-brand-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">{res.label}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{res.tag}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* KOLOM KANAN (PRATINJAU REALTIME & AKSI EKSPOR): 5 Kolom        */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">

          {/* Kartu Pratinjau Interaktif */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={14} /> Pratinjau Siap Cetak
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                {exportResolution}px
              </span>
            </div>

            {/* Container Kartu yang Dirender & Dicetak */}
            <div
              ref={printAreaRef}
              className={`w-full transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl ${
                frameStyle === 'card'
                  ? 'border border-slate-200 shadow-sm'
                  : frameStyle === 'badge'
                  ? 'border-4 border-slate-800'
                  : frameStyle === 'tent'
                  ? 'border-t-8 border-x border-b border-brand-primary shadow-sm'
                  : ''
              }`}
              style={{
                backgroundColor: bgColor,
                color: fgColor === '#ffffff' ? '#ffffff' : (bgColor === '#ffffff' ? '#0f172a' : fgColor)
              }}
            >
              {/* Header Kartu Pratinjau */}
              {(title.trim() || subtitle.trim()) && (
                <div className="text-center mb-4 max-w-full px-2">
                  {title.trim() && (
                    <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2">
                      {title}
                    </h4>
                  )}
                  {subtitle.trim() && (
                    <p
                      className="text-xs font-semibold mt-1 opacity-75 line-clamp-2"
                      style={{ color: fgColor === '#ffffff' ? '#ffffff' : undefined }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* QR Code Canvas Hidden Source & Visual Display */}
              <div
                ref={qrCanvasContainerRef}
                className="p-3 rounded-2xl transition-transform hover:scale-102 duration-200"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeCanvas
                  value={url.trim() || 'https://statistik.garutkab.go.id'}
                  size={240}
                  level="H" // Selalu gunakan level H untuk ketahanan tinggi
                  bgColor={bgColor}
                  fgColor={fgColor}
                  imageSettings={
                    activeLogoSrc
                      ? {
                          src: activeLogoSrc,
                          x: undefined,
                          y: undefined,
                          height: 48,
                          width: 48,
                          excavate: true, // Bersihkan dot di belakang logo
                        }
                      : undefined
                  }
                />
              </div>

              {/* Footer URL Kartu Pratinjau */}
              {showUrlText && url.trim() && (
                <div className="mt-4 text-center max-w-full px-2">
                  <span
                    className="text-[11px] font-mono font-bold tracking-tight block truncate max-w-[280px] opacity-80"
                    title={url}
                  >
                    {url}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Status / Info */}
            <div className="w-full mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <Check size={14} /> Format PNG Transparan/Padat
              </span>
              <span>Koreksi: High (30%)</span>
            </div>

            {/* Tombol Aksi Ekspor */}
            <div className="w-full space-y-2.5 mt-5">
              
              {/* 1. Download PNG */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-4 px-6 rounded-2xl bg-brand-primary hover:bg-brand-dark text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-brand-primary/25 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download size={18} />
                {isExporting ? 'Memproses Berkas...' : `Unduh Gambar PNG (${exportResolution}px)`}
              </button>

              {/* 2. Copy Image & Direct Print */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                >
                  {copiedSuccess ? (
                    <>
                      <FileCheck2 size={16} className="text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Salin Gambar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Printer size={16} /> Cetak Kartu
                </button>
              </div>

            </div>

          </div>

          {/* Kotak Tips Kedinasan */}
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-3xl p-5 text-xs text-brand-dark font-medium leading-relaxed">
            <h5 className="font-black text-brand-dark uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-brand-primary" /> Tips Penggunaan di Acara Dinas
            </h5>
            Gunakan opsi <strong>Resolusi 1024px atau 2048px</strong> jika QR Code akan dicetak pada standing banner, poster aula, atau lembar registrasi meja agar hasil cetak sangat tajam dan tidak pecah saat difoto dari kejauhan.
          </div>

        </div>

      </div>

      {/* Style Khusus Media Print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            width: 80% !important;
            border: 2px solid #000 !important;
            padding: 30px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default QrCodeGenerator;

