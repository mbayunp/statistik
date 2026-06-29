import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Printer, 
  User, 
  Calendar, 
  Loader2, 
  Briefcase, 
  Clock, 
  Images, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

interface UserAccount {
  id: number;
  username: string;
  role: string;
}

interface RekapanLaporanItem {
  id: number;
  tanggal: string;
  nama_kegiatan: string;
  kategori: string;
  keterangan: string | null;
  link_materi: string | null;
  dokumentasi: string; // JSON string or array
  username: string;
  role: string;
}

interface DecodedToken {
  id: number;
  username: string;
  role: string;
  exp: number;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const LaporanKinerjaPegawai: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [reportData, setReportData] = useState<RekapanLaporanItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  const listBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const yearsRange = Array.from(
    { length: 5 }, 
    (_, i) => (new Date().getFullYear() - 2 + i).toString()
  );

  // Decode current logged-in user
  const [currentUser] = useState<DecodedToken | null>(() => {
    const token = localStorage.getItem('token');
    return token ? decodeToken(token) : null;
  });

  // Filter States
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    return decoded ? decoded.id.toString() : '';
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return listBulan[new Date().getMonth()];
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });

  // Fetch all user accounts for dropdown selection
  const fetchUsers = React.useCallback(async () => {
    if (currentUser?.role !== 'admin') {
      setLoadingUsers(false);
      return;
    }

    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        const fetchedUsers = response.data.data || [];
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Akun',
        text: 'Gagal mengambil data daftar akun pegawai.'
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser]);

  // Fetch monthly performance report for the selected user, month, and year
  const fetchReport = useCallback(async () => {
    if (!selectedUserId) return;
    
    try {
      setLoadingReport(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/rekapan/laporan`, {
        params: {
          user_id: selectedUserId,
          month: selectedMonth,
          year: selectedYear
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setReportData(response.data.data || []);
      }
    } catch (error: unknown) {
      console.error('Error fetching report data:', error);
      let message = 'Terjadi kesalahan saat memproses laporan.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Laporan',
        text: message
      });
    } finally {
      setLoadingReport(false);
    }
  }, [selectedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUserId) {
      fetchReport();
    }
  }, [selectedUserId, selectedMonth, selectedYear, fetchReport]);

  const parseImages = (imageField: string): string[] => {
    if (!imageField) return [];
    
    if (Array.isArray(imageField)) {
      return imageField;
    }

    if (typeof imageField === 'string') {
      try {
        let parsed = JSON.parse(imageField);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        if (imageField.includes(',')) {
          return imageField.split(',').map(s => s.trim()).filter(Boolean);
        }
        return imageField.trim() ? [imageField] : [];
      }
    }
    return [];
  };

  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=Tanpa+Gambar";
    if (path.startsWith('http')) return path;
    
    let cleanPath = path.replace(/[[\]"\\]/g, '').trim(); 
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    return `${API_BASE_URL}${cleanPath}`;
  };

  const formatTanggalIndo = (tanggalString: string) => {
    const dateObj = new Date(tanggalString);
    if (isNaN(dateObj.getTime())) return tanggalString; 
    return dateObj.toLocaleDateString('id-ID', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getSelectedUsername = () => {
    const user = users.find(u => u.id.toString() === selectedUserId);
    return user ? user.username : '';
  };

  const getSelectedUserRole = () => {
    const user = users.find(u => u.id.toString() === selectedUserId);
    return user ? user.role : '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50 min-h-screen text-left">
      
      {/* CSS Khusus untuk Cetak (Print Stylesheet) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Sembunyikan sidebar, navbar, filters, dan button */
          header, nav, aside, button, .no-print, select, input, .swal2-container {
            display: none !important;
          }
          /* Atur margin halaman print */
          body, .flex-1, main {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 2rem;
            border-bottom: 3px double #334155;
            padding-bottom: 1rem;
            text-align: center;
          }
          .print-title {
            font-size: 20pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1e293b;
          }
          .print-meta {
            font-size: 10pt;
            margin-top: 0.5rem;
            color: #475569;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 1.5rem !important;
            border-radius: 12px !important;
          }
          .print-image {
            max-width: 150px !important;
            height: auto !important;
          }
          /* Tanda tangan di bagian bawah */
          .print-signatures {
            display: flex !important;
            justify-content: space-between;
            margin-top: 4rem;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            margin-top: 5rem;
            border-top: 1px solid black;
            font-weight: bold;
            padding-top: 0.25rem;
          }
        }
        .print-header, .print-signatures {
          display: none;
        }
      `}} />

      {/* === HEADER UNTUK PRINT === */}
      <div className="print-header">
        <h1 className="print-title">Laporan Kinerja Bulanan Pegawai</h1>
        <p className="print-meta">Bidang Penyelenggaraan Statistik Sektoral — Dinas Komunikasi dan Informatika</p>
        <div className="grid grid-cols-2 text-left mt-6 max-w-xl mx-auto border border-slate-200 p-4 rounded-xl text-xs font-semibold">
          <div>Nama Pegawai : <span className="font-extrabold uppercase">{getSelectedUsername()}</span></div>
          <div>Bulan Laporan : <span className="font-extrabold uppercase">{selectedMonth} {selectedYear}</span></div>
          <div className="mt-1">Posisi/Role : <span className="font-extrabold uppercase">{getSelectedUserRole()}</span></div>
          <div className="mt-1">Dicetak Pada : <span className="font-extrabold">{new Date().toLocaleDateString('id-ID')}</span></div>
        </div>
      </div>

      {/* === SCREEN HEADER SECTION (NO-PRINT) === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <FileText size={20} />
            </div>
            <span className="text-xs font-black text-brand-primary uppercase tracking-widest">Kinerja Internal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-brand-dark uppercase tracking-tight">
            Laporan Bulanan Pegawai
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Rekapitulasi log pekerjaan bulanan per pegawai beserta foto dokumentasi kegiatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            disabled={reportData.length === 0}
            className="flex items-center gap-2 px-5 py-3.5 bg-brand-dark text-white font-black text-xs rounded-2xl hover:bg-brand-primary transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <Printer size={16} /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* === SCREEN CONTROLS / FILTERS (NO-PRINT) === */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end no-print">
        
        {/* Pilih Pegawai */}
        <div className="flex-1 min-w-[200px] w-full text-left">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <User size={12} /> Pegawai / Akun
          </label>
          {currentUser?.role === 'admin' ? (
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingUsers ? (
                <option>Memuat daftar akun...</option>
              ) : users.length === 0 ? (
                <option>Tidak ada akun</option>
              ) : (
                users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username.toUpperCase()} ({u.role.toUpperCase()})
                  </option>
                ))
              )}
            </select>
          ) : (
            <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">
              {currentUser?.username || 'Sistem / Anonim'} ({currentUser?.role || 'User'})
            </div>
          )}
        </div>

        {/* Pilih Bulan */}
        <div className="w-full md:w-56 text-left">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Calendar size={12} /> Bulan
          </label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
          >
            {listBulan.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Pilih Tahun */}
        <div className="w-full md:w-40 text-left">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Calendar size={12} /> Tahun
          </label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
          >
            {yearsRange.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

      </div>

      {/* === DATA / REPORT DISPLAY === */}
      {loadingReport ? (
        <div className="bg-white p-24 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyusun laporan bulanan...</p>
        </div>
      ) : reportData.length === 0 ? (
        <div className="bg-white p-24 rounded-3xl border border-slate-200/50 shadow-sm text-center">
          <HelpCircle className="mx-auto text-slate-200 mb-4" size={64} />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tidak Ada Kegiatan</h3>
          <p className="text-xs text-slate-400 font-medium mt-1.5 max-w-sm mx-auto leading-relaxed">
            Pegawai <span className="font-extrabold text-slate-600">{getSelectedUsername().toUpperCase()}</span> belum mencatat kegiatan apa pun pada bulan <span className="font-extrabold text-slate-600">{selectedMonth} {selectedYear}</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Card Summary atas (No-print) */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-800 uppercase tracking-wide">Ringkasan Laporan Terisi</h4>
                <p className="text-xs text-emerald-600 font-medium">Tercatat {reportData.length} kegiatan operasional yang valid.</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right">
              <span className="inline-block text-[10px] font-black text-emerald-700 bg-white border border-emerald-200/80 px-4 py-2 rounded-xl uppercase tracking-wider">
                Status: SIAP DICETAK
              </span>
            </div>
          </div>

          {/* List Item Pekerjaan */}
          <div className="space-y-6">
            {reportData.map((item, index) => {
              const images = parseImages(item.dokumentasi);
              return (
                <div 
                  key={item.id} 
                  className="bg-white p-6 md:p-8 rounded-4xl border border-slate-200/50 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row gap-6 print-card"
                >
                  
                  {/* Bagian Informasi & Teks */}
                  <div className="flex-1 space-y-4">
                    {/* Baris Atas: Index, Tanggal, Modul */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-black text-slate-400 font-mono">
                        #{index + 1}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                        <Clock size={12} />
                        {formatTanggalIndo(item.tanggal)}
                      </span>
                      <span className="text-[10px] font-black text-brand-dark bg-brand-primary/10 border border-brand-primary/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        {item.kategori}
                      </span>
                    </div>

                    {/* Judul Kegiatan */}
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug">
                      {item.nama_kegiatan}
                    </h3>

                    {/* Keterangan Detail Pekerjaan */}
                    <div className="text-xs font-semibold text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest mb-1.5 flex items-center gap-1">
                        <Briefcase size={10} /> Detail Kegiatan
                      </p>
                      <p className="whitespace-pre-line text-slate-600">
                        {item.keterangan || 'Tidak ada keterangan detail tambahan.'}
                      </p>
                    </div>

                    {/* Tautan Materi jika ada */}
                    {item.link_materi && (
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 w-fit px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-brand-primary font-black uppercase">Tautan:</span>
                        <a 
                          href={item.link_materi} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:underline text-blue-600 break-all font-semibold"
                        >
                          {item.link_materi}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Bagian Gambar Dokumentasi */}
                  {images.length > 0 && (
                    <div className="md:w-64 shrink-0 space-y-3">
                      <p className="font-bold text-slate-400 uppercase text-[9px] tracking-widest flex items-center gap-1.5 no-print">
                        <Images size={11} /> Dokumentasi ({images.length})
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3.5">
                        {images.map((img, imgIdx) => (
                          <div 
                            key={imgIdx} 
                            className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-slate-100 h-24 w-full cursor-pointer print-image"
                          >
                            <img 
                              src={getImageUrl(img)} 
                              alt={`Dokumentasi ${imgIdx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Error"; }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* === FOOTER TANDA TANGAN CETAK (HANYA PRINT) === */}
          <div className="print-signatures">
            <div className="signature-box">
              <p className="text-xs font-semibold text-slate-600">Mengetahui,</p>
              <p className="text-xs font-black text-slate-800 uppercase mt-1">Kepala Bidang PSS</p>
              <div className="signature-line">
                ( ............................................ )
                <p className="text-[10px] font-medium text-slate-500 mt-1">NIP. ............................................</p>
              </div>
            </div>
            
            <div className="signature-box">
              <p className="text-xs font-semibold text-slate-600">Garut, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-xs font-black text-slate-800 uppercase mt-1">Tenaga Ahli Pelapor</p>
              <div className="signature-line">
                {getSelectedUsername().toUpperCase()}
                <p className="text-[10px] font-medium text-slate-500 mt-1">Tenaga Ahli {getSelectedUserRole().toUpperCase()}</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default LaporanKinerjaPegawai;