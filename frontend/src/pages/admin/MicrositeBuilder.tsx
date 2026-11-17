import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListChecks,
  Link as LinkIcon,
  ExternalLink,
  Heading,
  Loader2,
  Smartphone,
  Palette,
  Lock,
  Eye
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import {
  type MicrositeLinkItem,
  type MicrositeItemType,
  type MicrositeThemeId,
  type MicrositeLogoType,
  MICROSITE_THEMES,
  MICROSITE_ICON_OPTIONS,
  renderMicrositeIcon
} from '../../utils/micrositeConfig';
import pemkabLogo from '../../assets/images/logo.png';
import gsdLogo from '../../assets/images/logo-gsd.png';

interface FormSourceItem {
  id: number;
  title: string;
  slug: string;
  is_active: number;
}

interface ShortlinkSourceItem {
  id: number;
  short_code: string;
  original_url: string;
}

const MicrositeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Portal Metadata
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Tema & Logo
  const [themeId, setThemeId] = useState<MicrositeThemeId>('toska');
  const [logoType, setLogoType] = useState<MicrositeLogoType>('pemkab');

  // Daftar Tombol / Seksi
  const [linksItem, setLinksItem] = useState<MicrositeLinkItem[]>([]);

  // Sumber Data Form & Shortlink
  const [formsList, setFormsList] = useState<FormSourceItem[]>([]);
  const [shortlinksList, setShortlinksList] = useState<ShortlinkSourceItem[]>([]);

  // State Loading
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // Ambil daftar Formulir & Shortlink
  useEffect(() => {
    const fetchSources = async () => {
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
        console.error('Gagal memuat data sumber:', err);
      }
    };
    fetchSources();
  }, []);

  // Ambil data Microsite jika Edit Mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/microsites/id/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data?.success) {
          const data = res.data.data;
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setIsSlugManuallyEdited(true);
          setDescription(data.description || '');
          setIsActive(data.is_active !== 0);
          setThemeId(data.theme_config?.theme || 'toska');
          setLogoType(data.theme_config?.logo || 'pemkab');
          setLinksItem(Array.isArray(data.links_item) ? data.links_item : []);
        }
      } catch (err) {
        console.error('Gagal memuat detail microsite:', err);
        Swal.fire('Error', 'Gagal memuat detail portal microsite', 'error');
        navigate('/admin/microsites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id, isEditMode, navigate]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode && !isSlugManuallyEdited) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(autoSlug);
    }
  };

  const addItem = (type: MicrositeItemType) => {
    const newItem: MicrositeLinkItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title: type === 'header' ? 'Kategori Baru' : '',
      url: '',
      icon: type === 'form' ? 'ClipboardList' : type === 'shortlink' ? 'Link' : 'ExternalLink',
      badge: '',
      is_active: true
    };
    setLinksItem((prev) => [...prev, newItem]);
  };

  const updateItem = (itemId: string, patch: Partial<MicrositeLinkItem>) => {
    setLinksItem((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setLinksItem((prev) => prev.filter((item) => item.id !== itemId));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= linksItem.length) return;
    setLinksItem((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      Swal.fire('Perhatian', 'Judul portal dan custom slug wajib diisi!', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        is_active: isActive ? 1 : 0,
        theme_config: {
          theme: themeId,
          logo: logoType
        },
        links_item: linksItem
      };

      if (isEditMode && id) {
        await axios.put(`${API_BASE_URL}/api/microsites/${id}`, payload, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: 'Perubahan portal microsite telah disimpan.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/microsites`, payload, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Portal Dibuat!',
          text: 'Portal microsite baru siap digunakan.',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/admin/microsites');
      }
    } catch (err) {
      let msg = 'Gagal menyimpan portal microsite';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      Swal.fire('Gagal', msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const previewTheme = MICROSITE_THEMES[themeId] || MICROSITE_THEMES.toska;
  const previewLogoSrc = logoType === 'pemkab' ? pemkabLogo : logoType === 'gsd' ? gsdLogo : null;

  if (isLoading) {
    return (
      <div className="p-10 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
        <p className="text-sm font-bold text-slate-500">Memuat editor portal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/microsites')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-dark hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
              {isEditMode ? 'Edit Portal Microsite' : 'Buat Portal Microsite Baru'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Susun tautan formulir, shortlink, dan materi dalam satu halaman Linktree kedinasan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {isEditMode && slug && (
            <button
              type="button"
              onClick={() => window.open(`/p/${slug}`, '_blank')}
              className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Eye size={16} /> Lihat Publik
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Portal'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* KOLOM KIRI: EDITOR (7 Kolom) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* Bagian 1: Identitas & Slug Portal */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                1. Informasi Portal
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600">
                  {isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Judul Portal / Nama Acara <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: FGD Pembinaan Statistik Sektoral 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-brand-primary"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Custom Slug URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-brand-primary focus-within:bg-white">
                <span className="px-3 py-3 text-xs font-mono font-bold text-slate-400 bg-slate-100 border-r border-slate-200 shrink-0">
                  {currentOrigin ? `${currentOrigin}/p/` : '/p/'}
                </span>
                <input
                  type="text"
                  placeholder="fgd-statistik-2026"
                  className="w-full bg-transparent p-3 text-xs font-mono font-bold text-slate-800 outline-none"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Portal tautan resmi daftar hadir, materi paparan, dan kuesioner evaluasi peserta."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-brand-primary resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Bagian 2: Tema & Logo */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette size={16} className="text-brand-primary" /> 2. Tema & Logo Header
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Pilihan Logo:</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'pemkab', label: 'Pemkab Garut', img: pemkabLogo },
                  { id: 'gsd', label: 'Garut Satu Data', img: gsdLogo },
                  { id: 'none', label: 'Tanpa Logo', img: null }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLogoType(opt.id as MicrositeLogoType)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      logoType === opt.id
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-dark ring-1 ring-brand-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.img ? (
                      <img src={opt.img} alt={opt.label} className="w-7 h-7 object-contain" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                        —
                      </div>
                    )}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Preset Tema Visual:</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(MICROSITE_THEMES) as MicrositeThemeId[]).map((key) => {
                  const t = MICROSITE_THEMES[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemeId(key)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        themeId === key
                          ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg shrink-0 ${t.previewSwatch}`} />
                      <span className="text-xs font-bold text-slate-800">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bagian 3: Daftar Tombol Tautan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                3. Daftar Tautan & Tombol ({linksItem.length})
              </h2>
            </div>

            {/* Tombol Tambah Item (4 Tipe) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => addItem('form')}
                className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ListChecks size={15} /> + Formulir
              </button>
              <button
                type="button"
                onClick={() => addItem('shortlink')}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LinkIcon size={15} /> + Shortlink
              </button>
              <button
                type="button"
                onClick={() => addItem('external')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink size={15} /> + Tautan Bebas
              </button>
              <button
                type="button"
                onClick={() => addItem('header')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heading size={15} /> + Pemisah Seksi
              </button>
            </div>

            {/* List Item Editor */}
            {linksItem.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <Plus className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-xs font-bold text-slate-500">
                  Belum ada tombol tautan. Klik salah satu tombol di atas untuk menambahkan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {linksItem.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      item.is_active
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-slate-100/60 border-slate-200 opacity-70'
                    }`}
                  >
                    {/* Item Header Controls */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                        {item.type === 'form'
                          ? 'Formulir Publik'
                          : item.type === 'shortlink'
                          ? 'Shortlink'
                          : item.type === 'header'
                          ? 'Pemisah Seksi'
                          : 'Tautan Bebas'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.type !== 'header' && (
                          <label className="flex items-center gap-1.5 mr-2 cursor-pointer text-[11px] font-bold text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.is_active}
                              onChange={(e) => updateItem(item.id, { is_active: e.target.checked })}
                              className="rounded text-brand-primary"
                            />
                            Tampil
                          </label>
                        )}

                        <button
                          type="button"
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Geser Atas"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === linksItem.length - 1}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          title="Geser Bawah"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                          title="Hapus Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Tipe: Header / Pemisah */}
                    {item.type === 'header' ? (
                      <input
                        type="text"
                        placeholder="Contoh: Daftar Hadir & Evaluasi"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-primary"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      />
                    ) : (
                      <div className="space-y-2.5">
                        {/* Dropdown Quick Select jika form atau shortlink */}
                        {item.type === 'form' && (
                          <select
                            className="w-full bg-white border border-teal-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-teal-500"
                            value={item.form_slug || ''}
                            onChange={(e) => {
                              const selected = formsList.find((f) => f.slug === e.target.value);
                              if (selected) {
                                updateItem(item.id, {
                                  form_slug: selected.slug,
                                  title: item.title || selected.title,
                                  url: `/form/${selected.slug}`
                                });
                              }
                            }}
                          >
                            <option value="" disabled>-- Pilih Formulir Publik --</option>
                            {formsList.map((f) => (
                              <option key={f.id} value={f.slug}>
                                {f.title} ({f.is_active === 0 ? 'Nonaktif' : 'Aktif'})
                              </option>
                            ))}
                          </select>
                        )}

                        {item.type === 'shortlink' && (
                          <select
                            className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.short_code || ''}
                            onChange={(e) => {
                              const selected = shortlinksList.find((s) => s.short_code === e.target.value);
                              if (selected) {
                                updateItem(item.id, {
                                  short_code: selected.short_code,
                                  title: item.title || `Tautan /s/${selected.short_code}`,
                                  url: `/s/${selected.short_code}`
                                });
                              }
                            }}
                          >
                            <option value="" disabled>-- Pilih Shortlink --</option>
                            {shortlinksList.map((s) => (
                              <option key={s.id} value={s.short_code}>
                                /s/{s.short_code} ➔ {s.original_url.slice(0, 45)}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            placeholder="Judul Tombol"
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-primary"
                            value={item.title}
                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="https://... atau /form/..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-700 outline-none focus:border-brand-primary"
                            value={item.url}
                            onChange={(e) => updateItem(item.id, { url: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none"
                            value={item.icon || 'ExternalLink'}
                            onChange={(e) => updateItem(item.id, { icon: e.target.value })}
                          >
                            {MICROSITE_ICON_OPTIONS.map((ic) => (
                              <option key={ic.id} value={ic.id}>
                                Ikon: {ic.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Badge (opsional: Wajib / Baru)"
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-primary"
                            value={item.badge || ''}
                            onChange={(e) => updateItem(item.id, { badge: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* KOLOM KANAN: LIVE MOBILE PREVIEW (5 Kolom) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            <Smartphone size={15} className="text-brand-primary" /> Live Mobile Preview
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="w-full max-w-[340px] rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="h-5 bg-slate-900 flex items-center justify-center">
              <div className="w-20 h-3 bg-slate-800 rounded-full" />
            </div>

            {/* Viewport Screen */}
            <div className={`h-[560px] overflow-y-auto px-4 py-6 ${previewTheme.pageBg} flex flex-col items-center justify-between`}>
              <div className="w-full flex flex-col items-center">
                {previewLogoSrc && (
                  <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-md mb-3 flex items-center justify-center">
                    <img src={previewLogoSrc} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}

                <h3 className={`text-base font-black text-center leading-snug ${previewTheme.titleColor}`}>
                  {title || 'Judul Portal Kegiatan'}
                </h3>
                {(description || !title) && (
                  <p className={`text-[11px] text-center mt-1.5 leading-relaxed ${previewTheme.descColor}`}>
                    {description || 'Deskripsi singkat acara atau portal informasi akan tampil di sini.'}
                  </p>
                )}

                <div className="w-full space-y-2.5 mt-5">
                  {linksItem.map((item) => {
                    if (item.type === 'header') {
                      return (
                        <div
                          key={item.id}
                          className={`pt-2 pb-1 text-center text-[10px] font-extrabold uppercase tracking-widest border-b ${previewTheme.headerTextColor}`}
                        >
                          {item.title || 'Seksi'}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className={`w-full rounded-xl p-3 flex items-center justify-between gap-2 ${previewTheme.buttonBg} ${
                          !item.is_active ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${previewTheme.iconBoxBg} ${previewTheme.iconColor}`}>
                            {renderMicrositeIcon(item.icon, 15)}
                          </div>
                          <span className={`text-xs font-bold truncate ${previewTheme.buttonText}`}>
                            {item.title || 'Tombol Tautan'}
                          </span>
                        </div>

                        {!item.is_active ? (
                          <Lock size={13} className="text-slate-400 shrink-0" />
                        ) : (
                          item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${previewTheme.badgeBg}`}>
                              {item.badge}
                            </span>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`text-[9px] text-center mt-6 pt-3 ${previewTheme.footerText}`}>
                Diskominfo Kab. Garut
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MicrositeBuilder;
