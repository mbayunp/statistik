import React, { useState } from 'react';
import axios from 'axios';
import { 
  Mail, Globe, Instagram, MapPin, Clock, 
  Send, Phone, ExternalLink, MessageSquare, 
  Users, Info, CheckCircle2 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const KontakPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: ''
  });
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({type: null, msg: ''});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint ini harus disiapkan di Backend (POST /api/contact)
      await axios.post(`${API_BASE_URL}/api/contact`, formData);
      setStatus({ type: 'success', msg: 'Pesan Anda berhasil dikirim! Admin kami akan segera menghubungi Anda.' });
      setFormData({ nama: '', email: '', subjek: '', pesan: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Gagal mengirim pesan. Silakan coba lagi nanti atau hubungi melalui email langsung.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      
      {/* 1️⃣ HERO KONTAK */}
      <section className="bg-brand-dark text-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Hubungi <span className="text-brand-primary">Kami</span></h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Bidang Penyelenggara Statistik Sektoral Dinas Komunikasi dan Informatika Kabupaten Garut terbuka untuk kolaborasi, permohonan data, serta pertanyaan terkait implementasi Satu Data Kabupaten Garut.
          </p>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px]"></div>
      </section>

      <div className="container mx-auto px-6 -mt-12 relative z-20 pb-20">
        
        {/* 2️⃣ INFORMASI KANTOR & KONTAK RESMI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Card Alamat */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">Alamat Kantor</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Kompleks Pemerintah Kabupaten Garut<br />
              Jl. Pahlawan No. 24, Garut<br />
              Jawa Barat, Indonesia
            </p>
          </div>

          {/* Card Email & Web */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">Kontak Digital</h3>
            <p className="text-brand-primary font-bold mb-1">satudata@garutkab.go.id</p>
            <p className="text-slate-500 font-medium mb-4">satudata.garutkab.go.id</p>
            <div className="flex gap-3">
              <a href="mailto:satudata@garutkab.go.id" className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-primary"><Mail size={20}/></a>
              <a href="https://satudata.garutkab.go.id" target="_blank" className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-brand-primary"><Globe size={20}/></a>
            </div>
          </div>

          {/* Card Media Sosial */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <Instagram size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">Media Sosial</h3>
            <p className="text-slate-500 font-medium mb-6">Dapatkan update edukasi & kegiatan statistik harian kami.</p>
            <a href="https://instagram.com/garutsatudata" target="_blank" className="px-6 py-2 bg-pink-50 text-pink-600 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all">
              @garutsatudata
            </a>
          </div>
        </div>

        {/* 3️⃣ MAPS & JAM LAYANAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8 h-[500px] bg-white rounded-[3rem] overflow-hidden shadow-sm border-8 border-white">
            <iframe 
              title="Lokasi Diskominfo Garut"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.214159518641!2d107.89260387475991!3d-7.216447892789184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68b1a459b9101f%3A0x89753e1a8109315d!2sDiskominfo%20Kabupaten%20Garut!5e0!3m2!1sid!2sid!4v1709600000000!5m2!1sid!2sid"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" 
            />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-dark text-white p-8 rounded-[3rem] shadow-lg">
              <div className="flex items-center gap-4 mb-8">
                <Clock className="text-brand-primary" size={28}/>
                <h3 className="text-xl font-black uppercase tracking-tight">Jam Layanan</h3>
              </div>
              <div className="space-y-4">
                {['Senin - Kamis', 'Jumat'].map((day, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-slate-400 font-bold">{day}</span>
                    <span className="font-black text-brand-primary">{day === 'Jumat' ? '08.00 - 16.30' : '08.00 - 16.00'}</span>
                  </div>
                ))}
                <div className="bg-white/5 p-4 rounded-2xl flex gap-3 items-start mt-4">
                  <Info size={18} className="text-amber-400 shrink-0 mt-1"/>
                  <p className="text-xs text-slate-300 leading-relaxed italic">Istirahat: 12.00 - 13.00 WIB. Layanan tutup pada hari Sabtu, Minggu, dan Libur Nasional.</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-3">
                <Phone size={20} className="text-brand-primary"/> Butuh Bantuan?
              </h3>
              <p className="text-sm text-slate-500 mb-6">Hubungi call center Satu Data untuk bantuan teknis portal.</p>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all">
                Panggil Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* 4️⃣ LAYANAN & FORMULIR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start bg-white p-10 md:p-16 rounded-[4rem] border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Layanan Informasi
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-8 uppercase tracking-tighter">Kami Siap Melayani</h2>
            
            <div className="space-y-8">
              {[
                { title: 'Permohonan Data Statistik', desc: 'Permintaan data sektoral Kabupaten Garut yang tersedia pada Portal Satu Data.', icon: <DatabaseIcon /> },
                { title: 'Konsultasi Pengelolaan Data', desc: 'Bimbingan terkait standar data, metadata, serta interoperabilitas data antar perangkat daerah.', icon: <Users /> },
                { title: 'Kerja Sama Data', desc: 'Kolaborasi dengan instansi pemerintah, akademisi, dan masyarakat dalam pemanfaatan data.', icon: <CheckCircle2 /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem]">
            <h3 className="text-2xl font-black text-brand-dark mb-6 uppercase tracking-tight flex items-center gap-3">
              <MessageSquare size={24} className="text-brand-primary"/> Kirim Pesan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Nama Lengkap" required
                  className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-primary transition-all"
                  value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email" required
                  className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-primary transition-all"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <input 
                type="text" placeholder="Subjek" required
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-primary transition-all"
                value={formData.subjek} onChange={(e) => setFormData({...formData, subjek: e.target.value})}
              />
              <textarea 
                placeholder="Pesan Anda" rows={4} required
                className="w-full px-6 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                value={formData.pesan} onChange={(e) => setFormData({...formData, pesan: e.target.value})}
              />
              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all flex items-center justify-center gap-3"
              >
                {loading ? 'Mengirim...' : 'Kirim Pesan'} <Send size={18} />
              </button>
              
              {status.type && (
                <div className={`mt-4 p-4 rounded-2xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {status.msg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* 5️⃣ AJAKAN KOLABORASI */}
        <section className="mt-24 bg-gradient-to-r from-brand-primary to-blue-600 rounded-[4rem] p-12 md:p-20 text-white text-center relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Kolaborasi Data untuk Pembangunan</h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-10 font-medium">
              Kami membuka kesempatan kerja sama dengan berbagai pihak untuk meningkatkan kualitas data dan mendukung pembangunan berbasis data di Kabupaten Garut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:satudata@garutkab.go.id" className="px-10 py-5 bg-white text-brand-dark rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all shadow-xl">
                Mulai Kerja Sama
              </a>
              <a href="https://satudata.garutkab.go.id" target="_blank" className="px-10 py-5 bg-brand-dark/20 backdrop-blur-md border border-white/20 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all">
                Pelajari Data Sektoral
              </a>
            </div>
          </div>
          {/* Dekorasi Awan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        </section>

      </div>
    </div>
  );
};

// Sub-component untuk icon Database agar tidak perlu install Lucide ekstra
const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);

export default KontakPage;