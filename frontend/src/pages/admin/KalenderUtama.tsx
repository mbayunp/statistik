import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import Swal from 'sweetalert2';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CalendarDays, 
  LayoutGrid, 
  Clock, 
  X, 
  CheckCircle2 
} from 'lucide-react';

interface EventItem {
  id: number;
  tahun: number;
  bulan: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  nama_kegiatan: string;
  deskripsi?: string;
  kategori: string;
  status: 'Rencana' | 'Berjalan' | 'Selesai';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_SHORT = ['M', 'S', 'S', 'R', 'K', 'J', 'S']; // Minggu s.d. Sabtu
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function KalenderUtama() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0 - 11
  
  const [events, setEvents] = useState<EventItem[]>([]);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState({
    tahun: today.getFullYear(),
    bulan: today.getMonth() + 1,
    tanggal_mulai: '',
    tanggal_selesai: '',
    nama_kegiatan: '',
    deskripsi: '',
    kategori: 'PENGELOLAAN',
    status: 'Rencana' as 'Rencana' | 'Berjalan' | 'Selesai'
  });

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kalender`, {
        params: { tahun: currentYear }
      });
      if (res.data?.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/kalender`, {
          params: { tahun: currentYear }
        });
        if (!ignore && res.data?.success) {
          setEvents(res.data.data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    loadEvents();

    return () => {
      ignore = true;
    };
  }, [currentYear]);

  // Fungsi pembantu menghitung matriks tanggal per bulan
  const generateMonthMatrix = (year: number, monthIndex: number) => {
    const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const matrix: { date: number; currentMonth: boolean; fullDateStr: string }[] = [];

    // Hari dari bulan sebelumnya (abu-abu)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = monthIndex === 0 ? 12 : monthIndex;
      const y = monthIndex === 0 ? year - 1 : year;
      const fullDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      matrix.push({ date: d, currentMonth: false, fullDateStr });
    }

    // Hari di bulan aktif
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      matrix.push({ date: i, currentMonth: true, fullDateStr });
    }

    // Hari bulan berikutnya pelengkap baris 6x7 (42 grid)
    const remaining = 42 - matrix.length;
    for (let i = 1; i <= remaining; i++) {
      const m = monthIndex === 11 ? 1 : monthIndex + 2;
      const y = monthIndex === 11 ? year + 1 : year;
      const fullDateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      matrix.push({ date: i, currentMonth: false, fullDateStr });
    }

    return matrix;
  };

  // Cek apakah tanggal memiliki event
  const getEventsForDate = (fullDateStr: string) => {
    return events.filter(e => {
      if (e.tanggal_mulai) {
        const startStr = e.tanggal_mulai.substring(0, 10);
        const endStr = e.tanggal_selesai ? e.tanggal_selesai.substring(0, 10) : startStr;
        return fullDateStr >= startStr && fullDateStr <= endStr;
      }
      return false;
    });
  };

  // Format tanggal Indonesia yang rapi (Contoh: "24 - 29 Agustus 2026" atau "24 Agustus 2026")
  const formatEventDateRange = (event: EventItem) => {
    if (!event.tanggal_mulai) {
      return `Bulan ${MONTH_NAMES[event.bulan - 1]} ${event.tahun}`;
    }

    const startClean = event.tanggal_mulai.substring(0, 10);
    const endClean = event.tanggal_selesai ? event.tanggal_selesai.substring(0, 10) : startClean;

    const [startY, startM, startD] = startClean.split('-').map(Number);
    const [endY, endM, endD] = endClean.split('-').map(Number);

    if (!startY || !startM || !startD) return event.tanggal_mulai;

    if (startClean === endClean || !event.tanggal_selesai) {
      return `${startD} ${MONTH_NAMES[startM - 1]} ${startY}`;
    }

    if (startY === endY && startM === endM) {
      return `${startD} - ${endD} ${MONTH_NAMES[startM - 1]} ${startY}`;
    }

    if (startY === endY) {
      return `${startD} ${MONTH_NAMES[startM - 1]} - ${endD} ${MONTH_NAMES[endM - 1]} ${startY}`;
    }

    return `${startD} ${MONTH_NAMES[startM - 1]} ${startY} - ${endD} ${MONTH_NAMES[endM - 1]} ${endY}`;
  };

  // Kategori badge color
  const getCategoryColor = (kategori: string) => {
    switch (kategori.toUpperCase()) {
      case 'FGD/RAPAT': return 'bg-blue-500 text-white';
      case 'PENGELOLAAN': return 'bg-emerald-500 text-white';
      case 'DISEMINASI': return 'bg-purple-500 text-white';
      case 'ADMINISTRASI': return 'bg-amber-500 text-white';
      default: return 'bg-teal-600 text-white';
    }
  };

  const handleOpenAddModal = (defaultDateStr?: string) => {
    const tgl = defaultDateStr || '';
    let parsedMonth = selectedMonth + 1;
    let parsedYear = currentYear;

    if (tgl) {
      const parts = tgl.split('-');
      parsedYear = Number(parts[0]);
      parsedMonth = Number(parts[1]);
    }

    setForm({
      tahun: parsedYear,
      bulan: parsedMonth,
      tanggal_mulai: tgl,
      tanggal_selesai: tgl,
      nama_kegiatan: '',
      deskripsi: '',
      kategori: 'PENGELOLAAN',
      status: 'Rencana'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/kalender`, form);
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan!',
        text: 'Rencana kegiatan berhasil dijadwalkan.',
        timer: 1500,
        showConfirmButton: false
      });
      setModalOpen(false);
      fetchEvents();
    } catch {
      Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Rencana Ini?',
      text: 'Kegiatan ini akan dihapus dari agenda kalender.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/api/kalender/${id}`);
        setSelectedEvent(null);
        Swal.fire('Terhapus', '', 'success');
        fetchEvents();
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col">
      
      {/* Top Bar Navigation ala Google Calendar */}
      <div className="bg-white p-4 lg:px-6 lg:py-3.5 rounded-3xl shadow-sm border border-slate-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Branding & Date Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <CalendarIcon size={22} />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-tight hidden sm:inline">Kalender Agenda</span>
          </div>

          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setSelectedMonth(today.getMonth());
            }}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            Hari Ini
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (viewMode === 'year') setCurrentYear(prev => prev - 1);
                else {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setCurrentYear(prev => prev - 1);
                  } else {
                    setSelectedMonth(prev => prev - 1);
                  }
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => {
                if (viewMode === 'year') setCurrentYear(prev => prev + 1);
                else {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setCurrentYear(prev => prev + 1);
                  } else {
                    setSelectedMonth(prev => prev + 1);
                  }
                }
              }}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {viewMode === 'year' ? currentYear : `${MONTH_NAMES[selectedMonth]} ${currentYear}`}
          </h2>
        </div>

        {/* Right: View Switcher & Add Button */}
        <div className="flex items-center gap-3">
          {/* Switch Year / Month */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('year')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'year' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={15} /> Tahun
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarDays size={15} /> Bulan
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} /> Rencana Baru
          </button>
        </div>
      </div>

      {/* VIEW 1: GOOGLE CALENDAR YEAR VIEW (12 Months Grid) */}
      {viewMode === 'year' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200/80 flex-1">
          {MONTH_NAMES.map((mName, mIdx) => {
            const matrix = generateMonthMatrix(currentYear, mIdx);
            const eventsInThisMonth = events.filter(e => e.bulan === (mIdx + 1));

            return (
              <div 
                key={mName}
                onClick={() => {
                  setSelectedMonth(mIdx);
                  setViewMode('month');
                }}
                className="bg-slate-50/60 hover:bg-slate-50 p-4 rounded-3xl border border-slate-200/60 hover:border-emerald-400/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-black text-sm text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">
                      {mName}
                    </h3>
                    {eventsInThisMonth.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {eventsInThisMonth.length} agenda
                      </span>
                    )}
                  </div>

                  {/* Header Nama Hari Singkat (M S S R K J S) */}
                  <div className="grid grid-cols-7 text-center mb-1">
                    {DAY_NAMES_SHORT.map((day, idx) => (
                      <span key={idx} className="text-[10px] font-black text-slate-400 uppercase py-0.5">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Tanggal Grid 7 Kolom */}
                  <div className="grid grid-cols-7 text-center gap-y-1">
                    {matrix.map((item, idx) => {
                      const dayEvents = getEventsForDate(item.fullDateStr);
                      const hasEvent = dayEvents.length > 0;
                      const isToday = 
                        today.getFullYear() === currentYear && 
                        today.getMonth() === mIdx && 
                        today.getDate() === item.date && 
                        item.currentMonth;

                      return (
                        <div key={idx} className="relative flex flex-col items-center justify-center py-1">
                          <span
                            className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-full transition-all ${
                              !item.currentMonth 
                                ? 'text-slate-300' 
                                : isToday 
                                ? 'bg-emerald-500 text-white font-black shadow-sm' 
                                : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            {item.date}
                          </span>
                          {hasEvent && item.currentMonth && (
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: FULL MONTH DETAIL VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/80 flex-1 flex flex-col overflow-hidden">
          {/* Day Headers (Minggu - Sabtu) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center text-xs font-black uppercase tracking-wider text-slate-500 py-3">
            {DAY_NAMES_FULL.map((d, i) => (
              <div key={i} className={i === 0 ? 'text-rose-500' : ''}>{d}</div>
            ))}
          </div>

          {/* Month Matrix Grid */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100 border-b border-slate-200">
            {generateMonthMatrix(currentYear, selectedMonth).map((item, idx) => {
              const dayEvents = getEventsForDate(item.fullDateStr);
              const isToday = 
                today.getFullYear() === currentYear && 
                today.getMonth() === selectedMonth && 
                today.getDate() === item.date && 
                item.currentMonth;

              return (
                <div
                  key={idx}
                  onClick={() => item.currentMonth && handleOpenAddModal(item.fullDateStr)}
                  className={`min-h-27.5 p-2 flex flex-col justify-between transition-colors relative group cursor-pointer ${
                    !item.currentMonth 
                      ? 'bg-slate-50/40 text-slate-300' 
                      : 'hover:bg-emerald-50/30 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday 
                          ? 'bg-emerald-500 text-white' 
                          : item.currentMonth 
                          ? 'text-slate-700' 
                          : 'text-slate-300'
                      }`}
                    >
                      {item.date}
                    </span>
                    {item.currentMonth && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(item.fullDateStr);
                        }} 
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all"
                        title="Tambah Agenda"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {/* List Event Badges */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-18.75 scrollbar-none">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-black truncate shadow-xs cursor-pointer hover:opacity-90 transition-opacity ${getCategoryColor(ev.kategori)}`}
                        title={ev.nama_kegiatan}
                      >
                        {ev.nama_kegiatan}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: FORM TAMBAH RENCANA */}
      {modalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 overflow-hidden my-auto text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Jadwalkan Rencana Baru</h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">Satu Data & Statistik Sektoral</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tahun Target</label>
                  <input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bulan</label>
                  <select
                    value={form.bulan}
                    onChange={(e) => setForm({ ...form, bulan: Number(e.target.value) })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400 cursor-pointer"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nama Rencana Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: FGD Sinkronisasi Metadata Sektoral"
                  value={form.nama_kegiatan}
                  onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
                  className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={form.tanggal_selesai}
                    onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kategori Sektoral</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400 cursor-pointer"
                  >
                    <option value="PENGELOLAAN">PENGELOLAAN PORTAL</option>
                    <option value="FGD/RAPAT">FGD / RAPAT</option>
                    <option value="DISEMINASI">DISEMINASI & PUBLIKASI</option>
                    <option value="ADMINISTRASI">ADMINISTRASI</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'Rencana' | 'Berjalan' | 'Selesai' })}
                    className="w-full p-3.5 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-400 cursor-pointer"
                  >
                    <option value="Rencana">Rencana</option>
                    <option value="Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Deskripsi & Catatan Output</label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Detail rencana output yang diharapkan..."
                  className="w-full p-3.5 bg-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 ring-emerald-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Simpan Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL EVENT PREVIEW */}
      {selectedEvent && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getCategoryColor(selectedEvent.kategori)}`}>
                {selectedEvent.kategori}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={18} />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-800 leading-snug mb-3">
              {selectedEvent.nama_kegiatan}
            </h3>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500 shrink-0" />
                <span>
                  {formatEventDateRange(selectedEvent)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-500" />
                <span>Status: <strong className="text-slate-800">{selectedEvent.status}</strong></span>
              </div>
              {selectedEvent.deskripsi && (
                <div className="pt-2 border-t border-slate-200/60 font-medium text-slate-500 leading-relaxed">
                  {selectedEvent.deskripsi}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleDelete(selectedEvent.id)}
                className="px-5 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} /> Hapus
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}