import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Lock, Database, Eye, FileText, CheckCircle2,
  Building2, Mail, MapPin, Scale, Share2
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24 font-sans text-slate-800">
      
      {/* 1. HERO HEADER */}
      <section className="bg-brand-dark text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 max-w-4xl text-center">
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl mb-8 transition-colors cursor-pointer border border-white/10 backdrop-blur-sm"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-black uppercase tracking-widest mb-4">
            <Scale size={14} /> Kepatuhan Regulasi UU No. 27 Tahun 2022 (UU PDP)
          </div>

          <h1 className="text-3xl sm:text-5xl font-black mb-4 uppercase tracking-tight">
            Kebijakan Privasi & <span className="text-brand-primary">Pelindungan Data Pribadi</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Komitmen resmi Pemerintah Kabupaten Garut melalui Dinas Komunikasi dan Informatika dalam menjamin pelindungan data dan hak privasi pengguna pada seluruh layanan formulir publik dan portal statistik sektoral.
          </p>

          <p className="text-[11px] font-bold text-slate-400 mt-6 tracking-wide">
            Berlaku efektif sejak: 1 Januari 2024 • Terakhir diperbarui: Oktober 2026
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      </section>

      {/* 2. ISI KEBIJAKAN PRIVASI */}
      <main className="container mx-auto px-6 max-w-4xl -mt-8 relative z-20">
        
        {/* Ringkasan Komitmen Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-1">Jaminan Pelindungan Data Pribadi</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Seluruh data pribadi yang dikumpulkan melalui formulir elektronik ini diproses secara sah, terbatas, transparan, dan akuntabel sesuai dengan amanat <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> serta <strong>Peraturan Presiden Nomor 39 Tahun 2019 tentang Satu Data Indonesia</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
          
          {/* Bagian 1: Pendahuluan */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">1</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pendahuluan</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">
              Dinas Komunikasi dan Informatika Kabupaten Garut selaku Walidata Daerah dan penyelenggara sistem elektronik berkomitmen penuh dalam melindungi privasi warga masyarakat, aparatur sipil negara, serta responden formulir daring. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, serta mengamankan data pribadi Anda.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Bagian 2: Data yang Dikumpulkan */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">2</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Data Pribadi yang Kami Kumpulkan</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">
              Data yang dikumpulkan bergantung pada keperluan masing-masing formulir kedinasan atau survei statistik yang Anda akses, yang meliputi:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11 pt-2">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-2">
                  <FileText size={16} className="text-blue-600" /> Data Umum & Kontak
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 font-medium list-disc list-inside">
                  <li>Nama lengkap dan gelar</li>
                  <li>Nomor Induk Pegawai (NIP) / NIK (bila disyaratkan)</li>
                  <li>Jabatan dan Perangkat Daerah / Instansi</li>
                  <li>Alamat surat elektronik (Email)</li>
                  <li>Nomor telepon / WhatsApp dinas</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-2">
                  <Database size={16} className="text-purple-600" /> Data Teknis & Khusus
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 font-medium list-disc list-inside">
                  <li>Tanda Tangan Digital elektronik (kanvas)</li>
                  <li>Foto dokumentasi atau snapshot presensi kehadiran</li>
                  <li>Titik koordinat Geolocation / GPS perangkat saat pengisian</li>
                  <li>Dokumen lampiran kedinasan (PDF, Word, Excel, Gambar)</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Bagian 3: Tujuan Pemrosesan */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">3</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tujuan Pemrosesan Data Pribadi</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">
              Data pribadi Anda hanya diproses untuk tujuan resmi kedinasan pemerintah daerah dan tidak akan pernah dikomersialkan, antara lain untuk:
            </p>
            <div className="space-y-2 pl-11 pt-1">
              {[
                'Verifikasi identitas responden dan keabsahan pengisian formulir kedinasan.',
                'Perekaman daftar hadir dan absensi kegiatan resmi perangkat daerah.',
                'Kompilasi dan agregasi statistik sektoral daerah guna perencanaan pembangunan Kabupaten Garut.',
                'Pertanggungjawaban administrasi, pelaporan kinerja, serta audit tata kelola pemerintahan.',
                'Pengiriman konfirmasi atau tindak lanjut terkait respon yang telah Anda ajukan.'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                  <CheckCircle2 size={16} className="text-brand-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Bagian 4: Penyimpanan & Keamanan */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">4</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Penyimpanan & Keamanan Data</h2>
            </div>
            <div className="pl-11 space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                Seluruh berkas dan basis data disimpan pada <strong>Pusat Data Pemerintah Kabupaten Garut</strong> yang dilindungi dengan mekanisme keamanan berlapis:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <Lock size={20} className="text-brand-primary mx-auto mb-1.5" />
                  <p className="text-xs font-black text-slate-800">Enkripsi Data</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">HTTPS/TLS pada transmisi data</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <Eye size={20} className="text-blue-500 mx-auto mb-1.5" />
                  <p className="text-xs font-black text-slate-800">Akses Terbatas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Role-Based Access Control ketat</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <Share2 size={20} className="text-amber-500 mx-auto mb-1.5" />
                  <p className="text-xs font-black text-slate-800">Tanpa Pihak Ketiga</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bebas komersialisasi data</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Bagian 5: Hak Subjek Data Pribadi */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">5</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hak-Hak Subjek Data Pribadi (UU PDP)</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">
              Sesuai dengan Bab IV UU No. 27 Tahun 2022, sebagai pemilik data pribadi Anda memiliki hak:
            </p>
            <ul className="pl-11 space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-black text-slate-800 shrink-0">• Hak Informasi:</span>
                <span>Mendapatkan kejelasan mengenai identitas pihak pengelola, tujuan pemrosesan, dan akuntabilitas data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-slate-800 shrink-0">• Hak Perbaikan:</span>
                <span>Mengajukan koreksi atau pembaharuan apabila data yang telah dikirimkan tidak akurat atau tidak lengkap.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-slate-800 shrink-0">• Hak Akses:</span>
                <span>Meminta konfirmasi dan akses terhadap riwayat respon yang telah diserahkan melalui kanal resmi dinas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-slate-800 shrink-0">• Hak Penarikan Persetujuan:</span>
                <span>Menarik persetujuan pemrosesan data pribadi untuk kegiatan yang tidak berlandaskan kewajiban hukum undang-undang.</span>
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Bagian 6: Kontak Pengelola Data */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">6</span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kontak Pengelola Data (Walidata)</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-11">
              Apabila Anda memiliki pertanyaan, keberatan, atau ingin menggunakan hak Anda terkait pelindungan data pribadi, silakan hubungi kami melalui:
            </p>
            <div className="pl-11 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3">
                <Building2 size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instansi</p>
                  <p className="text-xs font-bold text-slate-800">Diskominfo Garut</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3">
                <MapPin size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat</p>
                  <p className="text-xs font-bold text-slate-800 truncate">Jl. Pembangunan No. 181</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3">
                <Mail size={20} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surat Elektronik</p>
                  <p className="text-xs font-bold text-slate-800 truncate">diskominfo@garutkab.go.id</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Tombol Kembali Bagian Bawah */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Halaman Sebelumnya
          </button>
        </div>

      </main>

    </div>
  );
};

export default PrivacyPolicy;
