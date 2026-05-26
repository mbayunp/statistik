import React from 'react';
import { 
  Building2, BookOpen, Target, ShieldCheck, 
  Share2, Database, Users, Rocket, CheckCircle2, 
  ArrowRight, Link as LinkIcon 
} from 'lucide-react';

const TentangHero = () => (
  <div className="bg-brand-dark text-white py-24 relative overflow-hidden">
    <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
        <Building2 size={16} /> Diskominfo Kabupaten Garut
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight uppercase">
        Bidang Penyelenggara <span className="text-brand-primary">Statistik Sektoral</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-300 font-medium">
        Mengelola data sektoral daerah untuk mendukung kebijakan pembangunan Kabupaten Garut yang berbasis data dan fakta.
      </p>
    </div>
    {/* Dekorasi Background */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
    </div>
  </div>
);

const ProfilSection = () => (
  <div className="py-20 bg-white">
    <div className="container mx-auto px-6 max-w-5xl text-center">
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-8">Profil Singkat</h2>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        Bidang Penyelenggara Statistik Sektoral merupakan bagian dari <strong>Dinas Komunikasi dan Informatika Kabupaten Garut</strong> yang memiliki tugas melaksanakan pengelolaan data sektoral daerah dalam rangka mendukung kebijakan pembangunan berbasis data.
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-4xl p-8 md:p-12 text-left">
        <p className="text-slate-600 mb-6 font-medium">Sebagai <strong>Walidata Daerah</strong>, bidang ini bertanggung jawab dalam memastikan bahwa seluruh data yang dihasilkan oleh Perangkat Daerah memenuhi prinsip:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['Akurat', 'Mutakhir', 'Terpadu', 'Dapat dipertanggungjawabkan'].map((prinsip, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
              <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
              <span className="font-bold text-slate-700 text-sm">{prinsip}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between bg-brand-dark text-white p-6 rounded-2xl">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mb-1">Integrasi Sistem</p>
            <p className="font-medium">Pengelolaan data terintegrasi melalui Portal Satu Data.</p>
          </div>
          <a href="https://satudata.garutkab.go.id/" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-brand-primary hover:bg-white hover:text-brand-dark px-6 py-3 rounded-xl font-black text-sm uppercase transition-all whitespace-nowrap">
            Kunjungi Portal <LinkIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const LandasanHukum = () => (
  <div className="py-20 bg-slate-50 border-t border-slate-200">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><BookOpen size={32} /></div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Landasan Hukum</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          "Peraturan Presiden Nomor 39 Tahun 2019 tentang Satu Data Indonesia",
          "Peraturan Bupati Kabupaten Garut tentang Satu Data Daerah",
          "Kebijakan Nasional Satu Data Indonesia"
        ].map((hukum, i) => (
          <div key={i} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 flex items-start gap-4">
            <span className="text-brand-primary font-black text-2xl">0{i + 1}</span>
            <p className="text-slate-600 font-medium leading-relaxed">{hukum}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VisiMisi = () => (
  <div className="py-20 bg-white">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Visi */}
        <div className="bg-brand-dark p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <Target size={48} className="text-brand-primary mb-6 relative z-10" />
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4 relative z-10">Visi</h3>
          <p className="text-lg text-slate-200 leading-relaxed font-medium relative z-10">
            "Terwujudnya Tata Kelola Data Kabupaten Garut yang Terintegrasi, Berkualitas, dan Mendukung Pembangunan Berbasis Bukti."
          </p>
          <div className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none"><Target size={250} /></div>
        </div>
        
        {/* Misi */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3">
            <Rocket className="text-brand-primary" size={28} /> Misi Utama
          </h3>
          <ul className="space-y-4">
            {[
              "Meningkatkan kualitas dan standar data sektoral.",
              "Mengintegrasikan data antar Perangkat Daerah.",
              "Meningkatkan transparansi dan keterbukaan informasi publik.",
              "Mendukung pengambilan kebijakan berbasis data."
            ].map((misi, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black shrink-0">{i + 1}</div>
                <p className="text-slate-600 font-medium pt-1">{misi}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const PeranWalidata = () => {
  const peran = [
    { title: "Koordinasi Data", desc: "Melakukan koordinasi dengan seluruh Produsen Data (OPD) dalam proses perencanaan, pengumpulan, dan pemutakhiran data.", icon: <Share2 /> },
    { title: "Validasi & Verifikasi", desc: "Memastikan data telah sesuai dengan standar metadata, kode referensi, dan interoperabilitas.", icon: <ShieldCheck /> },
    { title: "Integrasi Sistem", desc: "Mengintegrasikan data sektoral ke dalam Portal Satu Data Garut.", icon: <Database /> },
    { title: "Publikasi & Diseminasi", desc: "Menyediakan akses data yang terbuka dan transparan kepada masyarakat.", icon: <Users /> }
  ];

  return (
    <div className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 max-w-6xl text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-4">Peran Sebagai Walidata</h2>
        <p className="text-slate-500 mb-12 max-w-2xl mx-auto">Sebagai Walidata, Bidang Penyelenggara Statistik Sektoral memiliki peran strategis dalam ekosistem data daerah.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {peran.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AlurPengelolaan = () => {
  const tahapan = [
    "Perencanaan Data oleh Produsen Data (OPD)",
    "Pengumpulan & Input Data",
    "Validasi oleh Walidata",
    "Integrasi ke Sistem Satu Data",
    "Publikasi melalui Portal"
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-12">Alur Pengelolaan Data</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {/* Garis penghubung (hanya terlihat di desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          {tahapan.map((tahap, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center w-full md:w-1/5 group">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-100 text-slate-400 font-black text-xl flex items-center justify-center mb-4 group-hover:border-brand-primary group-hover:text-brand-primary transition-all shadow-sm">
                {i + 1}
              </div>
              <p className="text-xs font-bold text-slate-600 px-2 leading-relaxed">{tahap}</p>
              {i < tahapan.length - 1 && <ArrowRight className="md:hidden text-slate-300 my-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrinsipSatuData = () => (
  <div className="py-20 bg-brand-dark text-white">
    <div className="container mx-auto px-6 max-w-4xl text-center">
      <h2 className="text-3xl font-black uppercase tracking-tight mb-10 text-white">Prinsip Satu Data Garut</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {['Standar Data', 'Metadata', 'Interoperabilitas', 'Kode Referensi', 'Berbagi Pakai Data'].map((prinsip, i) => (
          <span key={i} className="px-6 py-3 bg-white/10 border border-white/20 rounded-full font-bold tracking-wider uppercase text-sm backdrop-blur-sm hover:bg-brand-primary transition-all cursor-default">
            {prinsip}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const StrukturKelembagaan = () => (
  <div className="py-20 bg-slate-50">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-6">Struktur & Kolaborasi</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Struktur pengelolaan Satu Data Kabupaten Garut melibatkan berbagai pihak untuk menciptakan ekosistem data yang sehat dan terintegrasi.</p>
          
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Unsur Pengelola:</h3>
          <div className="space-y-3 mb-8">
            {['Pembina Data (BPS)', 'Walidata (Diskominfo)', 'Produsen Data (Perangkat Daerah)', 'Forum Satu Data Daerah'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <CheckCircle2 size={18} className="text-brand-primary" />
                <span className="font-medium text-slate-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="font-black text-brand-dark uppercase tracking-widest text-xs mb-6 text-center">Sinergi & Kolaborasi Dengan:</h3>
          <ul className="space-y-4">
            {['Seluruh OPD Kabupaten Garut', 'Badan Pusat Statistik (BPS)', 'Instansi Vertikal', 'Pemerintah Provinsi Jawa Barat', 'Kementerian / Lembaga Terkait'].map((mitra, i) => (
              <li key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-600 text-sm">{mitra}</span>
                <LinkIcon size={16} className="text-slate-300" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const KomitmenPengembangan = () => (
  <div className="py-24 bg-white text-center">
    <div className="container mx-auto px-6 max-w-3xl">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <Rocket size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-6">Komitmen Pengembangan</h2>
      <p className="text-slate-500 mb-10 leading-relaxed text-lg">Ke depan, pengelolaan data sektoral akan terus diarahkan pada inovasi teknologi dan penguatan sumber daya manusia.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {[
          "Penguatan dashboard statistik interaktif",
          "Integrasi API antar sistem aplikasi",
          "Otomatisasi proses validasi data",
          "Peningkatan kapasitas SDM data daerah"
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 shrink-0"></div>
            <p className="font-medium text-slate-700 text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Tentang: React.FC = () => {
  return (
    <div className="bg-slate-50">
      <TentangHero />
      <ProfilSection />
      <LandasanHukum />
      <VisiMisi />
      <PeranWalidata />
      <AlurPengelolaan />
      <PrinsipSatuData />
      <StrukturKelembagaan />
      <KomitmenPengembangan />
    </div>
  );
};

export default Tentang;