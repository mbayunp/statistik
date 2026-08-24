import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Calendar,
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
  FileText,
  ListChecks,
  Link as LinkIcon,
  Menu,
  X,
  History,
  Briefcase,
  UserCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isKeuanganOpen, setIsKeuanganOpen] = useState(false);
  const [isRekapanOpen, setIsRekapanOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const rekapanCategories = [
    "PENGELOLAAN PORTAL", "PENGEMBANGAN FRONTEND", "PENGEMBANGAN BACKEND", 
    "ADMINISTRASI", "FGD/RAPAT/UNDANGAN", "MANAJEMEN DATA", "METADATA", "INFOGRAFIS", "ZOOM"
  ];

  const topMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Kalender Utama', path: '/admin/kalender', icon: <Calendar size={20} /> },
  ];

  const midMenus = [
    { name: 'Riwayat Aktivitas', path: '/admin/riwayat-aktivitas', icon: <History size={20} /> },
    { name: 'Rekapan Permohonan', path: '/admin/rekapan-permohonan', icon: <Database size={20} /> },
    { name: 'Publikasi Kegiatan', path: '/admin/kegiatan', icon: <Globe size={20} /> },
    { name: 'Surat Masuk', path: '/admin/surat/masuk', icon: <Mail size={20} />},
    { name: 'Surat Keluar', path: '/admin/surat/keluar', icon: <Send size={20} /> },
    { name: 'Data Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    { name: 'Pembuat Formulir', path: '/admin/formulir', icon: <ListChecks size={20} /> },
    { name: 'Tautan Pendek', path: '/admin/tautan', icon: <LinkIcon size={20} /> },
    { name: 'Laporan Tenaga Ahli', path: '/admin/laporan-tenaga-ahli', icon: <FileText size={20} /> }, 
    { name: 'Laporan Kinerja', path: '/admin/laporan-kinerja', icon: <Briefcase size={20} /> }, 
    { name: 'Daftar Kegiatan', path: '/admin/daftar-kegiatan', icon: <Eye size={20} /> },
    { name: 'Berkas Arsip', path: '/admin/berkas-arsip', icon: <Archive size={20} /> },
    { name: 'Kepala Bidang', path: '/admin/penugasan', icon: <ClipboardList size={20} /> },
    { name: 'Aset Bidang', path: '/admin/aset', icon: <Monitor size={20} /> },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard')) return 'Dashboard';
    if (path.startsWith('/admin/riwayat-aktivitas')) return 'Riwayat Aktivitas';
    if (path.startsWith('/admin/rekapan-permohonan')) return 'Rekapan Permohonan';
    if (path.startsWith('/admin/kalender')) return 'Kalender Utama';
    if (path.startsWith('/admin/kegiatan')) return 'Publikasi Kegiatan';
    if (path.startsWith('/admin/surat/masuk')) return 'Surat Masuk';
    if (path.startsWith('/admin/surat/keluar')) return 'Surat Keluar';
    if (path.startsWith('/admin/pegawai')) return 'Data Pegawai';
    if (path.startsWith('/admin/formulir')) return 'Pembuat Formulir';
    if (path.startsWith('/admin/tautan')) return 'Tautan Pendek';
    if (path.startsWith('/admin/laporan-tenaga-ahli')) return 'Laporan Tenaga Ahli';
    if (path.startsWith('/admin/laporan-kinerja')) return 'Laporan Kinerja';
    if (path.startsWith('/admin/daftar-kegiatan')) return 'Daftar Kegiatan';
    if (path.startsWith('/admin/berkas-arsip')) return 'Berkas Arsip';
    if (path.startsWith('/admin/penugasan')) return 'Kepala Bidang';
    if (path.startsWith('/admin/aset')) return 'Aset Bidang';
    if (path.startsWith('/admin/rekapan')) {
      const params = new URLSearchParams(location.search);
      const kat = params.get('kategori');
      return kat ? `Rekapan: ${kat}` : 'Rekapan Internal';
    }
    if (path.startsWith('/admin/keuangan')) return 'Keuangan & PBJ';
    return 'Admin Panel';
  };

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
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar aside */}
      <aside className={`
        bg-brand-dark text-white flex flex-col shrink-0 shadow-2xl z-50 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out
        fixed inset-y-0 left-0 lg:static lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 w-72 sm:w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        
        {/* Sidebar Header */}
        <div className={`p-5 mb-2 flex items-center justify-between border-b border-white/10 sticky top-0 bg-brand-dark z-10 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
          <div className={`flex items-center ${isCollapsed ? 'lg:justify-center lg:w-full' : 'gap-3'}`}>
            <div className="bg-white/10 p-2 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
              <img src={logo} alt="Logo" className="h-6 w-6 object-contain brightness-0 invert shrink-0" />
            </div>
            <div className={`flex flex-col animate-in fade-in duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className="font-black text-[11px] tracking-tight leading-tight uppercase text-white">Admin Statistik</span>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase opacity-90">Kab. Garut</span>
            </div>
          </div>
          {/* Close button on mobile sidebar drawer */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-3 space-y-1.5 pb-6">
          <Link 
            to="/" 
            onClick={() => setIsMobileOpen(false)} 
            className={`flex items-center justify-center min-h-[44px] rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 mb-5 ${isCollapsed ? 'h-11 w-11 p-0 border-none' : 'px-4 py-3 gap-2.5'}`}
          >
            <ExternalLink size={18} /> 
            {!isCollapsed && 'Lihat Website'}
          </Link>

          {topMenu.map(renderMenuItem)}

          {/* Rekapan Internal Accordion */}
          <div className="pt-1">
            <button 
              onClick={() => isCollapsed ? (setIsCollapsed(false), setIsRekapanOpen(true)) : setIsRekapanOpen(!isRekapanOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${isCollapsed ? 'justify-center px-0!' : ''} ${location.pathname.includes('/admin/rekapan') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={20} /> 
                {!isCollapsed && 'Rekapan Internal'}
              </div>
              {!isCollapsed && (isRekapanOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
              {isCollapsed && (
                <div className="absolute left-20 bg-brand-dark border border-white/10 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">
                  Rekapan Internal
                </div>
              )}
            </button>
            
            {!isCollapsed && (
              <div className={`grid transition-all duration-300 ease-in-out ${isRekapanOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="ml-3 flex flex-col gap-1 border-l-2 border-white/10 pl-3 py-1">
                    {rekapanCategories.map((cat) => (
                      <Link 
                        key={cat} 
                        to={`/admin/rekapan?kategori=${encodeURIComponent(cat)}`} 
                        onClick={() => setIsMobileOpen(false)} 
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all flex items-center gap-2 ${
                          isActiveRekapan(cat) 
                          ? 'bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/20' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActiveRekapan(cat) ? 'bg-white' : 'bg-slate-600'}`} />
                        <span className="truncate">{cat}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {midMenus.map(renderMenuItem)}

          {/* Keuangan Accordion */}
          <div className="pt-1">
            <button 
              onClick={() => isCollapsed ? (setIsCollapsed(false), setIsKeuanganOpen(true)) : setIsKeuanganOpen(!isKeuanganOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative group ${isCollapsed ? 'justify-center px-0!' : ''} ${location.pathname.includes('/admin/keuangan') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} /> 
                {!isCollapsed && 'Keuangan'}
              </div>
              {!isCollapsed && (isKeuanganOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
              {isCollapsed && (
                <div className="absolute left-20 bg-brand-dark border border-white/10 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">
                  Keuangan
                </div>
              )}
            </button>
            
            {!isCollapsed && (
              <div className={`grid transition-all duration-300 ease-in-out ${isKeuanganOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="ml-3 flex flex-col gap-1 border-l-2 border-white/10 pl-3 py-1">
                    <Link 
                      to="/admin/keuangan/anggaran" 
                      onClick={() => setIsMobileOpen(false)} 
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all flex items-center gap-2 ${
                        location.pathname === '/admin/keuangan/anggaran' 
                        ? 'bg-brand-primary text-white font-bold shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${location.pathname === '/admin/keuangan/anggaran' ? 'bg-white' : 'bg-slate-600'}`} />
                      <span>Realisasi Anggaran</span>
                    </Link>
                    <Link 
                      to="/admin/keuangan/pengadaan/modal" 
                      onClick={() => setIsMobileOpen(false)} 
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all flex items-center gap-2 ${
                        location.pathname === '/admin/keuangan/pengadaan/modal' 
                        ? 'bg-brand-primary text-white font-bold shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${location.pathname === '/admin/keuangan/pengadaan/modal' ? 'bg-white' : 'bg-slate-600'}`} />
                      <span>PBJ Modal</span>
                    </Link>
                    <Link 
                      to="/admin/keuangan/pengadaan/pegawai" 
                      onClick={() => setIsMobileOpen(false)} 
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all flex items-center gap-2 ${
                        location.pathname === '/admin/keuangan/pengadaan/pegawai' 
                        ? 'bg-brand-primary text-white font-bold shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${location.pathname === '/admin/keuangan/pengadaan/pegawai' ? 'bg-white' : 'bg-slate-600'}`} />
                      <span>PBJ Pegawai</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Sidebar Action */}
        <div className="p-3 mt-auto border-t border-white/10 space-y-1 sticky bottom-0 bg-brand-dark z-10">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-xl transition-all font-bold text-xs uppercase cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /> Kecilkan Menu</>}
          </button>
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-red-400 font-bold text-xs hover:bg-red-500/15 rounded-xl transition-all uppercase cursor-pointer relative group ${isCollapsed ? 'justify-center px-0!' : ''}`}
          >
            <div className="flex items-center justify-center min-w-[20px]"><LogOut size={20} /></div>
            {!isCollapsed && 'Logout'}
            {isCollapsed && (
              <div className="absolute left-20 bg-red-500 text-white text-[10px] font-black tracking-widest px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-100 shadow-xl">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Sticky Mobile Topbar Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between lg:hidden shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2.5 -ml-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-all cursor-pointer shrink-0"
              aria-label="Buka menu navigasi"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-brand-primary uppercase tracking-wider leading-none">Admin Statistik</span>
                <span className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight truncate">
                  {getPageTitle()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link 
              to="/" 
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
              title="Lihat Website Utama"
            >
              <Globe size={19} />
            </Link>
            
            <div className="w-px h-5 bg-slate-200 mx-0.5" />

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="Logout / Keluar"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* Desktop Top Header Bar (Breadcrumb & User Badge) */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Admin</span>
            <span>/</span>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100/70 transition-all"
            >
              <Globe size={15} />
              <span>Lihat Website</span>
            </Link>

            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                <UserCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">Admin Portal</span>
                <span className="text-[10px] font-semibold text-slate-400 leading-none">Kabupaten Garut</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;