import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react'; // Tambahkan icon lucide
import logoPanjang from '../assets/images/logopanjang.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img 
              src={logoPanjang} 
              alt="Statistik Center Logo" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Desktop Menu Items */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-brand-primary transition-all">Beranda</Link>
          <a href="/tentang" className="hover:text-brand-primary transition-all">Tentang</a>
          <a href="/kegiatan" className="hover:text-brand-primary transition-all">Kegiatan</a>
          <a href="/kontak" className="hover:text-brand-primary transition-all">Kontak</a>
          
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-brand-primary/30 transition-all duration-300"
          >
            Login Admin
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`
        fixed inset-x-0 top-[73px] bg-white border-b border-slate-100 shadow-xl transition-all duration-300 ease-in-out md:hidden overflow-hidden
        ${isOpen ? 'max-h-screen opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}
      `}>
        <div className="flex flex-col px-6 gap-4">
          <Link to="/" onClick={toggleMenu} className="text-lg font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl">Beranda</Link>
          <a href="/tentang" onClick={toggleMenu} className="text-lg font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl">Tentang</a>
          <a href="/kegiatan" onClick={toggleMenu} className="text-lg font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl">Kegiatan</a>
          <a href="/kontak" onClick={toggleMenu} className="text-lg font-bold text-slate-700 p-3 hover:bg-slate-50 rounded-xl">Kontak</a>
          
          <div className="h-px bg-slate-100 my-2"></div>
          
          <Link 
            to="/login" 
            onClick={toggleMenu}
            className="bg-brand-primary text-white p-4 rounded-2xl font-black text-center shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> LOGIN ADMIN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;