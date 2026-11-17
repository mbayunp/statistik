import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  LayoutGrid,
  Plus,
  Search,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  QrCode,
  Eye,
  Loader2,
  Inbox,
  Link2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { type MicrositeData } from '../../utils/micrositeConfig';

const MicrositeList: React.FC = () => {
  const navigate = useNavigate();
  const [microsites, setMicrosites] = useState<MicrositeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const fetchMicrosites = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/microsites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.success) {
        setMicrosites(res.data.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat portal microsite:', error);
      Swal.fire('Error', 'Gagal memuat daftar portal microsite', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMicrosites();
  }, []);

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${currentOrigin}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    Swal.fire({
      icon: 'success',
      title: 'Tautan Disalin!',
      text: fullUrl,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = async (id?: number, title?: string) => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Hapus Portal Microsite?',
      text: `Portal "${title}" beserta seluruh tombol tautannya akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/microsites/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Portal microsite berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false
        });
        fetchMicrosites();
      } catch (error) {
        console.error(error);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus portal', 'error');
      }
    }
  };

  const filteredList = microsites.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <LayoutGrid size={34} className="text-brand-primary" /> Portal Microsite
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Kelola halaman portal tautan terpusat (Linktree kedinasan) untuk kegiatan, rapat, dan acara.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/microsites/buat')}
          className="bg-brand-dark text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={18} /> Buat Portal Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 mb-6 w-full md:w-96">
        <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Cari judul portal atau slug..."
          className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-xs">
          <Loader2 className="animate-spin mx-auto text-brand-primary mb-2" size={32} />
          <p className="text-sm font-bold text-slate-500">Memuat daftar portal microsite...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs">
          <Inbox className="mx-auto text-slate-300 mb-3" size={44} />
          <h3 className="font-black text-slate-700 text-lg">Belum Ada Portal Microsite</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Buat portal microsite pertama Anda untuk mengumpulkan tautan absensi, materi, dan survei dalam satu halaman.
          </p>
          <button
            onClick={() => navigate('/admin/microsites/buat')}
            className="bg-brand-primary text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-brand-dark transition-colors cursor-pointer"
          >
            <Plus size={16} /> Buat Portal Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const isActive = item.is_active !== 0 && item.is_active !== false;
            const linkCount = Array.isArray(item.links_item)
              ? item.links_item.filter((l) => l.type !== 'header').length
              : 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <Eye size={14} className="text-brand-primary" />
                      <span>{item.view_count || 0}</span>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-800 text-lg leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-brand-primary font-bold mt-1 truncate">
                    /p/{item.slug}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Card Stats */}
                <div className="px-6 py-3 bg-slate-50/70 border-y border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-600">
                    <Link2 size={14} className="text-slate-400" /> {linkCount} Tautan
                  </span>
                  <button
                    onClick={() => handleCopyLink(item.slug)}
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={13} /> Salin Link
                  </button>
                </div>

                {/* Card Actions */}
                <div className="p-4 grid grid-cols-4 gap-1.5 mt-auto">
                  <button
                    onClick={() => navigate(`/admin/microsites/edit/${item.id}`)}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Edit Portal"
                  >
                    <Edit3 size={17} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                  </button>

                  <button
                    onClick={() => window.open(`/p/${item.slug}`, '_blank')}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Buka Halaman Publik"
                  >
                    <ExternalLink size={17} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Buka</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/qr-generator?url=${encodeURIComponent(`${currentOrigin}/p/${item.slug}`)}&title=${encodeURIComponent(item.title)}&subtitle=${encodeURIComponent('Pindai untuk membuka Portal Kegiatan')}`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer"
                    title="Buat QR Code"
                  >
                    <QrCode size={17} />
                    <span className="text-[9px] font-black uppercase tracking-wider">QR Code</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    title="Hapus Portal"
                  >
                    <Trash2 size={17} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MicrositeList;
