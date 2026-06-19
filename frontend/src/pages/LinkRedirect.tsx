import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

const LinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/links/redirect/${code}`);
        if (res.data.success && res.data.url) {
          // Lakukan pengalihan ke URL asli
          window.location.replace(res.data.url);
        }
      } catch (err) {
        console.error("Gagal mengalihkan:", err);
        setError(true);
      }
    };

    processRedirect();
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle size={64} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">Tautan Tidak Valid</h1>
        <p className="text-slate-500 font-medium mb-8">Tautan ini mungkin sudah dihapus, kadaluarsa, atau salah ketik.</p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-primary transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Loader2 size={48} className="animate-spin text-brand-primary mb-4" />
      <h2 className="text-xl font-black text-slate-700">Mengalihkan...</h2>
      <p className="text-slate-400 text-sm font-medium mt-2">Mohon tunggu sebentar, Anda sedang diarahkan.</p>
    </div>
  );
};

export default LinkRedirect;