import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Search, LayoutGrid, List, 
  ChevronRight, Download, Eye, Image as ImageIcon,
  Activity, Clock, CalendarDays, TrendingUp
} from 'lucide-react';
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
  const [filteredKegiatan, setFilteredKegiatan] = useState<Kegiatan[]>([]);

  
  // States untuk Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState('Semua');
  const [filterTahun, setFilterTahun] = useState('Semua');

  const fetchData = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan`);
      setAllKegiatan(res.data.data);
      setFilteredKegiatan(res.data.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => { fetchData(); }, 0);
  }, [fetchData]);

  useEffect(() => {
    setTimeout(() => {
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

      setFilteredKegiatan(result);
    }, 0);
  }, [searchTerm, filterTipe, filterTahun, allKegiatan]);

  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image";
    return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const stats = {
    total: allKegiatan.length,
    bulanan: allKegiatan.filter(k => k.tipe?.toLowerCase() === 'bulanan').length,
    semesteran: allKegiatan.filter(k => k.tipe?.toLowerCase() === 'semesteran').length,
    tahunIni: allKegiatan.filter(k => new Date(k.tanggal).getFullYear() === 2026).length
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      
      {/* HERO SECTION */}
      <section className="bg-brand-dark text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
            Kegiatan Bidang <span className="text-brand-primary">Statistik Sektoral</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Dokumentasi langkah nyata Dinas Komunikasi dan Informatika Kabupaten Garut dalam rangka penguatan implementasi Satu Data Daerah yang akurat dan terintegrasi.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary/10 blur-[100px] z-0"></div>
      </section>

      <div className="container mx-auto px-6 -mt-10 relative z-20">
        
        {/* STATISTIK RINGKAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Kegiatan', val: stats.total, icon: <Activity />, color: 'blue' },
            { label: 'Bulanan', val: stats.bulanan, icon: <Clock />, color: 'emerald' },
            { label: 'Semesteran', val: stats.semesteran, icon: <CalendarDays />, color: 'amber' },
            { label: 'Tahun 2026', val: stats.tahunIni, icon: <TrendingUp />, color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-4xl shadow-xl shadow-slate-200/50 flex items-center gap-5 border border-white">
              <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                {React.cloneElement(s.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{s.val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* FILTER KEGIATAN */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12 flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama kegiatan..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-primary transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-primary font-bold text-slate-600"
            onChange={(e) => setFilterTipe(e.target.value)}
          >
            <option value="Semua">Semua Tipe</option>
            <option value="Bulanan">Bulanan</option>
            <option value="Semesteran">Semesteran</option>
          </select>
          <select 
            className="px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-primary font-bold text-slate-600"
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            <option value="Semua">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* KEGIATAN TERBARU (CARD GRID) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Eksplorasi Kegiatan</h2>
            <div className="flex gap-2">
              <button className="p-3 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20"><LayoutGrid size={20}/></button>
              <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><List size={20}/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredKegiatan.slice(0, 6).map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="relative h-56 rounded-4xl overflow-hidden mb-6">
                  <img src={getImageUrl(item.gambar)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {item.tipe}
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <p className="text-brand-primary font-bold text-xs mb-2">{formatTanggal(item.tanggal)}</p>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                    {item.keterangan}
                  </h3>
                  <button className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest group-hover:text-brand-primary transition-all">
                    Detail Kegiatan <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REKAPAN TABEL KEGIATAN */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-20">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Daftar Rekapitulasi</h2>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
              <Download size={16} /> Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">No</th>
                  <th className="px-8 py-6">Hari / Tanggal</th>
                  <th className="px-8 py-6">Nama Kegiatan</th>
                  <th className="px-8 py-6">Tipe</th>
                  <th className="px-8 py-6 text-center">Dokumentasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredKegiatan.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-700">{formatTanggal(item.tanggal).split(',')[0]}</div>
                      <div className="text-xs text-slate-400">{formatTanggal(item.tanggal).split(',')[1]}</div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-800 max-w-xs">{item.keterangan}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.tipe === 'bulanan' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => window.open(getImageUrl(item.gambar), '_blank')}
                        className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-brand-primary hover:text-white transition-all"
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
            <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Galeri Visual</h2>
          </div>
          <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {allKegiatan.map((item) => (
              <div key={item.id} className="relative group overflow-hidden rounded-4xl cursor-pointer break-inside-avoid">
                <img 
                  src={getImageUrl(item.gambar)} 
                  alt="" 
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 text-center">
                  <p className="text-white text-xs font-bold leading-relaxed">{item.keterangan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KegiatanPage;