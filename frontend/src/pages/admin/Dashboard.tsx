import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  Mail, 
  ClipboardCheck, 
  ArrowUpRight, 
  Activity, 
  LayoutDashboard,
  Clock
} from 'lucide-react';
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from '../../config';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    publikasi: 0,
    suratMasuk: 0,
    rekapan: 0,
    pegawai: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mengambil data dari berbagai endpoint sekaligus
      const [resKegiatan, resSurat, resRekapan, resPegawai] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/kegiatan`),
        axios.get(`${API_BASE_URL}/api/surat-masuk`),
        axios.get(`${API_BASE_URL}/api/rekapan`),
        axios.get(`${API_BASE_URL}/api/pegawai`)
      ]);

      setStats({
        publikasi: resKegiatan.data.data?.length || 0,
        suratMasuk: resSurat.data.data?.length || 0,
        rekapan: resRekapan.data.data?.length || 0,
        pegawai: resPegawai.data.data?.length || 0
      });
    } catch (err) {
      console.error("Gagal mengambil data dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      label: 'Publikasi Kegiatan', 
      value: stats.publikasi, 
      icon: <Activity size={24} />, 
      color: 'bg-blue-500', 
      lightColor: 'bg-blue-50', 
      textColor: 'text-blue-600' 
    },
    { 
      label: 'Surat Masuk', 
      value: stats.suratMasuk, 
      icon: <Mail size={24} />, 
      color: 'bg-rose-500', 
      lightColor: 'bg-rose-50', 
      textColor: 'text-rose-600' 
    },
    { 
      label: 'Rekapan Internal', 
      value: stats.rekapan, 
      icon: <ClipboardCheck size={24} />, 
      color: 'bg-amber-500', 
      lightColor: 'bg-amber-50', 
      textColor: 'text-amber-600' 
    },
    { 
      label: 'Data Pegawai', 
      value: stats.pegawai, 
      icon: <Users size={24} />, 
      color: 'bg-emerald-500', 
      lightColor: 'bg-emerald-50', 
      textColor: 'text-emerald-600' 
    },
  ];

  return (
    <div>
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50 min-h-screen text-left">
        
        {/* Header Section */}
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
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-fit">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Clock size={20} />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Waktu Server</p>
              <p className="text-sm font-black text-brand-dark">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-1 rounded-[2.5rem] shadow-sm border border-slate-200 group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${card.lightColor} ${card.textColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    {card.icon}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:text-brand-primary transition-colors">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{card.label}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Mockup */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Status Operasional</h2>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                Sistem Aktif
              </span>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Koneksi Database', status: 'Connected', color: 'text-emerald-500' },
                { label: 'API Gateway', status: 'Optimal', color: 'text-blue-500' },
                { label: 'Storage Service', status: 'Running', color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-600">{item.label}</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Ilustrasi Dekoratif */}
            <div className="absolute -bottom-12 -right-12 text-slate-50 opacity-10">
              <Activity size={200} />
            </div>
          </div>
          
          {/* Quick Info Card */}
          <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                <FileText className="text-brand-primary" size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Informasi Node</h2>
              <p className="text-slate-400 text-sm font-medium mb-8">Informasi teknis jaringan saat ini.</p>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Host IP</span>
                  <span className="font-mono text-brand-primary text-sm">{API_BASE_URL.replace('http://', '').split(':')[0]}</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Port</span>
                  <span className="font-mono text-white text-sm">5000</span>
                </li>
                <li className="flex justify-between items-center py-3">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Environment</span>
                  <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase">Development</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 mt-10">
              <button onClick={fetchDashboardData} className="w-full py-4 bg-white text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-300">
                Refresh Statistik
              </button>
            </div>

            {/* Gradient Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-primary rounded-full blur-[100px] opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;