import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Memperbaiki masalah Single Page Application (SPA) di mana saat berpindah halaman
 * (route transition), posisi scroll tidak kembali ke paling atas melainkan tertinggal
 * di bagian bawah atau posisi sebelumnya.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    // Nonaktifkan automatic scroll restoration bawaan browser agar tidak menahan scroll lama
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Jika URL menyertakan anchor hash (misalnya /#kegiatan), arahkan langsung ke elemen target
    if (hash) {
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 60);
      return () => clearTimeout(timer);
    }

    // Reset posisi scroll window & document secara instan ke paling atas
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Pastikan container dengan overflow scroll (seperti pada layout admin) juga di-reset ke atas
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const scrollableContainers = document.querySelectorAll('main, .overflow-y-auto');
      scrollableContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash, key]);

  return null;
};

export default ScrollToTop;
