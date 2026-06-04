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
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  Monitor,
  Database,
  FileText // Icon baru untuk laporan
} from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isKeuanganOpen, setIsKeuanganOpen] = useState(false);
  const [isRekapanOpen, setIsRekapanOpen] = useState(false);

  const rekapanCategories = [
    "PENGELOLAAN PORTAL", "PENGEMBANGAN FRONTEND", "PENGEMBANGAN BACKEND", 
    "ADMINISTRASI", "FGD/RAPAT/UNDANGAN", "MANAJEMEN DATA", "METADATA", "INFOGRAFIS", "ZOOM"
  ];

  const topMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  ];

  const midMenus = [
    { name: 'Rekapan Permohonan', path: '/admin/rekapan-permohonan', icon: <Database size={20} /> },
    { name: 'Publikasi Kegiatan', path: '/admin/kegiatan', icon: <Globe size={20} /> },
    { name: 'Surat Masuk', path: '/admin/surat/masuk', icon: <Mail size={20} />},
    { name: 'Surat Keluar', path: '/admin/surat/keluar', icon: <Send size={20} /> },
    { name: 'Data Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    // Menu Baru Ditambahkan Di Sini
    { name: 'Laporan Tenaga Ahli', path: '/admin/laporan-tenaga-ahli', icon: <FileText size={20} /> }, 
    { name: 'Daftar Kegiatan', path: '/admin/daftar-kegiatan', icon: <Eye size={20} /> },
    { name: 'Berkas Arsip', path: '/admin/berkas-arsip', icon: <Archive size={20} /> },
    { name: 'Kepala Bidang', path: '/admin/penugasan', icon: <ClipboardList size={20} /> },
    { name: 'Aset Bidang', path: '/admin/aset', icon: <Monitor size={20} /> },
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

  const renderMenuItem = (menu: { name: string, path: string, icon: React.ReactNode }) => {
    const isActive = location.pathname.startsWith(menu.path);
    return (
      <Link
        key={menu.path}
        to={menu.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${
          isActive 
          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        } ${isCollapsed ? 'justify-center px-0!' : ''}`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-md shadow-[0_0_8px_#00D2B4]" />
        )}
        <div className="flex items-center justify-center min-w-[20px]">{menu.icon}</div>
        {!isCollapsed && <span className="truncate">{menu.name}</span>}

        {isCollapsed && (
          <div className="absolute left-20 bg-brand-dark border border-white/10 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100 shadow-xl">
            {menu.name}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`bg-brand-dark text-white flex flex-col shrink-0 shadow-2xl z-20 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        <div className={`p-6 mb-4 flex items-center border-b border-white/5 sticky top-0 bg-brand-dark z-10 ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain brightness-0 invert shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
               <span className="font-black text-[10px] tracking-tighter leading-tight uppercase opacity-80">Admin<br/>Statistik</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2 pb-6">
          <Link to="/" className={`flex items-center justify-center rounded-xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 mb-6 ${isCollapsed ? 'h-11 w-11 p-0 border-none' : 'px-4 py-3 gap-3'}`}>
            <ExternalLink size={18} /> 
            {!isCollapsed && 'Lihat Website'}
          </Link>

          {topMenu.map(renderMenuItem)}

          <div className="pt-2">
            <button 
              onClick={() => isCollapsed ? (setIsCollapsed(false), setIsRekapanOpen(true)) : setIsRekapanOpen(!isRekapanOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${isCollapsed ? 'justify-center px-0!' : ''} ${location.pathname.includes('/admin/rekapan') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={20} /> 
                {!isCollapsed && 'Rekapan Internal'}
              </div>
              {!isCollapsed && (isRekapanOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
              {isCollapsed && (
                <div className="absolute left-20 bg-brand-dark border border-white/10 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">Rekapan Internal</div>
              )}
            </button>
            
            {!isCollapsed && (
              <div className={`grid transition-all duration-300 ease-in-out ${isRekapanOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="ml-4 flex flex-col gap-1 border-l border-white/10 pl-2 pb-1">
                    {rekapanCategories.map((cat) => (
                      <Link key={cat} to={`/admin/rekapan?kategori=${encodeURIComponent(cat)}`} className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase ${isActiveRekapan(cat) ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white'}`}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {midMenus.map(renderMenuItem)}

          <div className="pt-2">
            <button 
              onClick={() => isCollapsed ? (setIsCollapsed(false), setIsKeuanganOpen(true)) : setIsKeuanganOpen(!isKeuanganOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${isCollapsed ? 'justify-center px-0!' : ''} ${location.pathname.includes('/admin/keuangan') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} /> 
                {!isCollapsed && 'Keuangan'}
              </div>
              {!isCollapsed && (isKeuanganOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
              {isCollapsed && (
                <div className="absolute left-20 bg-brand-dark border border-white/10 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">Keuangan</div>
              )}
            </button>
            
            {!isCollapsed && (
              <div className={`grid transition-all duration-300 ease-in-out ${isKeuanganOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="ml-4 flex flex-col gap-1 border-l border-white/10 pl-2 pb-1">
                    <Link to="/admin/keuangan/anggaran" className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase ${location.pathname === '/admin/keuangan/anggaran' ? 'bg-brand-primary text-white font-black' : 'text-slate-500 hover:text-white'}`}>
                      Realisasi Anggaran
                    </Link>
                    <Link to="/admin/keuangan/pengadaan/modal" className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase ${location.pathname === '/admin/keuangan/pengadaan/modal' ? 'bg-brand-primary text-white font-black' : 'text-slate-500 hover:text-white'}`}>
                      PBJ Modal
                    </Link>
                    <Link to="/admin/keuangan/pengadaan/pegawai" className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase ${location.pathname === '/admin/keuangan/pengadaan/pegawai' ? 'bg-brand-primary text-white font-black' : 'text-slate-500 hover:text-white'}`}>
                      PBJ Pegawai
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-1 sticky bottom-0 bg-brand-dark z-10">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-500 hover:text-brand-primary rounded-xl transition-all font-bold text-xs uppercase">
                {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /> Kecilkan Menu</>}
            </button>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase relative group ${isCollapsed ? 'justify-center px-0!' : ''}`}>
                <div className="flex items-center justify-center min-w-[20px]"><LogOut size={20} /></div>
                {!isCollapsed && 'Logout'}
                {isCollapsed && (
                    <div className="absolute left-20 bg-red-500 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">Logout</div>
                )}
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;