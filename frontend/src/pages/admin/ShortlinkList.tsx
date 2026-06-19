import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link as LinkIcon, Copy, Trash2, ExternalLink, Search, Loader2, MousePointerClick } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Shortlink {
  id: number;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: string;
}

const ShortlinkList: React.FC = () => {
  const [links, setLinks] = useState<Shortlink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Form
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDomain = window.location.origin;

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/links`);
      if (res.data.success) {
        setLinks(res.data.data);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal memuat data tautan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return Swal.fire('Peringatan', 'URL Asli wajib diisi!', 'warning');

    // Jika custom code kosong, buat otomatis (6 karakter acak)
    const finalCode = shortCode.trim() || Math.random().toString(36).substring(2, 8);

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/links`, {
        original_url: originalUrl,
        short_code: finalCode
      });
      
      Swal.fire('Berhasil', 'Tautan pendek berhasil dibuat!', 'success');
      setOriginalUrl('');
      setShortCode('');
      fetchLinks();
    } catch (error) {
      console.error(error);
      let msg = 'Gagal membuat tautan';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      Swal.fire('Gagal', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Tautan?',
      text: "Tautan ini tidak akan bisa diakses lagi!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/links/${id}`);
        Swal.fire('Terhapus', 'Tautan berhasil dihapus', 'success');
        fetchLinks();
      } catch {
        Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
      }
    }
  };

  const handleCopy = (code: string) => {
    const fullUrl = `${currentDomain}/s/${code}`;
    navigator.clipboard.writeText(fullUrl);
    Swal.fire({
      icon: 'success',
      title: 'Disalin!',
      text: 'Link berhasil disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const filteredLinks = links.filter(link => 
    link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black text-brand-dark tracking-tight flex items-center gap-3">
          <LinkIcon size={36} className="text-brand-primary" /> Pemendek Tautan
        </h1>
        <p className="text-slate-500 font-medium mt-1">Buat URL kustom yang rapi untuk dibagikan secara profesional.</p>
      </div>

      {/* Area Form Tambah Link */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">URL Asli (Tujuan)</label>
            <input 
              type="url" 
              placeholder="https://drive.google.com/file/d/..." 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary font-medium text-sm text-slate-700"
              value={originalUrl}
              onChange={e => setOriginalUrl(e.target.value)}
              required
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kustom Akhiran (Opsional)</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-brand-primary transition-colors">
              <span className="pl-4 text-xs font-bold text-slate-400 whitespace-nowrap">/s/</span>
              <input 
                type="text" 
                placeholder="laporan-juni" 
                className="w-full p-4 bg-transparent outline-none font-bold text-sm text-brand-primary"
                value={shortCode}
                onChange={e => setShortCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} // Hanya huruf, angka, strip
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-brand-dark text-white h-14 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg active:scale-95 disabled:opacity-70 whitespace-nowrap"
          >
            {isSubmitting ? 'Memproses...' : 'Buat Link'}
          </button>
        </form>
      </div>

      {/* Area Pencarian & Tabel */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 mb-6 w-full md:w-96">
        <Search size={18} className="text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Cari link..." 
          className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-6 text-center w-16">No</th>
                <th className="p-6">Tautan Pendek</th>
                <th className="p-6 w-1/3">Tujuan URL</th>
                <th className="p-6 text-center">Klik</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-primary mb-2" /> Memuat Data...</td></tr>
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link, i) => (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-6 text-center font-bold text-slate-400">{i + 1}</td>
                    <td className="p-6">
                      <div className="font-black text-brand-primary text-sm flex items-center gap-2">
                        {currentDomain}/s/{link.short_code}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Dibuat: {new Date(link.created_at).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="p-6">
                      <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-500 hover:text-brand-dark flex items-center gap-2 break-all line-clamp-2">
                        {link.original_url} <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black text-xs">
                        <MousePointerClick size={14} /> {link.clicks}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleCopy(link.short_code)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all" title="Salin Link">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleDelete(link.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Hapus Link">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-20 text-center font-bold text-slate-400">Belum ada tautan dibuat</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShortlinkList;