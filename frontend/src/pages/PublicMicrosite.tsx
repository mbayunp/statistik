import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, X, Lock, Loader2, AlertCircle, Share2, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';
import {
  type MicrositeData,
  MICROSITE_THEMES,
  renderMicrositeIcon
} from '../utils/micrositeConfig';
import pemkabLogo from '../assets/images/logo.png';
import gsdLogo from '../assets/images/logo-gsd.png';

const PublicMicrosite: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [microsite, setMicrosite] = useState<MicrositeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ message: string; isInactive?: boolean } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const fetchMicrosite = async () => {
      setIsLoading(true);
      setErrorState(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/microsites/public/${slug}`);
        if (res.data?.success) {
          setMicrosite(res.data.data);
          document.title = `${res.data.data.title} | Portal Kegiatan`;
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setErrorState({
            message: err.response?.data?.message || 'Portal microsite tidak ditemukan.',
            isInactive: err.response?.data?.is_inactive
          });
        } else {
          setErrorState({ message: 'Terjadi kesalahan saat memuat halaman portal.' });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchMicrosite();
    }
  }, [slug]);

  const handleCopyCurrentUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-primary mb-3" size={36} />
        <p className="text-sm font-bold text-slate-500">Memuat portal kegiatan...</p>
      </div>
    );
  }

  if (errorState || !microsite) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            {errorState?.isInactive ? <Lock size={28} /> : <AlertCircle size={28} />}
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">
            {errorState?.isInactive ? 'Portal Ditutup' : 'Portal Tidak Ditemukan'}
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {errorState?.message || 'Tautan portal yang Anda buka tidak tersedia.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-primary transition-colors cursor-pointer"
          >
            Ke Beranda Portal
          </button>
        </div>
      </div>
    );
  }

  const themeId = microsite.theme_config?.theme || 'toska';
  const theme = MICROSITE_THEMES[themeId] || MICROSITE_THEMES.toska;
  const logoType = microsite.theme_config?.logo || 'pemkab';
  const logoSrc = logoType === 'pemkab' ? pemkabLogo : logoType === 'gsd' ? gsdLogo : null;

  const links = Array.isArray(microsite.links_item) ? microsite.links_item : [];

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col items-center justify-between py-10 px-4 sm:px-6 font-sans transition-colors`}>
      
      {/* Tombol Pojok Kanan Atas (Share & QR) */}
      <div className="w-full max-w-md flex justify-end gap-2 mb-4">
        <button
          onClick={handleCopyCurrentUrl}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${theme.cardBg} ${theme.titleColor} hover:opacity-90`}
          title="Salin Tautan"
        >
          {copiedUrl ? <Check size={14} /> : <Share2 size={14} />}
          <span>{copiedUrl ? 'Tersalin' : 'Bagikan'}</span>
        </button>

        <button
          onClick={() => setShowQrModal(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${theme.cardBg} ${theme.titleColor} hover:opacity-90`}
          title="Tampilkan QR Halaman Ini"
        >
          <QrCode size={14} />
          <span>QR Halaman</span>
        </button>
      </div>

      {/* Konten Utama Mobile-First */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center">
        
        {/* Header Logo, Judul & Deskripsi */}
        <div className="text-center mb-7 w-full">
          {logoSrc && (
            <div className="w-20 h-20 rounded-3xl bg-white p-3 shadow-lg mx-auto mb-4 flex items-center justify-center">
              <img src={logoSrc} alt="Logo Instansi" className="w-full h-full object-contain" />
            </div>
          )}

          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-snug ${theme.titleColor}`}>
            {microsite.title}
          </h1>

          {microsite.description && (
            <p className={`text-sm mt-2 leading-relaxed max-w-sm mx-auto ${theme.descColor}`}>
              {microsite.description}
            </p>
          )}
        </div>

        {/* Daftar Tombol & Header Seksi */}
        <div className="w-full space-y-3">
          {links.map((item) => {
            if (item.type === 'header') {
              return (
                <div
                  key={item.id}
                  className={`pt-4 pb-1 text-center text-xs font-extrabold uppercase tracking-widest border-b ${theme.headerTextColor}`}
                >
                  {item.title}
                </div>
              );
            }

            const isItemDisabled = !item.is_active || (item.type === 'form' && item.is_form_active === false);
            const targetUrl = item.url || '#';
            const isInternalPath = targetUrl.startsWith('/');

            if (isItemDisabled) {
              return (
                <div
                  key={item.id}
                  className={`w-full rounded-2xl p-4 flex items-center justify-between gap-3 opacity-60 cursor-not-allowed select-none ${theme.buttonBg}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBoxBg} ${theme.iconColor}`}>
                      {renderMicrositeIcon(item.icon, 19)}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className={`font-bold text-sm truncate ${theme.buttonText}`}>
                        {item.title}
                      </div>
                      <div className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        Ditutup / Belum Tersedia
                      </div>
                    </div>
                  </div>
                  <Lock size={16} className="text-slate-400 shrink-0" />
                </div>
              );
            }

            return (
              <a
                key={item.id}
                href={targetUrl}
                target={isInternalPath ? '_self' : '_blank'}
                rel={isInternalPath ? undefined : 'noopener noreferrer'}
                className={`w-full rounded-2xl p-4 flex items-center justify-between gap-3 transition-all duration-200 ${theme.buttonBg} ${theme.buttonHover}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBoxBg} ${theme.iconColor}`}>
                    {renderMicrositeIcon(item.icon, 19)}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className={`font-bold text-sm leading-snug break-words ${theme.buttonText}`}>
                      {item.title}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${theme.badgeBg}`}>
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </main>

      {/* Footer & Tombol QR Bawah */}
      <footer className="mt-10 pt-6 text-center space-y-3 w-full max-w-md">
        <button
          onClick={() => setShowQrModal(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${theme.cardBg} ${theme.titleColor} hover:opacity-90`}
        >
          <QrCode size={15} /> Tampilkan QR Halaman Ini
        </button>

        <p className={`text-[11px] font-medium ${theme.footerText}`}>
          Diskominfo Kab. Garut &bull; Bidang Penyelenggaraan Statistik Sektoral
        </p>
      </footer>

      {/* Modal QR Code Halaman Ini */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-black text-slate-800 text-base mb-1 pr-6">{microsite.title}</h3>
            <p className="text-xs text-slate-500 mb-4">Pindai QR untuk membuka halaman ini</p>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl inline-block">
              <QRCodeCanvas
                value={currentUrl}
                size={200}
                level="H"
                imageSettings={
                  logoSrc
                    ? {
                        src: logoSrc,
                        height: 40,
                        width: 40,
                        excavate: true
                      }
                    : undefined
                }
              />
            </div>

            <p className="text-[10px] font-mono text-slate-400 mt-3 truncate px-2">{currentUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMicrosite;
