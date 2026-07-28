import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Database, 
  BarChart3, 
  CheckCircle, 
  Search, 
  ArrowRight, 
  Instagram, 
  Activity,
  PieChart,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config';

interface Kegiatan {
  id: number;
  tanggal: string;
  nama_kegiatan: string;
  dokumentasi: string;
  tipe: 'bulanan' | 'semesteran' | string;
}

interface RawKegiatan {
  id: number;
  tanggal: string;
  keterangan: string;
  gambar: string;
  tipe?: string;
}

interface PengaturanData {
  jumlah_penduduk: number;
  jumlah_kepala_keluarga: number;
  jumlah_laki: number;
  jumlah_perempuan: number;
  permohonan_data: string;
  sumber: string;
}

interface GarutSatuDataStats {
  dataset: number;
  data: number;
  visualisasi: number;
  infografis: number;
}

const Beranda: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  
  // State statistik dinamis dari API Garut Satu Data
  const [statsData, setStatsData] = useState<GarutSatuDataStats>({
    dataset: 0,      
    data: 0,        
    visualisasi: 0,    
    infografis: 0   
  });

  // State data kependudukan (diambil dinamis dari API pengaturan)
  const [pengaturan, setPengaturan] = useState<PengaturanData>({
    jumlah_penduduk: 0,
    jumlah_kepala_keluarga: 0,
    jumlah_laki: 0,
    jumlah_perempuan: 0,
    permohonan_data: '0',
    sumber: ''
  });

  const datasetGrowth = [
    { tahun: '2021', dataset: 35 },
    { tahun: '2022', dataset: 58 },
    { tahun: '2023', dataset: 82 },
    { tahun: '2024', dataset: 104 },
    { tahun: '2025', dataset: 120 },
  ];

  useEffect(() => {
    // 1. Ambil Dokumentasi Kegiatan internal
    axios.get(`${API_BASE_URL}/api/kegiatan`)
      .then(res => {
        const rawData: RawKegiatan[] = res.data.data || [];
        const mappedData: Kegiatan[] = rawData.map((item: RawKegiatan) => ({
          id: item.id,
          tanggal: item.tanggal,
          nama_kegiatan: item.keterangan,
          dokumentasi: item.gambar,
          tipe: item.tipe || 'BULANAN'
        }));

        const sorted = mappedData.sort((a: Kegiatan, b: Kegiatan) => 
          new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );

        setKegiatan(sorted.slice(0, 3));
      })
      .catch(err => console.error("Gagal menarik data kegiatan internal:", err));

    // 2. Ambil data gabungan dari API eksternal
    const fetchCountsAndPengaturan = async () => {
      try {
        const [resPengaturan, resCount] = await Promise.all([
          axios.get('/api-garut/api/pengaturan').catch(() => axios.get('https://satudata-api.garutkab.go.id/api/pengaturan')).catch(() => ({ data: null })),
          axios.get('/api-garut/api/count').catch(() => axios.get('https://satudata-api.garutkab.go.id/api/count')).catch(() => ({ data: null }))
        ]);
        
        if (resCount && resCount.data) {
          const apiStats = typeof resCount.data.dataset !== 'undefined' ? resCount.data : (resCount.data.data || resCount.data);
          
          setStatsData({
            dataset: Number(apiStats.dataset) || 0,
            data: Number(apiStats.data) || 0,
            visualisasi: Number(apiStats.visualisasi) || 0,
            infografis: Number(apiStats.infografis) || 0
          });
        }

        if (resPengaturan && resPengaturan.data) {
          const pengObj = resPengaturan.data.data || resPengaturan.data;
          if (pengObj && pengObj.jumlah_penduduk) {
            setPengaturan(pengObj);
          }
        }
      } catch (e) {
        console.error("Gagal menyinkronkan data gabungan:", e);
      }
    };

    fetchCountsAndPengaturan();
  }, []);

  const formatTanggal = (dateString: string) => {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getImageUrl = (pathFromDb: string) => {
    if (!pathFromDb) return "https://placehold.co/600x400?text=Gambar+Kosong";
    const cleanPath = pathFromDb.startsWith('/') ? pathFromDb : `/${pathFromDb}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const instagramMockups = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"];

  const statistikItems = [
    {
      icon: <Layers size={24} />,
      count: statsData.dataset,
      label: "Total Dataset",
      desc: "Kumpulan data dalam format tabel yang dapat diolah lebih lanjut.",
      link: "https://satudata.garutkab.go.id/datasets"
    },
    {
      icon: <Database size={24} />,
      count: statsData.data,
      label: "Total Data",
      desc: "Data sektoral yang telah diunggah oleh berbagai SKPD Garut.",
      link: "https://satudata.garutkab.go.id/datasets"
    },
    {
      icon: <PieChart size={24} />,
      count: statsData.visualisasi,
      label: "Total Visualisasi",
      desc: "Representasi visual interaktif dari informasi data sektoral tertentu.",
      link: "https://satudata.garutkab.go.id/visualisasi"
    },
    {
      icon: <ImageIcon size={24} />,
      count: statsData.infografis,
      label: "Total Infografis",
      desc: "Informasi data yang disajikan dalam bentuk grafis kreatif.",
      link: "https://satudata.garutkab.go.id/infografik"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1️⃣ HERO SECTION */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 bg-slate-900 dark:bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Satu Data Garut
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
              Mewujudkan Satu Data yang <span className="text-emerald-400 font-black">Akurat & Terintegrasi</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
              Dinas Komunikasi dan Informatika Kabupaten Garut mengoordinasikan pengelolaan data statistik sektoral demi pembangunan daerah yang akuntabel dan berbasis data.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <a 
                href="https://satudata.garutkab.go.id/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xs"
              >
                <img src="/gsd.png" alt="Logo GSD" className="w-5 h-5 object-contain" /> 
                Kunjungi Portal Satu Data
              </a>
              <a href="#kegiatan" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-7 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                Lihat Kegiatan
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Data</h4>
                  <p className="text-xs font-bold text-emerald-400">Aktif Real-time</p>
                </div>
              </div>
              <h3 className="text-3xl font-black text-white">{statsData.dataset.toLocaleString('id-ID')} Dataset</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Terverifikasi Diskominfo Garut</p>
            </div>
          </div>
        </div>

        {/* TICKER BERJALAN (Lengkap Kependudukan + Statistik) */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 border-t border-slate-800 py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-ticker">
            <div className="flex gap-12 text-xs font-bold tracking-wider text-slate-400 uppercase">
              <span>GARUT SATU DATA</span>
              <span>TOTAL PENDUDUK: {pengaturan.jumlah_penduduk.toLocaleString('id-ID')} JIWA</span>
              <span>KEPALA KELUARGA: {pengaturan.jumlah_kepala_keluarga.toLocaleString('id-ID')} KK</span>
              <span>LAKI-LAKI: {pengaturan.jumlah_laki.toLocaleString('id-ID')}</span>
              <span>PEREMPUAN: {pengaturan.jumlah_perempuan.toLocaleString('id-ID')}</span>
              <span>DATASET: {statsData.dataset.toLocaleString('id-ID')}</span>
              <span>DATA: {statsData.data.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex gap-12 text-xs font-bold tracking-wider text-slate-400 uppercase ml-12">
              <span>GARUT SATU DATA</span>
              <span>TOTAL PENDUDUK: {pengaturan.jumlah_penduduk.toLocaleString('id-ID')} JIWA</span>
              <span>KEPALA KELUARGA: {pengaturan.jumlah_kepala_keluarga.toLocaleString('id-ID')} KK</span>
              <span>LAKI-LAKI: {pengaturan.jumlah_laki.toLocaleString('id-ID')}</span>
              <span>PEREMPUAN: {pengaturan.jumlah_perempuan.toLocaleString('id-ID')}</span>
              <span>DATASET: {statsData.dataset.toLocaleString('id-ID')}</span>
              <span>DATA: {statsData.data.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ TENTANG KAMI */}
      <section className="py-20 bg-white dark:bg-brand-dark transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tight mb-6">Siapa Kami?</h2>
          <div className="h-1.5 w-20 bg-brand-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            <strong className="text-brand-dark dark:text-brand-primary">Bidang Penyelenggaraan Statistik Sektoral</strong> merupakan unit kerja pada Dinas Komunikasi dan Informatika Kabupaten Garut yang bertugas mengoordinasikan pengelolaan data sektoral antar perangkat daerah.
          </p>
        </div>
      </section>

      {/* 3️⃣ LIVE DATA DASHBOARD */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-10">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-lg">Live Analytics</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-3">Dashboard Tren Data Sektoral</h2>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 sm:p-8 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datasetGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tahun" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  <Area type="monotone" dataKey="dataset" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ TUGAS & FUNGSI */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight mb-12">Tugas & Fungsi Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Database size={32} />, title: "Koordinasi Data Sektoral", bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400" },
              { icon: <CheckCircle size={32} />, title: "Integrasi & Validasi Data", bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400" },
              { icon: <BarChart3 size={32} />, title: "Publikasi Statistik Daerah", bg: "bg-teal-50 dark:bg-teal-950/50", text: "text-teal-600 dark:text-teal-400" },
              { icon: <Search size={32} />, title: "Monitoring & Evaluasi Data", bg: "bg-purple-50 dark:bg-purple-950/50", text: "text-purple-600 dark:text-purple-400" }
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
                <div className={`w-16 h-16 mx-auto ${item.bg} ${item.text} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ PROGRAM UNGGULAN */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-4">
              Program Utama
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
              Implementasi Satu Data Indonesia di Kabupaten Garut
            </h2>
          </div>
          
          <div className="grid gap-3.5">
            {[
              { title: "Portal Satu Data Garut", desc: "Akses dataset terbuka Kabupaten Garut", link: "https://satudata.garutkab.go.id/" },
              { title: "Rekapan Kegiatan Statistik", desc: "Dokumentasi & pelaporan kegiatan sektoral", link: "#kegiatan" }
            ].map((btn, i) => (
              <a key={i} href={btn.link} className="flex items-center justify-between bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors group">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{btn.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{btn.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                  <ArrowRight size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ CARDS GRID STATISTIK PORTAL */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Statistik <span className="text-emerald-600 dark:text-emerald-400">Satu Data Garut</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {statistikItems.map((item, index) => (
              <div key={index} className="flex w-full flex-col gap-3 rounded-2xl p-6 text-center text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {item.count.toLocaleString('id-ID')}
                </h3>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-emerald-400">
                  {item.label}
                </div>
                <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-3 block group/btn">
                  <div className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 transition-colors group-hover/btn:bg-emerald-500 group-hover/btn:text-white dark:bg-slate-800 dark:text-slate-300">
                    <span>Lihat Selengkapnya</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7️⃣ KEGIATAN TERBARU */}
      <section id="kegiatan" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Kegiatan Terbaru</h2>
            </div>
            <Link to="/kegiatan" className="flex items-center gap-2 bg-white dark:bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-extrabold text-xs uppercase tracking-wider hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-xs">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kegiatan.length > 0 ? kegiatan.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col">
                <div className="relative overflow-hidden rounded-xl h-52 mb-4 bg-slate-100 dark:bg-slate-900">
                  <img src={getImageUrl(item.dokumentasi)} alt={item.nama_kegiatan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=File+Tidak+Ditemukan"; }} />
                  <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                    {item.tipe || 'UMUM'}
                  </span>
                </div>
                <div className="px-1 pb-2">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {formatTanggal(item.tanggal)}
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                    {item.nama_kegiatan}
                  </h3>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white dark:bg-slate-950 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
                <Search className="mx-auto mb-3 text-slate-300" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat Kegiatan...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8️⃣ INSTAGRAM FEED */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-2xl mb-4">
            <Instagram size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Instagram Feed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {instagramMockups.map((imgUrl, idx) => (
              <a href="https://www.instagram.com/garutsatudata/" target="_blank" rel="noreferrer" key={idx} className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer block border border-slate-200 dark:border-slate-800 shadow-xs">
                <img src={imgUrl} alt={`Instagram Feed ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=Gambar+Tidak+Ditemukan"; }} />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Beranda;