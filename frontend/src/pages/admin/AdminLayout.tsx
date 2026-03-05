import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, LogOut, Globe, Eye, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const mainMenus = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Publikasi Kegiatan', path: '/admin/kegiatan', icon: <Globe size={20} /> }, 
    { name: 'Surat Masuk', path: '/admin/surat', icon: <ClipboardList size={20} /> }, 
    { name: 'Rekapan Internal', path: '/admin/rekapan', icon: <ClipboardList size={20} /> }, 
    { name: 'Data Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    { name: 'Daftar Kegiatan', path: '/admin/daftar-kegiatan', icon: <Eye size={20} /> }
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar sistem?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      confirmButtonColor: '#ef4444'
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR UTAMA (GELAP) */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col shrink-0 shadow-2xl z-20">
        <div className="p-6 mb-4 flex items-center gap-3 border-b border-white/5">
          <img src={logo} alt="Logo" className="h-8 brightness-0 invert" />
          <div className="flex flex-col">
             <span className="font-black text-[10px] tracking-tighter leading-tight uppercase opacity-80">Admin<br/>Statistik</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {/* Tombol Kembali ke Website (Ditambahkan di atas menu utama) */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 mb-6"
          >
            <ExternalLink size={18} /> Lihat Website
          </Link>

          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-2">Main Menu</div>
          
          {mainMenus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                location.pathname.startsWith(menu.path) 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {menu.icon} {menu.name}
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-1">
            <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
            >
                <LogOut size={20} /> Logout
            </button>
        </div>
      </aside>

      {/* AREA KONTEN TENGAH */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;