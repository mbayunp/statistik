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
    dataset: 671,      
    data: 2186,        
    visualisasi: 9,    
    infografis: 161   
  });

  // State data kependudukan (tetap dipertahankan)
  const [pengaturan, setPengaturan] = useState<PengaturanData>({
    jumlah_penduduk: 2921690,
    jumlah_kepala_keluarga: 948821,
    jumlah_laki: 1494645,
    jumlah_perempuan: 1427045,
    permohonan_data: '1',
    sumber: 'Berdasarkan DKB Semester II Tahun 2025'
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
        const [resPengaturan, resPermohonan] = await Promise.all([
          axios.get('/api-garut/api/pengaturan').catch(() => ({ data: null })),
          axios.get('/api-garut/api/request-data/total').catch(() => ({ data: null }))
        ]);
        
        if (resPermohonan && resPermohonan.data) {
          const apiStats = resPermohonan.data.data || resPermohonan.data;
          
          setStatsData({
            dataset: apiStats.dataset > 0 ? Number(apiStats.dataset) : 671,
            data: apiStats.data > 0 ? Number(apiStats.data) : 2186,
            visualisasi: apiStats.visualisasi >= 0 ? Number(apiStats.visualisasi) : 9,
            infografis: apiStats.infografis >= 0 ? Number(apiStats.infografis) : 161
          });
        }

        if (resPengaturan && resPengaturan.data?.success && resPengaturan.data?.data) {
          setPengaturan(resPengaturan.data.data);
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#001D1E] transition-colors duration-300">
      
      {/* 1️⃣ HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-linear-to-br from-brand-dark to-slate-900 dark:from-[#001D1E] dark:to-brand-dark text-white overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-primary"></span> Satu Data Garut
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Mewujudkan Satu Data yang <span className="text-brand-primary italic">Akurat & Terintegrasi</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
              Dinas Komunikasi dan Informatika Kabupaten Garut mengoordinasikan pengelolaan data statistik sektoral demi pembangunan daerah yang akuntabel dan berbasis data.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a 
                href="https://satudata.garutkab.go.id/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto bg-brand-primary hover:bg-white hover:text-brand-dark text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <img src="/gsd.png" alt="Logo GSD" className="w-5 h-5 object-contain" /> 
                Kunjungi Portal Satu Data
              </a>
              <a href="#kegiatan" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                Lihat Kegiatan
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute top-4 left-4 z-20 bg-brand-dark/70 dark:bg-brand-dark/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-56 shadow-2xl animate-float">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Data</h4>
                  <p className="text-xs font-bold text-emerald-400">Aktif Real-time</p>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white">{statsData.dataset.toLocaleString('id-ID')} Dataset</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Terverifikasi Diskominfo</p>
            </div>

            <div className="w-full h-[400px] flex items-center justify-center relative animate-float-delayed">
              <svg className="w-80 h-80 text-brand-primary/20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50" y1="150" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                <line x1="150" y1="150" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* TICKER BERJALAN (Lengkap Kependudukan + Statistik) */}
        <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/40 dark:bg-black/20 backdrop-blur-md border-t border-white/5 py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-ticker">
            <div className="flex gap-16 text-xs font-black tracking-widest text-slate-400 uppercase">
              <span>🚀 GARUT SATU DATA</span>
              <span>👥 TOTAL PENDUDUK: {pengaturan.jumlah_penduduk.toLocaleString('id-ID')} JIWA</span>
              <span>🏠 KEPALA KELUARGA: {pengaturan.jumlah_kepala_keluarga.toLocaleString('id-ID')} KK</span>
              <span>👨 LAKI-LAKI: {pengaturan.jumlah_laki.toLocaleString('id-ID')}</span>
              <span>👩 PEREMPUAN: {pengaturan.jumlah_perempuan.toLocaleString('id-ID')}</span>
              <span>📊 DATASET: {statsData.dataset.toLocaleString('id-ID')}</span>
              <span>🗂️ DATA: {statsData.data.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex gap-16 text-xs font-black tracking-widest text-slate-400 uppercase ml-16">
              <span>🚀 GARUT SATU DATA</span>
              <span>👥 TOTAL PENDUDUK: {pengaturan.jumlah_penduduk.toLocaleString('id-ID')} JIWA</span>
              <span>🏠 KEPALA KELUARGA: {pengaturan.jumlah_kepala_keluarga.toLocaleString('id-ID')} KK</span>
              <span>👨 LAKI-LAKI: {pengaturan.jumlah_laki.toLocaleString('id-ID')}</span>
              <span>👩 PEREMPUAN: {pengaturan.jumlah_perempuan.toLocaleString('id-ID')}</span>
              <span>📊 DATASET: {statsData.dataset.toLocaleString('id-ID')}</span>
              <span>🗂️ DATA: {statsData.data.toLocaleString('id-ID')}</span>
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
      <section className="py-20 bg-slate-50 dark:bg-[#001D1E]/40 border-y border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 rounded-full">Live Analytics</span>
            <h2 className="text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tight mt-4">Dashboard Tren Data Sektoral</h2>
            <div className="h-1.5 w-20 bg-brand-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="bg-white dark:bg-brand-dark p-6 rounded-[2.5rem] shadow-xl border border-slate-200/50 dark:border-white/5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datasetGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tahun" stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: '#002B2D', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  <Area type="monotone" dataKey="dataset" stroke="#00D2B4" strokeWidth={3} fill="#00D2B4" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ TUGAS & FUNGSI */}
      <section className="py-24 bg-white dark:bg-brand-dark transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-brand-dark dark:text-white uppercase tracking-tight mb-16">Tugas & Fungsi Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Database size={36} />, title: "Koordinasi Data Sektoral", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
              { icon: <CheckCircle size={36} />, title: "Integrasi & Validasi Data", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
              { icon: <BarChart3 size={36} />, title: "Publikasi Statistik Daerah", bg: "bg-teal-50 dark:bg-teal-500/10", text: "text-teal-600 dark:text-teal-400" },
              { icon: <Search size={36} />, title: "Monitoring & Evaluasi Data", bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }
            ].map((item, index) => (
              <div key={index} className="p-8 rounded-[2.5rem] text-center glass-card hover-lift transition-all group">
                <div className={`w-18 h-18 mx-auto ${item.bg} ${item.text} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ PROGRAM UNGGULAN */}
      <section className="py-24 bg-slate-50 dark:bg-[#001D1E]/40 border-y border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-widest mb-6">
              Program Utama 🌟
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white mb-6 leading-tight">
              Implementasi Satu Data Indonesia di Kabupaten Garut
            </h2>
          </div>
          
          <div className="grid gap-4">
            {[
              { title: "Portal Satu Data Garut", desc: "Akses dataset terbuka Kabupaten Garut", link: "https://satudata.garutkab.go.id/" },
              { title: "Rekapan Kegiatan Statistik", desc: "Dokumentasi & pelaporan kegiatan sektoral", link: "#kegiatan" }
            ].map((btn, i) => (
              <a key={i} href={btn.link} className="flex items-center justify-between bg-white dark:bg-brand-dark p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
                <div>
                  <h3 className="text-lg font-black text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">{btn.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{btn.desc}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ CARDS GRID STATISTIK PORTAL (Murni mengambil data dari screenshot) */}
      <section className="py-20 bg-slate-100 dark:bg-brand-dark/60 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-brand-dark dark:text-white uppercase tracking-wider">
              Statistik <span className="text-brand-primary">Satu Data Garut</span>
            </h2>
            <p className="mx-auto mt-3 mb-6 w-16 border-b-4 border-brand-primary rounded-full"></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {statistikItems.map((item, index) => (
              <div key={index} className="flex w-full flex-col gap-4 rounded-3xl p-6 text-center text-slate-800 dark:text-white glass-card hover-lift hover:ring-2 hover:ring-brand-primary/20 transition-all">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  {item.count.toLocaleString('id-ID')}
                </h3>
                <div className="text-sm font-black uppercase tracking-wider text-brand-dark dark:text-brand-primary">
                  {item.label}
                </div>
                <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2">
                  {item.desc}
                </p>
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 block group/btn">
                  <div className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-2xl bg-slate-50 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors duration-300 group-hover/btn:bg-brand-primary group-hover/btn:text-white dark:bg-white/5 dark:text-slate-300">
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
      <section id="kegiatan" className="py-24 bg-slate-50 dark:bg-[#001D1E]/40 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tight">Kegiatan Terbaru</h2>
              <div className="h-1.5 w-20 bg-brand-primary mt-4 rounded-full"></div>
            </div>
            <Link to="/kegiatan" className="flex items-center gap-2 bg-white dark:bg-brand-dark px-6 py-3 rounded-full border border-slate-200/50 text-brand-dark dark:text-white font-black text-xs uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kegiatan.length > 0 ? kegiatan.map((item) => (
              <div key={item.id} className="bg-white dark:bg-brand-dark rounded-4xl p-4 shadow-sm border border-slate-100 dark:border-white/5 group hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative overflow-hidden rounded-4xl h-60 mb-6 bg-slate-100">
                  <img src={getImageUrl(item.dokumentasi)} alt={item.nama_kegiatan} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=File+Tidak+Ditemukan"; }} />
                  <span className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                    {item.tipe || 'UMUM'}
                  </span>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    {formatTanggal(item.tanggal)}
                  </p>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 line-clamp-2 leading-tight">
                    {item.nama_kegiatan}
                  </h3>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white dark:bg-brand-dark rounded-[3rem] p-12 text-center border border-slate-100 dark:border-white/5 shadow-sm">
                <Search className="mx-auto mb-4 text-slate-200" size={48} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Memuat Kegiatan...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8️⃣ INSTAGRAM FEED */}
      <section className="py-24 bg-white dark:bg-brand-dark border-t border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-pink-50 dark:bg-pink-500/10 text-pink-500 rounded-3xl mb-6">
            <Instagram size={32} />
          </div>
          <h2 className="text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tight mb-4">Instagram Feed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {instagramMockups.map((imgUrl, idx) => (
              <a href="https://www.instagram.com/garutsatudata/" target="_blank" rel="noreferrer" key={idx} className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group cursor-pointer block border border-slate-100 dark:border-white/5 shadow-sm">
                <img src={imgUrl} alt={`Instagram Feed ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=Gambar+Tidak+Ditemukan"; }} />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Beranda;