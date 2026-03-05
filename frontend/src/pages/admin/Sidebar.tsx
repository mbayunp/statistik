import React from 'react';
import { LayoutDashboard, ClipboardList, Settings, Users, Globe } from 'lucide-react'; // Tambahkan Globe
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const mainMenus = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Publikasi Kegiatan', path: '/admin/kegiatan-publik', icon: <Globe size={20} /> },
    { name: 'Rekapan Internal', path: '/admin/kegiatan', icon: <ClipboardList size={20} /> },
    { name: 'Data Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    { name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
      {name : 'Daftar Kegiatan', path : '/admin/daftar-kegiatan', icon : <Globe size={20} />}
  ];

  return (
    <aside className="w-64 bg-brand-dark text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20">
      <div className="p-6 mb-4 flex items-center gap-3 border-b border-white/10">
        <img src={logo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
        <span className="font-black text-xs tracking-tighter leading-tight">ADMIN <br/> PANEL</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {mainMenus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              location.pathname.startsWith(menu.path) 
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {menu.icon} {menu.name}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="bg-white/5 p-4 rounded-2xl">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Login Sebagai</p>
          <p className="text-sm font-bold text-brand-primary">Administrator</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;