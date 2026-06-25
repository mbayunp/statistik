import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, Sun, Moon } from 'lucide-react';
import logoPanjang from '../assets/images/logopanjang.png';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-brand-dark/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img 
              src={logoPanjang} 
              alt="Statistik Center Logo" 
              className="h-8 md:h-12 w-auto object-contain dark:brightness-0 dark:invert transition-all" 
            />
          </Link>
        </div>

        {/* Desktop Menu Items */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-brand-primary dark:hover:text-brand-primary transition-all">Beranda</Link>
          <Link to="/tentang" className="hover:text-brand-primary dark:hover:text-brand-primary transition-all">Tentang</Link>
          <Link to="/kegiatan" className="hover:text-brand-primary dark:hover:text-brand-primary transition-all">Kegiatan</Link>
          <Link to="/kontak" className="hover:text-brand-primary dark:hover:text-brand-primary transition-all">Kontak</Link>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-600 dark:text-slate-300 active:scale-90 cursor-pointer"
            title={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
          >
            {darkMode ? <Sun size={20} className="text-amber-400 animate-pulse" /> : <Moon size={20} />}
          </button>

          <Link 
            to="/login" 
            className="bg-linear-to-r from-brand-primary to-brand-secondary text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-brand-primary/30 transition-all duration-300"
          >
            Login Admin
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors active:scale-90 cursor-pointer"
          >
            {darkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} />}
          </button>
          
          <button 
            onClick={toggleMenu}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`
        fixed inset-x-0 top-[57px] md:top-[80px] bg-white dark:bg-brand-dark border-b border-slate-100 dark:border-white/5 shadow-xl transition-all duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-y-0 opacity-100 py-6 pointer-events-auto' : '-translate-y-4 opacity-0 py-0 pointer-events-none h-0 overflow-hidden'}
      `}>
        <div className="flex flex-col px-6 gap-4">
          <Link to="/" onClick={toggleMenu} className="text-lg font-bold text-slate-700 dark:text-slate-200 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">Beranda</Link>
          <Link to="/tentang" onClick={toggleMenu} className="text-lg font-bold text-slate-700 dark:text-slate-200 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">Tentang</Link>
          <Link to="/kegiatan" onClick={toggleMenu} className="text-lg font-bold text-slate-700 dark:text-slate-200 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">Kegiatan</Link>
          <Link to="/kontak" onClick={toggleMenu} className="text-lg font-bold text-slate-700 dark:text-slate-200 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">Kontak</Link>
          
          <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>
          
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