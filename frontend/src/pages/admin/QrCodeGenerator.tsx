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
  RefreshCw,
  Sliders,
  Upload,
  ExternalLink,
  FileCheck2,
  Share2,
  LayoutGrid
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

interface MicrositeItem {
  id: number;
  title: string;
  slug: string;
}

type CardFrameStyle = 'clean' | 'card' | 'badge' | 'tent';

const COLOR_PRESETS = [
  { name: 'Hitam', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Toska', fg: '#008374', bg: '#ffffff' },
  { name: 'Navy', fg: '#1e3a8a', bg: '#ffffff' },
  { name: 'Hijau', fg: '#065f46', bg: '#ffffff' },
  { name: 'Abu Gelap', fg: '#27272a', bg: '#f8fafc' },
  { name: 'Invert', fg: '#ffffff', bg: '#0f172a' },
];

const QrCodeGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Mode Input
  const [inputMode, setInputMode] = useState<'custom' | 'form' | 'shortlink' | 'microsite'>('custom');

  // Nilai Data
  const [url, setUrl] = useState('https://statistik.garutkab.go.id');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showUrlText, setShowUrlText] = useState(true);

  // Kustomisasi Tampilan
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [exportResolution, setExportResolution] = useState<number>(1024);
  const [frameStyle, setFrameStyle] = useState<CardFrameStyle>('card');

  // Logo
  const [useLogo, setUseLogo] = useState(true);
  const [logoSource, setLogoSource] = useState<'default' | 'gsd' | 'custom'>('default');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  // Data Pendukung
  const [formsList, setFormsList] = useState<FormItem[]>([]);
  const [shortlinksList, setShortlinksList] = useState<ShortlinkItem[]>([]);
  const [micrositesList, setMicrositesList] = useState<MicrositeItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  // State Aksi
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const qrCanvasContainerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://statistik.garutkab.go.id';

  // Baca Query Params
  useEffect(() => {
    const qUrl = searchParams.get('url');
    const qTitle = searchParams.get('title');
    const qSubtitle = searchParams.get('subtitle');

    if (qUrl) {
      setUrl(qUrl);
      setInputMode('custom');
    }
    if (qTitle) setTitle(qTitle);
    if (qSubtitle) setSubtitle(qSubtitle);
  }, [searchParams]);

  // Ambil Data Formulir & Shortlink
  useEffect(() => {
    const fetchSources = async () => {
      setIsLoadingSources(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [formsRes, linksRes, micrositesRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/formulir`, { headers }),
          axios.get(`${API_BASE_URL}/api/links`, { headers }),
          axios.get(`${API_BASE_URL}/api/microsites`, { headers })
        ]);

        if (formsRes.status === 'fulfilled' && formsRes.value.data?.success) {
          setFormsList(formsRes.value.data.data || []);
        }
        if (linksRes.status === 'fulfilled' && linksRes.value.data?.success) {
          setShortlinksList(linksRes.value.data.data || []);
        }
        if (micrositesRes.status === 'fulfilled' && micrositesRes.value.data?.success) {
          setMicrositesList(micrositesRes.value.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching sources for QR Generator:', err);
      } finally {
        setIsLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  const handleSelectForm = (slug: string) => {
    const selected = formsList.find((f) => f.slug === slug);
    if (selected) {
      setUrl(`${currentOrigin}/form/${selected.slug}`);
      setTitle(selected.title);
      setSubtitle('Pindai untuk Mengisi Formulir');
    }
  };

  const handleSelectShortlink = (code: string) => {
    const selected = shortlinksList.find((s) => s.short_code === code);
    if (selected) {
      setUrl(`${currentOrigin}/s/${selected.short_code}`);
      setTitle(`Tautan: ${selected.short_code}`);
      setSubtitle(selected.original_url);
    }
  };

  const handleSelectMicrosite = (slug: string) => {
    const selected = micrositesList.find((m) => m.slug === slug);
    if (selected) {
      setUrl(`${currentOrigin}/p/${selected.slug}`);
      setTitle(selected.title);
      setSubtitle('Pindai untuk membuka Portal Kegiatan');
    }
  };

  const activeLogoSrc = !useLogo
    ? null
    : logoSource === 'default'
    ? defaultLogo
    : logoSource === 'gsd'
    ? gsdLogo
    : customLogoUrl || defaultLogo;

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Format Salah', 'Pilih file gambar (PNG, JPG, SVG)', 'warning');
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

  // Canvas Drawing Engine
  const generateCompositeCanvas = async (exportWidth: number): Promise<HTMLCanvasElement> => {
    const rawQrCanvas = qrCanvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!rawQrCanvas) {
      throw new Error('Canvas QR Code belum siap');
    }

    const isCleanOnly = frameStyle === 'clean' && !title.trim() && !subtitle.trim() && !showUrlText;

    if (isCleanOnly) {
      const pureCanvas = document.createElement('canvas');
      pureCanvas.width = exportWidth;
      pureCanvas.height = exportWidth;
      const pureCtx = pureCanvas.getContext('2d');
      if (!pureCtx) throw new Error('Gagal context canvas');

      pureCtx.fillStyle = bgColor;
      pureCtx.fillRect(0, 0, exportWidth, exportWidth);
      pureCtx.imageSmoothingEnabled = true;
      pureCtx.imageSmoothingQuality = 'high';
      pureCtx.drawImage(rawQrCanvas, 0, 0, exportWidth, exportWidth);
      return pureCanvas;
    }

    const compositeCanvas = document.createElement('canvas');
    const scale = exportWidth / 600;
    const cardWidth = exportWidth;

    let headerHeight = 0;
    if (title.trim()) headerHeight += 44 * scale;
    if (subtitle.trim()) headerHeight += 28 * scale;

    let footerHeight = 0;
    if (showUrlText && url.trim()) footerHeight += 38 * scale;

    const qrSize = Math.round(cardWidth * 0.64);
    const paddingY = Math.round(40 * scale);
    const spacing = Math.round(18 * scale);

    const cardHeight = Math.round(paddingY * 2 + headerHeight + spacing + qrSize + spacing + footerHeight);

    compositeCanvas.width = cardWidth;
    compositeCanvas.height = cardHeight;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) throw new Error('Gagal context canvas');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    if (frameStyle === 'card' || frameStyle === 'tent') {
      const margin = 18 * scale;
      const innerW = cardWidth - margin * 2;
      const innerH = cardHeight - margin * 2;
      const radius = 20 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(margin, margin, innerW, innerH, radius);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
      ctx.stroke();

      if (frameStyle === 'tent') {
        ctx.beginPath();
        ctx.roundRect(margin, margin, innerW, 14 * scale, [radius, radius, 0, 0]);
        ctx.fillStyle = fgColor;
        ctx.fill();
      }
      ctx.restore();
    } else if (frameStyle === 'badge') {
      ctx.save();
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = fgColor;
      ctx.strokeRect(16 * scale, 16 * scale, cardWidth - 32 * scale, cardHeight - 32 * scale);
      ctx.restore();
    }

    let currentY = paddingY;
    const textColor = fgColor === '#ffffff' ? '#ffffff' : (bgColor === '#ffffff' ? '#0f172a' : fgColor);

    if (title.trim()) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(24 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxTitleWidth = cardWidth - (64 * scale);
      ctx.fillText(title.trim(), cardWidth / 2, currentY, maxTitleWidth);
      ctx.restore();
      currentY += (32 * scale);
    }

    if (subtitle.trim()) {
      ctx.save();
      ctx.fillStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#64748b';
      ctx.font = `500 ${Math.round(14 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxSubWidth = cardWidth - (64 * scale);
      ctx.fillText(subtitle.trim(), cardWidth / 2, currentY, maxSubWidth);
      ctx.restore();
      currentY += (22 * scale);
    }

    if (title.trim() || subtitle.trim()) {
      currentY += (12 * scale);
    }

    const qrX = Math.round((cardWidth - qrSize) / 2);
    const qrY = currentY;

    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(qrX - (10 * scale), qrY - (10 * scale), qrSize + (20 * scale), qrSize + (20 * scale), 12 * scale);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(rawQrCanvas, qrX, qrY, qrSize, qrSize);
    currentY += qrSize + (20 * scale);

    if (showUrlText && url.trim()) {
      ctx.save();
      ctx.fillStyle = fgColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#475569';
      ctx.font = `bold ${Math.round(12 * scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxUrlWidth = cardWidth - (64 * scale);
      ctx.fillText(url.trim(), cardWidth / 2, currentY, maxUrlWidth);
      ctx.restore();
    }

    return compositeCanvas;
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      Swal.fire('Perhatian', 'URL atau teks QR Code tidak boleh kosong', 'warning');
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
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses gambar', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!url.trim()) return;

    if (!navigator.clipboard || !window.ClipboardItem) {
      Swal.fire('Info', 'Browser tidak mendukung salin gambar ke clipboard.', 'info');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await generateCompositeCanvas(exportResolution);
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Gagal blob');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      Swal.fire('Gagal', 'Gagal menyalin gambar', 'error');
    }
  };

  const handlePrint = () => {
    if (!url.trim()) return;
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <QrCode size={24} className="text-brand-primary" /> QR Code Generator
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Buat dan unduh QR Code untuk tautan portal, formulir, atau shortlink.
          </p>
        </div>

        <button
          type="button"
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
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Grid: Preview (Urutan 1 di Mobile agar langsung terlihat) & Kontrol (Urutan 2 di Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

        {/* ============================================================== */}
        {/* PANEL PRATINJAU & AKSI: di Mobile tampil di atas (order-1)     */}
        {/* ============================================================== */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Pratinjau QR Code</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {exportResolution}px
              </span>
            </div>

            {/* Container Kartu yang Dirender & Dicetak */}
            <div
              ref={printAreaRef}
              id="print-area"
              className={`w-full max-w-[340px] transition-all flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl ${
                frameStyle === 'card'
                  ? 'border border-slate-200'
                  : frameStyle === 'badge'
                  ? 'border-2 border-slate-800'
                  : frameStyle === 'tent'
                  ? 'border-t-4 border-x border-b border-brand-primary'
                  : ''
              }`}
              style={{
                backgroundColor: bgColor,
                color: fgColor === '#ffffff' ? '#ffffff' : (bgColor === '#ffffff' ? '#0f172a' : fgColor)
              }}
            >
              {(title.trim() || subtitle.trim()) && (
                <div className="text-center mb-3 max-w-full px-2">
                  {title.trim() && (
                    <h4 className="text-sm sm:text-base font-bold tracking-tight leading-snug line-clamp-2">
                      {title}
                    </h4>
                  )}
                  {subtitle.trim() && (
                    <p
                      className="text-[11px] sm:text-xs font-medium mt-0.5 opacity-75 line-clamp-2"
                      style={{ color: fgColor === '#ffffff' ? '#ffffff' : undefined }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* QR Code Canvas */}
              <div
                ref={qrCanvasContainerRef}
                className="p-2 rounded-xl"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeCanvas
                  value={url.trim() || 'https://statistik.garutkab.go.id'}
                  size={190}
                  level="H"
                  bgColor={bgColor}
                  fgColor={fgColor}
                  imageSettings={
                    activeLogoSrc
                      ? {
                          src: activeLogoSrc,
                          x: undefined,
                          y: undefined,
                          height: 38,
                          width: 38,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {showUrlText && url.trim() && (
                <div className="mt-3 text-center max-w-full px-2">
                  <span
                    className="text-[10px] sm:text-[11px] font-mono font-medium block truncate max-w-[260px] opacity-75"
                    title={url}
                  >
                    {url}
                  </span>
                </div>
              )}
            </div>

            {/* Aksi Download / Copy / Print */}
            <div className="w-full space-y-2 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download size={16} />
                {isExporting ? 'Memproses...' : `Unduh PNG (${exportResolution}px)`}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {copiedSuccess ? (
                    <>
                      <FileCheck2 size={14} className="text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Salin Gambar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Cetak
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL PENGATURAN & INPUT: di Mobile tampil setelah Preview      */}
        {/* ============================================================== */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-4">

          {/* Form Bagian 1: Tautan & Konten */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <LinkIcon size={16} className="text-slate-500" /> Sumber Tautan
            </h3>

            {/* Pilihan Sumber Tautan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode('custom')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders size={13} /> URL Bebas
              </button>
              <button
                type="button"
                onClick={() => setInputMode('form')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'form'
                    ? 'bg-white text-brand-dark shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListChecks size={13} className="text-brand-primary" /> Formulir
              </button>
              <button
                type="button"
                onClick={() => setInputMode('shortlink')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'shortlink'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 size={13} className="text-blue-600" /> Shortlink
              </button>
              <button
                type="button"
                onClick={() => setInputMode('microsite')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'microsite'
                    ? 'bg-white text-brand-dark shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={13} className="text-emerald-600" /> Microsite
              </button>
            </div>

            {/* Quick-Select Formulir */}
            {inputMode === 'form' && (
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1.5">
                <label className="text-[11px] font-semibold text-teal-900 block">
                  Pilih Formulir Publik:
                </label>
                {isLoadingSources ? (
                  <div className="text-xs text-slate-400 py-1">Memuat formulir...</div>
                ) : formsList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-1">Belum ada formulir aktif.</div>
                ) : (
                  <select
                    className="w-full bg-white border border-teal-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    onChange={(e) => handleSelectForm(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih formulir --</option>
                    {formsList.map((f) => (
                      <option key={f.id} value={f.slug}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Quick-Select Shortlink */}
            {inputMode === 'shortlink' && (
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                <label className="text-[11px] font-semibold text-blue-900 block">
                  Pilih Shortlink:
                </label>
                {isLoadingSources ? (
                  <div className="text-xs text-slate-400 py-1">Memuat shortlink...</div>
                ) : shortlinksList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-1">Belum ada shortlink.</div>
                ) : (
                  <select
                    className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    onChange={(e) => handleSelectShortlink(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih shortlink --</option>
                    {shortlinksList.map((s) => (
                      <option key={s.id} value={s.short_code}>
                        /s/{s.short_code} ➔ {s.original_url.length > 40 ? s.original_url.substring(0, 40) + '...' : s.original_url}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Quick-Select Portal Microsite */}
            {inputMode === 'microsite' && (
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                <label className="text-[11px] font-semibold text-emerald-900 block">
                  Pilih Portal Microsite:
                </label>
                {isLoadingSources ? (
                  <div className="text-xs text-slate-400 py-1">Memuat portal microsite...</div>
                ) : micrositesList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-1">Belum ada portal microsite.</div>
                ) : (
                  <select
                    className="w-full bg-white border border-emerald-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    onChange={(e) => handleSelectMicrosite(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Pilih portal microsite --</option>
                    {micrositesList.map((m) => (
                      <option key={m.id} value={m.slug}>
                        {m.title} (/p/{m.slug})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Input URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-9 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary p-1"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Input Judul & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Judul (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Formulir Survei"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pindai untuk membuka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
            </div>

            {/* Checkbox Tampilkan URL Text */}
            <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUrlText}
                onChange={(e) => setShowUrlText(e.target.checked)}
                className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-xs text-slate-600">
                Tampilkan teks URL di bawah QR Code
              </span>
            </label>
          </div>

          {/* Form Bagian 2: Tampilan, Warna & Logo */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sliders size={16} className="text-slate-500" /> Gaya & Format
            </h3>

            {/* Bingkai Frame */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Model Bingkai:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'clean', label: 'Polos' },
                  { id: 'card', label: 'Kartu' },
                  { id: 'badge', label: 'Garis Tepi' },
                  { id: 'tent', label: 'Header Meja' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrameStyle(item.id as CardFrameStyle)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      frameStyle === item.id
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-dark font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Overlay */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Logo di Tengah QR Code
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLogo}
                    onChange={(e) => setUseLogo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              {useLogo && (
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoSource('default')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      logoSource === 'default'
                        ? 'bg-white border-brand-primary text-brand-dark font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <img src={defaultLogo} alt="Logo" className="w-4 h-4 object-contain" />
                    Pemkab
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoSource('gsd')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      logoSource === 'gsd'
                        ? 'bg-white border-brand-primary text-brand-dark font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <img src={gsdLogo} alt="Logo GSD" className="w-4 h-4 object-contain" />
                    Satu Data
                  </button>

                  <label className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    logoSource === 'custom'
                      ? 'bg-white border-brand-primary text-brand-dark font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <Upload size={13} />
                    <span>{customLogoUrl ? 'Logo Kustom' : 'Upload...'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomLogoUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Warna & Preset */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Warna QR Code:
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                      fgColor === preset.fg && bgColor === preset.bg
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-dark font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                      style={{ backgroundColor: preset.fg }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Titik QR</span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Latar</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Resolusi Unduhan */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Ukuran Unduhan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 512, label: '512 px', desc: 'Standar' },
                  { size: 1024, label: '1024 px', desc: 'Tajam' },
                  { size: 2048, label: '2048 px', desc: 'Cetak Besar' },
                ].map((res) => (
                  <button
                    key={res.size}
                    type="button"
                    onClick={() => setExportResolution(res.size)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      exportResolution === res.size
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-dark font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{res.label}</div>
                    <div className="text-[10px] text-slate-400">{res.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Style Print Sederhana */}
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
            width: 70% !important;
            border: 2px solid #000 !important;
            padding: 24px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default QrCodeGenerator;
