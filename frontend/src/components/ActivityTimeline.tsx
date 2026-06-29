import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Info, 
  User, 
  Clock, 
  RefreshCw, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LogItem {
  id: number;
  user_id: number | null;
  module: string;
  action: string;
  description: string;
  created_at: string;
  username: string | null;
}

interface ActivityTimelineProps {
  moduleName?: string;
  limit?: number;
  className?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  moduleName, 
  limit = 10,
  className = '' 
}) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/logs`, {
        params: moduleName ? { module: moduleName } : {},
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setLogs(response.data.data || []);
      } else {
        setError(response.data.message || 'Gagal memuat log aktivitas.');
      }
    } catch (err: unknown) {
      console.error('Error fetching logs:', err);
      let message = 'Koneksi gagal. Pastikan Anda memiliki akses administrator.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [moduleName]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 0) return 'Baru saja';
    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin}m yang lalu`;
    if (diffHour < 24) return `${diffHour}j yang lalu`;
    if (diffDay < 7) return `${diffDay}h yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionConfig = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('INSERT')) {
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        iconBgClass: 'bg-emerald-500 text-white shadow-emerald-200',
        icon: <PlusCircle size={16} />,
        label: 'Tambah'
      };
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return {
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-100',
        iconBgClass: 'bg-sky-500 text-white shadow-sky-200',
        icon: <Edit3 size={16} />,
        label: 'Edit'
      };
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('HAPUS')) {
      return {
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
        iconBgClass: 'bg-rose-500 text-white shadow-rose-200',
        icon: <Trash2 size={16} />,
        label: 'Hapus'
      };
    }
    return {
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-100',
      iconBgClass: 'bg-slate-500 text-white shadow-slate-200',
      icon: <Info size={16} />,
      label: action
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <RefreshCw className="animate-spin text-brand-primary" size={28} />
        <span className="text-xs font-bold uppercase tracking-wider">Memuat riwayat aktivitas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 border border-rose-100 rounded-3xl gap-2">
        <AlertCircle className="text-rose-500" size={32} />
        <p className="text-sm font-black text-rose-700 uppercase tracking-wide">Terjadi Kesalahan</p>
        <p className="text-xs text-rose-500 font-medium max-w-xs">{error}</p>
        <button 
          onClick={fetchLogs} 
          className="mt-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const displayedLogs = logs.slice(0, limit);

  if (displayedLogs.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-4xl">
        <Info className="mx-auto text-slate-300 mb-3" size={40} />
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum Ada Riwayat</h4>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">Semua log aktivitas akan tercatat secara otomatis di sini.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Tombol Refresh Cepat */}
      <div className="absolute -top-12 right-0">
        <button 
          onClick={fetchLogs} 
          className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-brand-dark" 
          title="Refresh Log"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Garis Vertikal Timeline */}
      <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-slate-100"></div>

      <div className="space-y-6">
        {displayedLogs.map((log) => {
          const config = getActionConfig(log.action);
          return (
            <div key={log.id} className="relative flex gap-6 items-start group">
              
              {/* Bulatan Lini Masa dengan Icon */}
              <div className={`relative z-10 w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${config.iconBgClass}`}>
                {config.icon}
              </div>

              {/* Konten Log Detail */}
              <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 group-hover:border-slate-200/80 group-hover:shadow-md">
                
                {/* Baris Atas: Info Aksi & Modul */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {/* Badge Aksi */}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                    
                    {/* Info Modul jika tidak difilter spesifik */}
                    {!moduleName && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Layers size={10} />
                        {log.module}
                      </span>
                    )}
                  </div>

                  {/* Penanda Waktu Kejadian */}
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={11} />
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>

                {/* Deskripsi Aktivitas */}
                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-3">
                  {log.description}
                </p>

                {/* Informasi Pengguna Pelaksana */}
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/50 w-fit px-3 py-1.5 rounded-xl border border-slate-100/50">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <User size={8} />
                  </div>
                  <span>Oleh: {log.username || 'Sistem / Anonim'}</span>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
