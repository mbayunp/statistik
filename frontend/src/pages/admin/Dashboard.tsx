import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Tambahkan import useNavigate
import { 
  Users, 
  Mail, 
  Send,
  ClipboardCheck, 
  ArrowUpRight, 
  Activity, 
  LayoutDashboard,
  Clock,
  Archive,
  Wallet,
  Briefcase,
  Monitor,
  RefreshCw,
  Database
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Dashboard: React.FC = () => {
  const navigate = useNavigate(); // 2. Inisialisasi navigate

  const [stats, setStats] = useState({
    publikasi: 0,
    suratMasuk: 0,
    suratKeluar: 0,
    rekapan: 0,
    pegawai: 0,
    berkas: 0,
    keuangan: 0,
    penugasan: 0,
    aset: 0,
    rekapanPermohonan: 0 
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      
      const endpoints = [
        { key: 'publikasi', url: `${API_BASE_URL}/api/kegiatan` },
        { key: 'suratMasuk', url: `${API_BASE_URL}/api/surat/masuk` },
        { key: 'suratKeluar', url: `${API_BASE_URL}/api/surat/keluar` },
        { key: 'rekapan', url: `${API_BASE_URL}/api/rekapan` },
        { key: 'pegawai', url: `${API_BASE_URL}/api/pegawai` },
        { key: 'berkas', url: `${API_BASE_URL}/api/berkas` },
        { key: 'penugasan', url: `${API_BASE_URL}/api/penugasan` },
        { key: 'aset', url: `${API_BASE_URL}/api/aset` },
        { key: 'keuangan_anggaran', url: `${API_BASE_URL}/api/keuangan?jenis=anggaran` },
        { key: 'keuangan_modal', url: `${API_BASE_URL}/api/keuangan?jenis=pengadaan&kategori=modal` },
        { key: 'keuangan_pegawai', url: `${API_BASE_URL}/api/keuangan?jenis=pengadaan&kategori=pegawai` }
      ];

      const internalResults = await Promise.all(
        endpoints.map(async (ep) => {
          try {
            const res = await axios.get(ep.url);
            let count = 0;
            
            if (Array.isArray(res.data?.data)) {
              count = res.data.data.length;
            } else if (Array.isArray(res.data)) {
              count = res.data.length;
            } else if (Array.isArray(res.data?.rows)) {
              count = res.data.rows.length;
            }

            return { key: ep.key, count };
          } catch (error: any) {
            console.error(`❌ Gagal memuat ${ep.key} (${ep.url}):`, error.message);
            return { key: ep.key, count: 0 };
          }
        })
      );

      const counts = internalResults.reduce((acc, item) => {
        acc[item.key] = item.count;
        return acc;
      }, {} as Record<string, number>);

      let totalPermohonan = 0;
      try {
        const resPermohonan = await axios.get('/api-garut/api/request-data/total');
        const dataPermohonan = resPermohonan.data?.data || [];
        
        totalPermohonan = dataPermohonan.reduce((sum: number, item: any) => {
          return sum + (item.jumlah_selesai + item.jumlah_ditolak + item.jumlah_diproses + item.dalam_pengajuan);
        }, 0);
      } catch (error) {
        console.error("Gagal mengambil data Rekapan Permohonan Eksternal", error);
      }

      setStats({
        publikasi: counts.publikasi || 0,
        suratMasuk: counts.suratMasuk || 0,
        suratKeluar: counts.suratKeluar || 0,
        rekapan: counts.rekapan || 0,
        pegawai: counts.pegawai || 0,
        berkas: counts.berkas || 0,
        penugasan: counts.penugasan || 0,
        aset: counts.aset || 0,
        keuangan: (counts.keuangan_anggaran || 0) + (counts.keuangan_modal || 0) + (counts.keuangan_pegawai || 0),
        rekapanPermohonan: totalPermohonan
      });

    } catch (err) {
      console.error("Gagal mengambil data dashboard secara keseluruhan", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 3. Tambahkan properti 'path' untuk tujuan URL saat kartu diklik
  const statCards = [
    { label: 'Publikasi Kegiatan', value: stats.publikasi, icon: <Activity size={24} />, color: 'bg-blue-50', textColor: 'text-blue-600', path: '/admin/kegiatan' },
    { label: 'Surat Masuk', value: stats.suratMasuk, icon: <Mail size={24} />, color: 'bg-emerald-50', textColor: 'text-emerald-600', path: '/admin/surat/masuk' },
    { label: 'Surat Keluar', value: stats.suratKeluar, icon: <Send size={24} />, color: 'bg-orange-50', textColor: 'text-orange-600', path: '/admin/surat/keluar' },
    { label: 'Rekapan Internal', value: stats.rekapan, icon: <ClipboardCheck size={24} />, color: 'bg-amber-50', textColor: 'text-amber-600', path: '/admin/rekapan' },
    { label: 'Data Pegawai', value: stats.pegawai, icon: <Users size={24} />, color: 'bg-indigo-50', textColor: 'text-indigo-600', path: '/admin/pegawai' },
    { label: 'Berkas Arsip', value: stats.berkas, icon: <Archive size={24} />, color: 'bg-rose-50', textColor: 'text-rose-600', path: '/admin/berkas-arsip' },
    { label: 'Lap. Keuangan', value: stats.keuangan, icon: <Wallet size={24} />, color: 'bg-teal-50', textColor: 'text-teal-600', path: '/admin/keuangan/anggaran' },
    { label: 'Form Penugasan', value: stats.penugasan, icon: <Briefcase size={24} />, color: 'bg-purple-50', textColor: 'text-purple-600', path: '/admin/penugasan' },
    { label: 'Aset Bidang', value: stats.aset, icon: <Monitor size={24} />, color: 'bg-cyan-50', textColor: 'text-cyan-600', path: '/admin/aset' },
    { label: 'Rekap Permohonan', value: stats.rekapanPermohonan, icon: <Database size={24} />, color: 'bg-fuchsia-50', textColor: 'text-fuchsia-600', path: '/admin/rekapan-permohonan' },
  ];

  return (
    <div>
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50 min-h-screen text-left">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <LayoutDashboard size={20} />
              </div>
              <span className="text-xs font-black text-brand-primary uppercase tracking-widest">Administrator Panel</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-brand-dark uppercase tracking-tight">
              Ringkasan Statistik
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-fit">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <Clock size={20} />
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Waktu Server</p>
                <p className="text-sm font-black text-brand-dark">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <button 
              onClick={fetchDashboardData} 
              disabled={isRefreshing}
              className="w-14 h-14 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-all shadow-xl active:scale-90 disabled:opacity-50"
              title="Perbarui Data"
            >
              <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* === STATS GRID SECTION === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => navigate(card.path)} // 4. Eksekusi navigasi saat diklik
              className="bg-white p-1 rounded-[2.5rem] shadow-sm border border-slate-200 group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 cursor-pointer" // 5. Tambahkan cursor-pointer
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${card.color} ${card.textColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    {card.icon}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-1 truncate">{card.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-brand-dark">
                      {loading ? "..." : card.value}
                    </h3>
                    <span className="text-xs font-bold text-slate-400">Total Data</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;