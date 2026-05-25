import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Archive, Plus, Trash2, Search, FileText, Download, 
  FolderOpen, X, Calendar, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const KATEGORI_BERKAS = [
  "RKA", "DPA", "KAK", "ANGKAS", "KIR", "PERKIN", "IKI", "CASHCADING", "LAINNYA"
];

interface BerkasItem {
  id: number;
  nama_berkas: string;
  kategori: string;
  tahun: number;
  keterangan?: string;
  file_arsip: string;
  created_at?: string;
}

const BerkasArsip: React.FC = () => {
  // === STATE UTAMA ===
  const [berkas, setBerkas] = useState<BerkasItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  // === STATE FILTER & PENCARIAN ===
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  
  // === STATE PAGINATION ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    nama_berkas: '',
    kategori: '',
    tahun: new Date().getFullYear(),
    keterangan: ''
  });

  // 1. Fungsi Fetch Data
  const fetchBerkas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/berkas`);
      setBerkas(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBerkas();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Handle Submit (Tambah Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      Swal.fire('Peringatan', 'Harap unggah file dokumen terlebih dahulu!', 'warning');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value.toString()));
    data.append('file_arsip', file);

    try {
      Swal.fire({ title: 'Mengunggah...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await axios.post(`${API_BASE_URL}/api/berkas`, data);
      
      Swal.fire('Berhasil', 'Berkas arsip berhasil disimpan', 'success');
      setShowModal(false);
      setFile(null);
      setFormData({ nama_berkas: '', kategori: '', tahun: new Date().getFullYear(), keterangan: '' });
      fetchBerkas();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan berkas', 'error');
      } else {
        Swal.fire('Error', 'Gagal menyimpan berkas', 'error');
      }
    }
  };

  // 3. Handle Delete
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Berkas?',
      text: "File arsip akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/berkas/${id}`);
          Swal.fire('Terhapus', 'Berkas berhasil dihapus', 'success');
          fetchBerkas();
        } catch (error) {
          console.error(error);
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
        }
      }
    });
  };

  // 4. Helper Warna Badge Kategori
  const getCategoryColor = (kategori: string) => {
    const colors: Record<string, string> = {
      RKA: 'bg-blue-100 text-blue-700',
      DPA: 'bg-emerald-100 text-emerald-700',
      KAK: 'bg-amber-100 text-amber-700',
      ANGKAS: 'bg-purple-100 text-purple-700',
      KIR: 'bg-rose-100 text-rose-700',
      PERKIN: 'bg-indigo-100 text-indigo-700',
      IKI: 'bg-cyan-100 text-cyan-700',
      CASHCADING: 'bg-orange-100 text-orange-700',
    };
    return colors[kategori] || 'bg-slate-100 text-slate-700';
  };

  // === LOGIKA FILTER DATA ===
  const filteredBerkas = berkas.filter(b => {
    const matchSearch = b.nama_berkas.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        b.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTahun = filterTahun === '' || b.tahun.toString() === filterTahun;
    
    // Asumsi 'created_at' digunakan untuk filter bulan (Format ISO: YYYY-MM-DD...)
    let matchBulan = true;
    if (filterBulan !== '' && b.created_at) {
        const fileMonth = new Date(b.created_at).getMonth() + 1; // 1 - 12
        matchBulan = fileMonth.toString() === filterBulan;
    }

    return matchSearch && matchTahun && matchBulan;
  });

  // === LOGIKA PAGINATION ===
  const totalPages = Math.ceil(filteredBerkas.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBerkas.slice(indexOfFirstItem, indexOfLastItem);

  // Generate daftar tahun unik untuk dropdown filter
  const uniqueYears = Array.from(new Set(berkas.map(b => b.tahun))).sort((a: number, b: number) => b - a);

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Archive size={36} className="text-brand-secondary" /> Berkas Arsip
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manajemen penyimpanan dokumen dan arsip internal.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-secondary transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> Unggah Berkas
        </button>
      </div>

      {/* FILTER & SEARCH BAR SECTION */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        {/* Search */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 w-full md:w-96 flex-1">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari nama berkas atau kategori..." 
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Filter Bulan & Tahun */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer"
              value={filterBulan}
              onChange={(e) => { setFilterBulan(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer"
              value={filterTahun}
              onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Semua Tahun</option>
              {uniqueYears.map((yr: number) => (
                 <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Pengaturan Baris */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 ml-auto">
             <span className="text-[10px] font-black text-slate-400 uppercase hidden md:inline">Baris:</span>
             <select 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer"
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sticky left-0 bg-slate-50 z-20 w-16">No</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Nama Berkas</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Kategori & Tahun</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Keterangan</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dokumen</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan={6} className="p-10 text-center animate-pulse text-slate-400 font-bold">Memuat arsip...</td></tr>
              ) : currentItems.length > 0 ? currentItems.map((b, index) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Kolom No yang menempel di kiri */}
                  <td className="p-6 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-20 font-bold text-slate-400 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    {indexOfFirstItem + index + 1}
                  </td>
                  
                  <td className="p-6">
                    <div className="font-bold text-slate-800 text-sm max-w-sm line-clamp-2">{b.nama_berkas}</div>
                  </td>
                  
                  <td className="p-6">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getCategoryColor(b.kategori)}`}>
                        {b.kategori}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Calendar size={14} /> Tahun {b.tahun}
                      </div>
                    </div>
                  </td>

                  <td className="p-6">
                     <p className="text-xs font-medium text-slate-500 line-clamp-2 max-w-xs">{b.keterangan || '-'}</p>
                  </td>

                  <td className="p-6 text-center">
                    <a 
                      href={`${API_BASE_URL}/uploads/${b.file_arsip}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-brand-secondary hover:text-white shadow-sm transition-all active:scale-90"
                      title="Unduh / Lihat Dokumen"
                    >
                      <Download size={18} />
                    </a>
                  </td>

                  <td className="p-6 text-center">
                    <button 
                      onClick={() => handleDelete(b.id)} 
                      className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                     <div className="flex flex-col items-center opacity-20">
                        <FolderOpen size={64} />
                        <p className="mt-4 font-black text-sm uppercase tracking-widest">Tidak Ada Arsip Sesuai Filter</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="mt-6 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Menampilkan {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredBerkas.length)} dari total {filteredBerkas.length} Berkas
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
      </div>

      {/* MODAL UPLOAD BERKAS TETAP SAMA SEPERTI SEBELUMNYA */}
      {showModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto">
          {/* ... Isi modal form upload sama seperti yang sebelumnya ... */}
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Unggah Berkas Arsip</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Pilih kategori dan upload dokumen</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nama Berkas */}
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama / Judul Dokumen</label>
                  <input 
                    required 
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-secondary transition-all text-sm font-bold text-slate-700" 
                    placeholder="Contoh: Dokumen Pelaksanaan Anggaran 2026..."
                    value={formData.nama_berkas} 
                    onChange={e => setFormData({...formData, nama_berkas: e.target.value})} 
                  />
                </div>

                {/* Kategori File */}
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kategori File</label>
                  <select 
                    required
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-secondary transition-all text-sm font-bold cursor-pointer text-slate-700" 
                    value={formData.kategori} 
                    onChange={e => setFormData({...formData, kategori: e.target.value})} 
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {KATEGORI_BERKAS.map((kat) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>

                {/* Tahun Anggaran */}
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Tahun Anggaran</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-secondary transition-all text-sm font-bold text-slate-700" 
                    value={formData.tahun}
                    onChange={e => setFormData({...formData, tahun: parseInt(e.target.value)})} 
                  />
                </div>

                {/* Keterangan */}
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Keterangan Tambahan (Opsional)</label>
                  <textarea 
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-secondary transition-all text-sm font-bold text-slate-700 h-24" 
                    placeholder="Tuliskan catatan singkat jika ada..."
                    value={formData.keterangan} 
                    onChange={e => setFormData({...formData, keterangan: e.target.value})} 
                  />
                </div>

                {/* File Upload */}
                <div className="col-span-2 p-6 bg-slate-50 rounded-4xl border border-slate-100 border-dashed">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={16} /> Pilih Dokumen Arsip (PDF/Word/Excel)
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-brand-secondary file:text-white hover:file:bg-brand-dark file:cursor-pointer cursor-pointer transition-all"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-dark text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] text-xs mt-8 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-secondary/20 active:scale-[0.98]"
              >
                Unggah & Simpan Berkas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BerkasArsip;