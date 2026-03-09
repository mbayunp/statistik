import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut, 
  Globe, 
  Eye, 
  ExternalLink, 
  Archive, 
  Wallet, 
  ChevronDown, 
  ChevronUp, 
  Mail,
  Send,
  Monitor,
  CheckCircle2,
  Database
} from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State untuk mengontrol dropdown
  const [isKeuanganOpen, setIsKeuanganOpen] = useState(false);
  const [isRekapanOpen, setIsRekapanOpen] = useState(false);

  // Kategori untuk Sub-menu Rekapan Internal
  const rekapanCategories = [
    "PENGELOLAAN PORTAL", "PENGEMBANGAN FRONTEND", "PENGEMBANGAN BACKEND", 
    "ADMINISTRASI", "FGD/RAPAT/UNDANGAN", "MANAJEMEN DATA", "METADATA" , "INFOGRAFIS"
  ];

  // Menu Utama (Tanpa Dropdown)
  const mainMenus = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Publikasi Kegiatan', path: '/admin/kegiatan', icon: <Globe size={20} /> },
    { name: 'Surat Masuk', path: '/admin/surat/masuk', icon: <Mail size={20} />},
    { name: 'Surat Keluar', path: '/admin/surat/keluar', icon: <Send size={20} /> },
    { name: 'Data Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    { name: 'Daftar Kegiatan', path: '/admin/daftar-kegiatan', icon: <Eye size={20} /> },
    { name: 'Berkas Arsip', path: '/admin/berkas-arsip', icon: <Archive size={20} /> },
    { name: 'Kepala Bidang', path: '/admin/penugasan', icon: <ClipboardList size={20} /> },
    { name: 'Aset Bidang', path: '/admin/aset', icon: <Monitor size={20} /> },
    { name: 'Rekapan Permohonan', path: '/admin/rekapan-permohonan', icon: <Database size={20} /> },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar sistem?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#cbd5e1',
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  const isActiveRekapan = (cat: string) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/admin/rekapan' && params.get('kategori') === cat;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR UTAMA */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col shrink-0 shadow-2xl z-20 overflow-y-auto custom-scrollbar">
        <div className="p-6 mb-4 flex items-center gap-3 border-b border-white/5 sticky top-0 bg-brand-dark z-10">
          <img src={logo} alt="Logo" className="h-8 brightness-0 invert" />
          <div className="flex flex-col">
             <span className="font-black text-[10px] tracking-tighter leading-tight uppercase opacity-80">Admin<br/>Statistik</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 pb-6">
          {/* Tombol Kembali ke Website */}
          <Link
            to="/"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 mb-6"
          >
            <ExternalLink size={18} /> Lihat Website
          </Link>

          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2 mt-4">Main Menu</div>
          
          {/* Render Menu Utama Statis */}
          {mainMenus.map((menu) => {
            const isActive = location.pathname.startsWith(menu.path);
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                  isActive 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {menu.icon} {menu.name}
              </Link>
            );
          })}

          <div className="pt-2">
            <button 
              onClick={() => setIsRekapanOpen(!isRekapanOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                location.pathname.includes('/admin/rekapan') 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={20} /> Rekapan Internal
              </div>
              {isRekapanOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            
            {isRekapanOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-1 border-l border-white/10 pl-2 animate-in slide-in-from-top-2 duration-200">
                {rekapanCategories.map((cat) => (
                  <Link 
                    key={cat}
                    to={`/admin/rekapan?kategori=${encodeURIComponent(cat)}`}
                    className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                      isActiveRekapan(cat)
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {isActiveRekapan(cat) && <CheckCircle2 size={12} />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* --- MENU KEUANGAN (DROPDOWN) --- */}
          <div className="pt-2">
            <button 
              onClick={() => setIsKeuanganOpen(!isKeuanganOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                location.pathname.includes('/admin/keuangan') 
                ? 'bg-brand-primary/10 text-brand-primary' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} /> Keuangan
              </div>
              {isKeuanganOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            
            {isKeuanganOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-1 border-l border-white/10 pl-2 animate-in slide-in-from-top-2 duration-200">
                <Link 
                  to="/admin/keuangan/anggaran" 
                  className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    location.pathname === '/admin/keuangan/anggaran' 
                    ? 'bg-brand-primary text-white shadow-md' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Realisasi Anggaran
                </Link>
                <Link 
                  to="/admin/keuangan/pengadaan/modal" 
                  className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    location.pathname === '/admin/keuangan/pengadaan/modal' 
                    ? 'bg-brand-primary text-white shadow-md' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  PBJ - Modal
                </Link>
                <Link 
                  to="/admin/keuangan/pengadaan/pegawai" 
                  className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    location.pathname === '/admin/keuangan/pengadaan/pegawai' 
                    ? 'bg-brand-primary text-white shadow-md' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  PBJ - Pegawai
                </Link>
              </div>
            )}
          </div>
          
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-1 sticky bottom-0 bg-brand-dark z-10">
            <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
            >
                <LogOut size={20} /> Logout
            </button>
        </div>
      </aside>

      {/* AREA KONTEN TENGAH */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;