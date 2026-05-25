import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, LayoutGrid, List, 
  ChevronRight, Download, Eye, Image as ImageIcon,
  Activity, Clock, CalendarDays, TrendingUp, X, ChevronLeft, DownloadCloud
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

interface Kegiatan {
  id: number;
  tanggal: string;
  keterangan: string;
  gambar: string;
  tipe: string;
}

const KegiatanPage: React.FC = () => {
  const [allKegiatan, setAllKegiatan] = useState<Kegiatan[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // States untuk Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState('Semua');
  const [filterTahun, setFilterTahun] = useState('Semua');

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadKegiatan = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/kegiatan`);
        if (active) {
          setAllKegiatan(res.data.data);
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };
    loadKegiatan();
    return () => {
      active = false;
    };
  }, []);

  // Gunakan useMemo untuk menyaring kegiatan guna menghindari cascading renders
  const filteredKegiatan = useMemo(() => {
    let result = allKegiatan;

    if (filterTipe !== 'Semua') {
      result = result.filter(k => k.tipe.toLowerCase() === filterTipe.toLowerCase());
    }

    if (filterTahun !== 'Semua') {
      result = result.filter(k => new Date(k.tanggal).getFullYear().toString() === filterTahun);
    }

    if (searchTerm) {
      result = result.filter(k => 
        k.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [searchTerm, filterTipe, filterTahun, allKegiatan]);

  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image";
    return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const formatTanggal = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const forceDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire('Gagal', 'Tidak bisa mengunduh gambar secara langsung', 'error');
    }
  };

  const stats = {
    total: allKegiatan.length,
    bulanan: allKegiatan.filter(k => k.tipe?.toLowerCase() === 'bulanan').length,
    semesteran: allKegiatan.filter(k => k.tipe?.toLowerCase() === 'semesteran').length,
    tahunIni: allKegiatan.filter(k => new Date(k.tanggal).getFullYear() === 2026).length
  };

  // Navigasi Lightbox
  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === 0 ? allKegiatan.length - 1 : (prev ?? 0) - 1));
    }
  };

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === allKegiatan.length - 1 ? 0 : (prev ?? 0) + 1));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#001D1E] text-slate-800 dark:text-slate-100 pt-20 transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="bg-brand-dark text-white py-20 relative overflow-hidden transition-colors duration-300">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
            Kegiatan Bidang <span className="text-brand-primary">Statistik Sektoral</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-300 max-w-2xl text-lg leading-relaxed font-medium">
            Dokumentasi langkah nyata Dinas Komunikasi dan Informatika Kabupaten Garut dalam rangka penguatan implementasi Satu Data Daerah yang akurat dan terintegrasi.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary/10 blur-[100px] z-0"></div>
      </section>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        
        {/* STATISTIK RINGKAS DENGAN PROGRESS BAR MELINGKAR (SVG) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: 'Total Kegiatan', 
              val: stats.total, 
              icon: <Activity size={20} />, 
              color: 'text-blue-500', 
              bg: 'bg-blue-500/10',
              pct: stats.total > 0 ? 100 : 0
            },
            { 
              label: 'Bulanan', 
              val: stats.bulanan, 
              icon: <Clock size={20} />, 
              color: 'text-emerald-500', 
              bg: 'bg-emerald-500/10',
              pct: stats.total > 0 ? (stats.bulanan / stats.total) * 100 : 0
            },
            { 
              label: 'Semesteran', 
              val: stats.semesteran, 
              icon: <CalendarDays size={20} />, 
              color: 'text-amber-500', 
              bg: 'bg-amber-500/10',
              pct: stats.total > 0 ? (stats.semesteran / stats.total) * 100 : 0
            },
            { 
              label: 'Tahun 2026', 
              val: stats.tahunIni, 
              icon: <TrendingUp size={20} />, 
              color: 'text-purple-500', 
              bg: 'bg-purple-500/10',
              pct: stats.total > 0 ? (stats.tahunIni / stats.total) * 100 : 0
            },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-brand-dark p-6 rounded-[2.5rem] shadow-xl border border-white dark:border-white/5 flex items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{s.val}</h3>
                </div>
              </div>
              
              {/* Circular SVG Progress */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#f1f5f9" strokeWidth="4" fill="transparent" className="dark:stroke-white/5" />
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray={113.1}
                    strokeDashoffset={113.1 - (113.1 * s.pct) / 100}
                    className={`${s.color} transition-all duration-1000`} 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  {Math.round(s.pct)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTER KEGIATAN */}
        <div className="bg-white dark:bg-brand-dark p-6 rounded-4xl shadow-sm border border-slate-100 dark:border-white/5 mb-12 flex flex-wrap items-center gap-4 transition-colors duration-300">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama kegiatan..."
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#001D1E] text-slate-800 dark:text-white placeholder:text-slate-400 border-none outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
          <select 
            className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#001D1E] border-none outline-none focus:ring-2 focus:ring-brand-primary font-bold text-slate-600 dark:text-slate-300 text-sm cursor-pointer"
            onChange={(e) => setFilterTipe(e.target.value)}
            value={filterTipe}
          >
            <option value="Semua">Semua Tipe</option>
            <option value="Bulanan">Bulanan</option>
            <option value="Semesteran">Semesteran</option>
          </select>
          <select 
            className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#001D1E] border-none outline-none focus:ring-2 focus:ring-brand-primary font-bold text-slate-600 dark:text-slate-300 text-sm cursor-pointer"
            onChange={(e) => setFilterTahun(e.target.value)}
            value={filterTahun}
          >
            <option value="Semua">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* KEGIATAN TERBARU (CARD GRID) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-brand-dark dark:text-white uppercase tracking-tight">Eksplorasi Kegiatan</h2>
            <div className="flex bg-white dark:bg-brand-dark p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/5 gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18}/>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18}/>
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
              {filteredKegiatan.slice(0, 6).map((item) => (
                <div key={item.id} className="group bg-white dark:bg-brand-dark rounded-[2.5rem] p-4 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="relative h-56 rounded-4xl overflow-hidden mb-6 bg-slate-100 shrink-0">
                    <img src={getImageUrl(item.gambar)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-4 left-4 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider">
                      {item.tipe}
                    </span>
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-brand-primary font-bold text-xs mb-2">{formatTanggal(item.tanggal)}</p>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                        {item.keterangan}
                      </h3>
                    </div>
                    <button 
                      onClick={() => {
                        const idx = allKegiatan.findIndex(k => k.id === item.id);
                        if (idx !== -1) setLightboxIndex(idx);
                      }}
                      className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest group-hover:text-brand-primary transition-all mt-4 w-fit cursor-pointer"
                    >
                      Detail Kegiatan <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKegiatan.slice(0, 6).map((item) => (
                <div key={item.id} className="group bg-white dark:bg-brand-dark p-5 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-xl transition-all duration-300">
                  <img src={getImageUrl(item.gambar)} alt="" className="w-full sm:w-48 h-32 object-cover rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{item.tipe}</span>
                        <span className="text-xs font-bold text-slate-400">{formatTanggal(item.tanggal)}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">{item.keterangan}</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const idx = allKegiatan.findIndex(k => k.id === item.id);
                        if (idx !== -1) setLightboxIndex(idx);
                      }}
                      className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-widest group-hover:text-brand-primary transition-all mt-4 w-fit cursor-pointer"
                    >
                      Buka Detail <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REKAPAN TABEL KEGIATAN */}
        <div className="bg-white dark:bg-brand-dark rounded-4xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden mb-20 transition-colors duration-300">
          <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-black text-brand-dark dark:text-white uppercase tracking-tight">Daftar Rekapitulasi</h2>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all cursor-pointer">
              <Download size={16} /> Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-[#001D1E]/40 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">No</th>
                  <th className="px-8 py-6">Hari / Tanggal</th>
                  <th className="px-8 py-6">Nama Kegiatan</th>
                  <th className="px-8 py-6">Tipe</th>
                  <th className="px-8 py-6 text-center">Dokumentasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filteredKegiatan.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{formatTanggal(item.tanggal).split(',')[0]}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{formatTanggal(item.tanggal).split(',')[1]}</div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-800 dark:text-slate-200 max-w-xs">{item.keterangan}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.tipe === 'bulanan' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => {
                          const originalIdx = allKegiatan.findIndex(k => k.id === item.id);
                          if (originalIdx !== -1) setLightboxIndex(originalIdx);
                        }}
                        className="p-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-brand-primary hover:text-white transition-all cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GALERI DOKUMENTASI */}
        <div className="pb-24">
          <div className="flex items-center gap-4 mb-10">
            <ImageIcon className="text-brand-primary" size={32} />
            <h2 className="text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tighter">Galeri Visual</h2>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {allKegiatan.map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => setLightboxIndex(idx)}
                className="relative group overflow-hidden rounded-4xl cursor-pointer break-inside-avoid shadow-md hover:shadow-2xl border border-slate-200/30 dark:border-white/5 transition-all duration-300"
              >
                <img 
                  src={getImageUrl(item.gambar)} 
                  alt="" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-brand-dark/70 dark:bg-brand-dark/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-white text-xs font-black leading-relaxed">{item.keterangan}</p>
                    <span className="inline-block mt-3 text-[9px] font-black uppercase tracking-wider text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full">{item.tipe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PREMIUM LIGHTBOX GALLERY MODAL */}
      {lightboxIndex !== null && allKegiatan[lightboxIndex] && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/95 dark:bg-[#001415]/98 p-4 md:p-10 backdrop-blur-md animate-in fade-in duration-300 text-left">
          
          {/* Tombol Tutup */}
          <button 
            onClick={() => setLightboxIndex(null)} 
            className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/15 rounded-full text-white/70 hover:text-white transition-all z-50 cursor-pointer"
          >
            <X size={28} />
          </button>

          {/* Tombol Navigasi Kiri */}
          <button 
            onClick={handlePrev} 
            className="absolute left-4 p-3.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all z-50 cursor-pointer"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Konten Lightbox */}
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sisi Gambar */}
            <div className="lg:col-span-8 flex justify-center items-center relative rounded-4xl overflow-hidden border border-white/5 bg-slate-900/40">
              <img 
                src={getImageUrl(allKegiatan[lightboxIndex].gambar)} 
                alt="Lightbox Visual" 
                className="max-h-[70vh] max-w-full object-contain rounded-2xl" 
              />
            </div>

            {/* Sisi Deskripsi */}
            <div className="lg:col-span-4 bg-white/5 dark:bg-white/5 p-8 rounded-4xl border border-white/10 text-white backdrop-blur-xl space-y-6">
              <div>
                <span className="inline-block bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
                  {allKegiatan[lightboxIndex].tipe}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Kegiatan</p>
                <p className="text-sm font-bold text-brand-primary mt-1">{formatTanggal(allKegiatan[lightboxIndex].tanggal)}</p>
              </div>

              <div className="h-px bg-white/10"></div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi Kegiatan</p>
                <h3 className="text-lg font-bold leading-relaxed text-slate-200">
                  {allKegiatan[lightboxIndex].keterangan}
                </h3>
              </div>

              <div className="h-px bg-white/10"></div>

              <button 
                onClick={() => forceDownloadImage(getImageUrl(allKegiatan[lightboxIndex].gambar), `GarutSatuData_${allKegiatan[lightboxIndex].id}.jpg`)}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-brand-dark font-black text-xs py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
              >
                <DownloadCloud size={18} /> UNDUH FOTO SEKARANG
              </button>
            </div>
          </div>

          {/* Tombol Navigasi Kanan */}
          <button 
            onClick={handleNext} 
            className="absolute right-4 p-3.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all z-50 cursor-pointer"
          >
            <ChevronRight size={28} />
          </button>

        </div>
      )}
    </div>
  );
};

export default KegiatanPage;