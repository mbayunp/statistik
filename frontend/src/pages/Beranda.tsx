import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, BarChart3, CheckCircle, Search, ArrowRight, Instagram, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config'; // Pastikan path ini sesuai dengan lokasi config.ts kamu

interface Kegiatan {
  id: number;
  tanggal: string;
  nama_kegiatan: string;
  dokumentasi: string;
  tipe: 'bulanan' | 'semesteran' | string;
}

const Beranda: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);

useEffect(() => {
  axios.get(`${API_BASE_URL}/api/kegiatan`)
    .then(res => {
      const rawData = res.data.data;
      const mappedData = rawData.map((item: any) => ({
        id: item.id,
        tanggal: item.tanggal,
        nama_kegiatan: item.keterangan,
        dokumentasi: item.gambar,
        tipe: item.tipe || 'BULANAN'
      }));

      const sorted = mappedData.sort((a: any, b: any) => 
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );

      setKegiatan(sorted.slice(0, 3));
    })
    .catch(err => console.error("Gagal menarik data:", err));
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

  const instagramMockups = [
        "/1.jpg",
        "/2.jpg",
        "/3.jpg",
        "/4.jpg"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1️⃣ HERO SECTION */}
<section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-brand-dark to-slate-900 text-white overflow-hidden">
  <div className="container mx-auto px-6 relative z-10 text-center">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 max-w-5xl mx-auto">
      Mewujudkan Satu Data Kabupaten Garut yang <span className="text-brand-primary italic">Akurat, Mutakhir, dan Terintegrasi</span>
    </h1>
    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
      Bidang Penyelenggaraan Statistik Sektoral Dinas Komunikasi dan Informatika Kabupaten Garut
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <a 
        href="https://satudata.garutkab.go.id/" 
        target="_blank" 
        rel="noreferrer" 
        className="w-full sm:w-auto bg-brand-primary hover:bg-white hover:text-brand-dark text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/30 hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        {/* Penggantian Icon ke Gambar gsd.png */}
        <img 
          src="/gsd.png" 
          alt="Logo GSD" 
          className="w-6 h-6 object-contain" 
        /> 
        Kunjungi Portal Satu Data
      </a>
      <a href="#kegiatan" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
        Lihat Kegiatan
      </a>
    </div>
    <div className="mt-10 flex justify-center">
       <a href="https://www.instagram.com/garutsatudata/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-semibold backdrop-blur-sm">
          <Instagram size={18} className="text-pink-500" /> @garutsatudata
       </a>
    </div>
  </div>
  
  {/* Dekorasi Background */}
  <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
</section>

      {/* 2️⃣ TENTANG KAMI */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight mb-6">Siapa Kami?</h2>
          <div className="h-1.5 w-20 bg-brand-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            <strong className="text-brand-dark">Bidang Penyelenggaraan Statistik Sektoral</strong> merupakan unit kerja pada Dinas Komunikasi dan Informatika Kabupaten Garut yang bertugas mengoordinasikan pengelolaan data sektoral antar perangkat daerah dalam rangka mendukung kebijakan berbasis data.
          </p>
        </div>
      </section>

      {/* 3️⃣ TUGAS & FUNGSI */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-brand-dark uppercase tracking-tight mb-16">Tugas & Fungsi Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Database size={40} />, title: "Koordinasi Data Sektoral" },
              { icon: <CheckCircle size={40} />, title: "Integrasi & Validasi Data" },
              { icon: <BarChart3 size={40} />, title: "Publikasi Statistik Daerah" },
              { icon: <Search size={40} />, title: "Monitoring & Evaluasi Data" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-20 h-20 mx-auto bg-blue-50 text-brand-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-slate-800 leading-tight">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ PROGRAM UNGGULAN & AKSES CEPAT */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 font-bold text-xs uppercase tracking-widest mb-6">
              Program Unggulan 🌟
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-6 leading-tight">
              Implementasi Satu Data Indonesia di Kabupaten Garut
            </h2>
            <ul className="space-y-4 mt-8">
              {['Standarisasi metadata statistik sektoral', 'Integrasi data antar OPD (Organisasi Perangkat Daerah)', 'Peningkatan kualitas & validitas statistik sektoral', 'Sinkronisasi dengan portal Satu Data Nasional'].map((list, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-600 font-medium">
                  <CheckCircle size={24} className="text-emerald-500 shrink-0" /> 
                  <span className="pt-0.5">{list}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid gap-4">
            {[
              { title: "Portal Satu Data Garut", desc: "Akses dataset terbuka Kabupaten Garut", link: "https://satudata.garutkab.go.id/" },
              { title: "Rekapan Kegiatan Statistik", desc: "Dokumentasi & pelaporan kegiatan sektoral", link: "#kegiatan" },
              { title: "Dokumentasi & Publikasi", desc: "Arsip dokumen digital", link: "#" }
            ].map((btn, i) => (
              <a key={i} href={btn.link} className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
                <div>
                  <h3 className="text-lg font-black text-brand-dark group-hover:text-brand-primary transition-colors">{btn.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{btn.desc}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <ArrowRight size={20} className="text-slate-400 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ STATISTIK SINGKAT */}
      <section className="py-16 bg-brand-dark text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-4">
              <h4 className="text-5xl lg:text-6xl font-black mb-2 text-brand-primary">120+</h4>
              <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">Dataset Terpublikasi</p>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <h4 className="text-5xl lg:text-6xl font-black mb-2 text-brand-primary">35</h4>
              <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">OPD Terintegrasi</p>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <h4 className="text-5xl lg:text-6xl font-black mb-2 text-brand-primary">500+</h4>
              <p className="font-bold text-slate-400 uppercase tracking-[0.2em] text-xs">Data Statistik Aktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7️⃣ KEGIATAN TERBARU */}
      <section id="kegiatan" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Kegiatan Terbaru</h2>
              <div className="h-1.5 w-20 bg-brand-primary mt-4 rounded-full"></div>
            </div>
            <a href="/kegiatan" className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-slate-200 text-brand-dark font-black text-xs uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm">
              Lihat Semua <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kegiatan.length > 0 ? kegiatan.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden rounded-[2rem] h-60 mb-6 bg-slate-100">
                  <img 
                    src={getImageUrl(item.dokumentasi)} 
                    alt={item.nama_kegiatan} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                        // Jika gagal load, ganti ke gambar placeholder
                        e.currentTarget.src = "https://placehold.co/600x400?text=File+Tidak+Ditemukan";
                    }}
                    />
                  <span className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                    {item.tipe || 'UMUM'}
                  </span>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    {formatTanggal(item.tanggal)}
                  </p>
                  <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2 leading-tight">
                    {item.nama_kegiatan}
                  </h3>
                  <button className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all mt-6">
                    Detail Kegiatan <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white rounded-[3rem] p-12 text-center border border-slate-100 shadow-sm">
                <Search className="mx-auto mb-4 text-slate-200" size={48} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Memuat Kegiatan...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8️⃣ INSTAGRAM FEED PREVIEW */}
  <section className="py-24 bg-white border-t border-slate-100">
    <div className="container mx-auto px-6 text-center">
      <div className="inline-flex items-center justify-center p-4 bg-pink-50 text-pink-500 rounded-3xl mb-6">
        <Instagram size={32} />
      </div>
      <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight mb-4">
        Instagram Feed
      </h2>
      <p className="text-slate-500 mb-12 max-w-xl mx-auto font-medium">
        Ikuti perjalanan dan update informasi terbaru seputar Satu Data Garut melalui akun resmi kami.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {instagramMockups.map((imgUrl, idx) => (
          <a 
            href="https://www.instagram.com/garutsatudata/" 
            target="_blank" 
            rel="noreferrer"
            key={idx} 
            className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group cursor-pointer block border border-slate-100 shadow-sm"
          >
            {/* Memanggil gambar dari folder public */}
            <img 
              src={imgUrl} 
              alt={`Instagram Feed ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=Gambar+Tidak+Ditemukan"; }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Instagram className="text-white mb-2" size={32} />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Lihat Postingan</span>
            </div>
          </a>
        ))}
      </div>

      <a href="https://www.instagram.com/garutsatudata/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm">
        @garutsatudata <ExternalLink size={16} />
      </a>
    </div>
  </section>

    </div>
  );
};

export default Beranda;