import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  History, 
  Calendar, 
  Layers, 
  Search, 
  Download, 
  RefreshCw, 
  User, 
  Clock, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

interface LogItem {
  id: number;
  user_id: number | null;
  module: string;
  action: string;
  description: string;
  created_at: string;
  username: string | null;
}

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const fetchLogs = React.useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const token = localStorage.getItem('token');
      const params: Record<string, string> = {};
      
      if (selectedPeriod) params.period = selectedPeriod;
      if (selectedModule) params.module = selectedModule;

      const response = await axios.get(`${API_BASE_URL}/api/logs`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setLogs(response.data.data || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching logs:', err);
      let message = 'Terjadi kesalahan saat terhubung ke server.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Log',
        text: message,
        confirmButtonColor: '#00D2B4',
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-slate-100'
        }
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod, selectedModule]);

  useEffect(() => {
    fetchLogs();
    setCurrentPage(1);
  }, [fetchLogs]);

  const formatTanggalKalender = (tanggalString: string) => {
    const dateObj = new Date(tanggalString);
    if (isNaN(dateObj.getTime())) return tanggalString; 
    return dateObj.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('INSERT')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          <PlusCircle size={12} /> Tambah
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          <Edit3 size={12} /> Edit
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('HAPUS')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          <Trash2 size={12} /> Hapus
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
        <Info size={12} /> {action}
      </span>
    );
  };

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      Swal.fire('Info', 'Tidak ada data untuk diekspor', 'info');
      return;
    }

    const headers = ['ID', 'Pelaksana', 'Modul', 'Tindakan', 'Deskripsi', 'Waktu Kejadian'];
    const csvRows = [
      headers.join(','), // Header row
      ...filteredLogs.map(log => [
        log.id,
        `"${log.username || 'Sistem'}"`,
        `"${log.module}"`,
        `"${log.action}"`,
        `"${log.description.replace(/"/g, '""')}"`,
        `"${new Date(log.created_at).toLocaleString('id-ID')}"`
      ].join(','))
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Riwayat_Aktivitas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => {
    const term = searchQuery.toLowerCase();
    const username = (log.username || 'sistem').toLowerCase();
    const desc = log.description.toLowerCase();
    const action = log.action.toLowerCase();
    const module = log.module.toLowerCase();
    return username.includes(term) || desc.includes(term) || action.includes(term) || module.includes(term);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50 min-h-screen text-left">
      
      {/* === HEADER SECTION === */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <History size={20} />
            </div>
            <span className="text-xs font-black text-brand-primary uppercase tracking-widest">Sistem Audit Trail</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-brand-dark uppercase tracking-tight">
            Riwayat Aktivitas
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Pantau seluruh catatan aksi administratif sistem secara real-time</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
            title="Ekspor CSV"
          >
            <Download size={16} /> Ekspor Data
          </button>
          
          <button 
            onClick={() => fetchLogs(true)} 
            disabled={isRefreshing}
            className="w-12 h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center hover:bg-brand-primary transition-all shadow-lg active:scale-90 disabled:opacity-50"
            title="Segarkan Data"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* === CONTROL BAR / FILTERS === */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Filter Periode */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Calendar size={12} /> Filter Waktu
            </label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              <option value="">Semua Waktu</option>
              <option value="weekly">Seminggu Terakhir</option>
              <option value="monthly">Sebulan Terakhir</option>
            </select>
          </div>

          {/* Filter Modul */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Layers size={12} /> Filter Modul
            </label>
            <select 
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
            >
              <option value="">Semua Modul</option>
              <option value="REKAPAN_INTERNAL">Rekapan Internal</option>
              <option value="PUBLIKASI">Publikasi Kegiatan</option>
              <option value="PEGAWAI">Data Pegawai</option>
              <option value="SURAT">Surat Menyurat</option>
              <option value="ASET">Aset Bidang</option>
              <option value="KEUANGAN">Realisasi Keuangan</option>
              <option value="PENUGASAN">Form Penugasan</option>
              <option value="BERKAS">Berkas Arsip</option>
              <option value="FORMULIR">Formulir</option>
              <option value="SHORTLINK">Shortlink</option>
            </select>
          </div>
        </div>

        {/* Input Pencarian */}
        <div className="w-full lg:max-w-md">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Search size={12} /> Cari Aktivitas
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari kata kunci, username, deskripsi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

      </div>

      {/* === DATA DISPLAY SECTION === */}
      {loading ? (
        <div className="bg-white p-24 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Audit Log...</p>
        </div>
      ) : currentLogs.length === 0 ? (
        <div className="bg-white p-24 rounded-3xl border border-slate-200/50 shadow-sm text-center">
          <Info className="mx-auto text-slate-200 mb-4" size={56} />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tidak Ada Catatan</h3>
          <p className="text-xs text-slate-400 font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
            Tidak ditemukan aktivitas yang cocok dengan kriteria pencarian dan filter di atas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-16 text-center">ID</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-40">Pelaksana</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-36">Tindakan</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-44">Modul</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Deskripsi Aktivitas</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-64">Waktu Kejadian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="p-5 text-xs text-slate-400 font-bold text-center font-mono">
                      #{log.id}
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            {log.username || 'System'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                            {log.user_id ? `UID: ${log.user_id}` : 'Cron / API'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 align-middle">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-5">
                      <span className="inline-block text-[10px] font-black text-brand-dark bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-xl">
                        {log.module}
                      </span>
                    </td>

                    <td className="p-5">
                      <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-lg">
                        {log.description}
                      </p>
                    </td>

                    <td className="p-5 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>{formatTanggalKalender(log.created_at)}</span>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* === PAGINATION BAR === */}
          {filteredLogs.length > 0 && (
            <div className="bg-slate-50/50 border-t border-slate-100 p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLogs.length)} dari {filteredLogs.length} Aktivitas
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-colors cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16}/>
                </button>
                <span className="text-xs font-black text-brand-dark uppercase tracking-wider px-2">
                  {currentPage} / {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-colors cursor-pointer"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default ActivityLogPage;
