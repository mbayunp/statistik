import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Maximize2, 
  X, 
  DownloadCloud, 
  Calendar, 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'; 
import ModalKegiatan from './ModalKegiatan';
import { API_BASE_URL } from '../../config';

interface KegiatanItem {
  id: number;
  tanggal: string;
  keterangan?: string;
  nama_kegiatan?: string;
  gambar?: string;
  dokumentasi?: string;
}

const BASE_URL = API_BASE_URL;

const KegiatanPublik: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<KegiatanItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<KegiatanItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 1. Fungsi Fetch Data
  const fetchKegiatan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/kegiatan`);
      const resData = res.data.data || res.data;
      setKegiatan(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: 'Tidak dapat mengambil data dari server.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  // 2. Helper URL Gambar
  const getImageUrl = (path?: string) => {
    if (!path) return "https://placehold.co/600x400?text=Tanpa+Gambar";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
  };

  // 3. Fungsi Hapus Data
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Kegiatan?',
      text: "Data akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
        try {
          await axios.delete(`${BASE_URL}/api/kegiatan/${id}`);
          Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1500, showConfirmButton: false });
          fetchKegiatan();
        } catch {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    });
  };

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch { return dateStr; }
  };

  // ================= LOGIKA PAGINATION =================
  const totalPages = Math.ceil(kegiatan.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = kegiatan.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
          <div>
            <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
              <ImageIcon className="text-brand-primary" size={32} />
              Publikasi Kegiatan
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Kelola dokumentasi visual untuk beranda website.</p>
          </div>
          <button 
            onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
            className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} /> Tambah Kegiatan
          </button>
        </div>

        {/* === FILTER BARS === */}
        <div className="flex justify-end mb-6">
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
             <span className="text-[10px] font-black text-slate-400 uppercase">Baris:</span>
             <select 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer" 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
          </div>
        </div>

        {/* === DATA TABLE === */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-16 text-center">No</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-56">Waktu Pelaksanaan</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Judul / Keterangan</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-72 text-center">Preview Foto</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={5} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                        <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat Data...</p>
                     </td>
                   </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    const displayKeterangan = item.keterangan || item.nama_kegiatan || "Tanpa Keterangan";
                    const displayGambar = item.gambar || item.dokumentasi;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        
                        {/* Kolom Nomor Urut Dinamis */}
                        <td className="p-6 align-top text-center font-black text-slate-400 text-sm">
                          {indexOfFirstItem + index + 1}
                        </td>

                        <td className="p-6 align-top">
                          <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase">
                            <Calendar size={14} className="text-slate-400" />
                            {formatTanggalIndo(item.tanggal)}
                          </div>
                        </td>
                        <td className="p-6 align-top text-sm text-slate-600 leading-relaxed font-medium">
                          {displayKeterangan}
                        </td>
                        <td className="p-6 align-top text-center">
                          <div 
                            onClick={() => setPreviewImage(getImageUrl(displayGambar))}
                            className="relative inline-block w-full h-32 rounded-2xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm group/img bg-slate-100"
                          >
                            <img 
                              src={getImageUrl(displayGambar)} 
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                              alt="Dokumentasi" 
                              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Gambar+Tidak+Ada"; }}
                            />
                            <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                              <Maximize2 className="text-white" size={24} />
                            </div>
                          </div>
                        </td>
                        <td className="p-6 align-top">
                          <div className="flex flex-col gap-2">
                            <button onClick={() => { setSelectedData(item); setIsModalOpen(true); }} className="w-full p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center border border-blue-100 shadow-sm"><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete(item.id)} className="w-full p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex justify-center border border-red-100 shadow-sm"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                       <Search className="mx-auto mb-4 opacity-20" size={48} />
                       Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === PAGINATION === */}
        {kegiatan.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Halaman {currentPage} dari {totalPages || 1} — Total {kegiatan.length} Publikasi
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
          </div>
        )}

      </main>

      <ModalKegiatan 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchKegiatan}
        data={selectedData} 
      />

      {previewImage && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-brand-dark/95 backdrop-blur-md p-6">
          <button onClick={() => setPreviewImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 p-3 rounded-full transition-all"><X size={32} /></button>
          <div className="max-w-4xl w-full flex flex-col items-center animate-in zoom-in duration-300">
            <img src={previewImage} className="max-w-full max-h-[75vh] object-contain rounded-3xl shadow-2xl border border-white/10" alt="Preview" />
            <div className="flex gap-4 mt-8">
               <a href={previewImage} download className="flex items-center gap-3 bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all"><DownloadCloud size={20} /> Unduh</a>
               <button onClick={() => setPreviewImage(null)} className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanPublik;