import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTop Component (Tombol Kembali ke Atas)
 * 
 * Fitur floating button modern yang muncul secara halus saat halaman di-scroll ke bawah.
 * Dilengkapi dengan:
 * - Circular Progress Ring SVG indikator persentase scroll halaman (0% - 100%)
 * - Tooltip "Kembali ke Atas" dengan animasi mikro
 * - Transisi halus masuk/keluar (fade, scale, translate)
 * - Kompatibel dengan tema Terang & Gelap (Dark Mode)
 * - Mendukung scrolling window (halaman publik) & scrolling container (layout admin)
 */
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Hitung scroll dan progress dari window atau container scroll
  const handleScroll = useCallback(() => {
    // 1. Cek scroll window / document
    const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const winHeight = document.documentElement.scrollHeight - window.innerHeight;
    const winProgress = winHeight > 0 ? (winScroll / winHeight) * 100 : 0;

    // 2. Cek scroll container jika ada (misal layout admin dengan overflow-y-auto)
    let containerScroll = 0;
    let containerProgress = 0;
    const adminMain = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
    if (adminMain) {
      containerScroll = adminMain.scrollTop;
      const maxScroll = adminMain.scrollHeight - adminMain.clientHeight;
      containerProgress = maxScroll > 0 ? (containerScroll / maxScroll) * 100 : 0;
    }

    const currentScroll = Math.max(winScroll, containerScroll);
    const currentProgress = Math.min(100, Math.max(winProgress, containerProgress));

    setScrollProgress(Math.round(currentProgress));
    setIsVisible(currentScroll > 250);
  }, []);

  useEffect(() => {
    // Jalankan kalkulasi posisi scroll setelah frame render pertama
    const rafId = requestAnimationFrame(handleScroll);

    // Event listener scroll pada window dan capture event untuk scroll container internal
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [handleScroll, location.pathname]);

  // Aksi scroll ke paling atas
  const scrollToTop = () => {
    // Scroll window
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Scroll juga container internal jika sedang berada di panel admin
    const adminMain = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
    if (adminMain) {
      adminMain.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Kalkulasi circle SVG progress
  const radius = 20;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  // Cek jika halaman saat ini adalah FormBuilder agar tombol tidak menutupi Floating Action Button
  const isFormBuilder = location.pathname.includes('/admin/formulir/builder') || 
                        location.pathname.includes('/admin/formulir/edit');

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-out flex items-center justify-center ${
        isFormBuilder ? 'bottom-24 right-6 sm:right-8' : 'bottom-6 right-6 sm:bottom-8 sm:right-8'
      } ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
      }`}
    >
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip Indikator */}
        <div
          role="tooltip"
          className={`absolute bottom-full mb-3 right-0 whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-brand-dark/95 text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 shadow-xl backdrop-blur-md pointer-events-none transition-all duration-200 flex items-center gap-1.5 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <ArrowUp size={12} className="text-brand-primary animate-pulse" />
          <span>Kembali ke Atas</span>
          <span className="text-[9px] font-extrabold text-brand-primary ml-0.5">
            {scrollProgress}%
          </span>
          {/* Segitiga Panah Tooltip mengarah ke tengah tombol */}
          <div className="absolute top-full right-[20px] -mt-1 border-4 border-transparent border-t-slate-900/95 dark:border-t-brand-dark/95" />
        </div>

        {/* Tombol Utama */}
        <button
          type="button"
          onClick={scrollToTop}
          tabIndex={isVisible ? 0 : -1}
          aria-label="Kembali ke atas halaman"
          title="Kembali ke atas"
          className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-100 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/40 hover:shadow-2xl hover:shadow-brand-primary/25 hover:border-brand-primary/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand-primary/50"
        >
          {/* SVG Circular Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 transform pointer-events-none p-0.5"
            viewBox="0 0 48 48"
          >
            <defs>
              <linearGradient id="backToTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D2B4" />
                <stop offset="100%" stopColor="#00A3FF" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-slate-200/70 dark:stroke-white/10"
              strokeWidth="2.5"
              fill="transparent"
            />

            {/* Dynamic Progress Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="url(#backToTopGrad)"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Icon Arrow Up dengan micro-interaction */}
          <ArrowUp
            size={19}
            className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 text-slate-700 dark:text-slate-200 group-hover:text-brand-primary"
          />
        </button>
      </div>
    </div>
  );
};

export default BackToTop;
