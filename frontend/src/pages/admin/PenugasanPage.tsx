import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx'; // Import library excel
import { 
  Briefcase, Plus, Trash2, Search, Image as ImageIcon, X, Inbox, Calendar, MapPin, Users, Filter, ChevronLeft, ChevronRight, FileSpreadsheet 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const PenugasanPage: React.FC = () => {
  // === STATE DATA ===
  const [data, setData] = useState<any[]>([]);
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
    tanggal_waktu: '',
    tempat: '',
    peserta: '',
    pelaksanaan: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/penugasan`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTanggalWaktu = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return Swal.fire('Peringatan', 'Foto dokumentasi wajib diunggah!', 'warning');

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
    submitData.append('dokumentasi', file);

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await axios.post(`${API_BASE_URL}/api/penugasan`, submitData);
      Swal.fire('Berhasil', 'Penugasan berhasil dicatat', 'success');
      setShowModal(false); 
      setFile(null);
      setFormData({ tanggal_waktu: '', tempat: '', peserta: '', pelaksanaan: '' });
      fetchData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan penugasan', 'error');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Hapus Data?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus' })
    .then(async (res) => {
      if (res.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/api/penugasan/${id}`);
        Swal.fire('Terhapus', 'Data dihapus', 'success');
        fetchData();
      }
    });
  };

  // === LOGIKA FILTER ===
  const filteredData = data.filter(d => {
    const matchSearch = d.tempat.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        d.pelaksanaan.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchBulan = true;
    let matchTahun = true;

    if (d.tanggal_waktu) {
      const dateObj = new Date(d.tanggal_waktu);
      const fileMonth = dateObj.getMonth() + 1; // 1-12
      const fileYear = dateObj.getFullYear();

      if (filterBulan !== '') matchBulan = fileMonth.toString() === filterBulan;
      if (filterTahun !== '') matchTahun = fileYear.toString() === filterTahun;
    }

    return matchSearch && matchBulan && matchTahun;
  });

  // === FUNGSI EXPORT KE EXCEL ===
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      Swal.fire('Peringatan', 'Tidak ada data untuk diekspor!', 'warning');
      return;
    }

    // 1. Format data agar rapi saat dibaca di Excel
    const excelData = filteredData.map((item, index) => ({
      'No': index + 1,
      'Tanggal & Waktu': formatTanggalWaktu(item.tanggal_waktu),
      'Tempat': item.tempat,
      'Peserta': item.peserta,
      'Pelaksanaan Kegiatan': item.pelaksanaan
    }));

    // 2. Buat Worksheet dan Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Atur lebar kolom (opsional agar rapi)
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 30 },  // Tanggal
      { wch: 25 },  // Tempat
      { wch: 40 },  // Peserta
      { wch: 50 }   // Pelaksanaan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penugasan");

    XLSX.writeFile(workbook, `Laporan_Penugasan_Kabid_${filterBulan || 'SemuaBulan'}_${filterTahun || 'SemuaTahun'}.xlsx`);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const uniqueYears = Array.from(new Set(data.map(d => new Date(d.tanggal_waktu).getFullYear()))).sort((a: any, b: any) => b - a);

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Briefcase size={36} className="text-indigo-500" /> Form Penugasan Kepala Bidang
          </h1>
          <p className="text-slate-500 font-medium mt-1">Catatan pelaksanaan kegiatan dan penugasan Kepala Bidang.</p>
        </div>
        
        <div className="flex gap-3">
          {/* Tombol Export Excel */}
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-xl transition-all"
          >
            <FileSpreadsheet size={20} /> Export Excel
          </button>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-dark text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 shadow-xl transition-all"
          >
            <Plus size={20} /> Tambah Penugasan
          </button>
        </div>
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
            placeholder="Cari tempat atau deskripsi..." 
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
              {uniqueYears.map((yr: any) => (
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
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-6 text-center sticky left-0 bg-slate-50 z-20 w-16">No</th>
                <th className="p-6">Waktu & Tempat</th>
                <th className="p-6">Peserta</th>
                <th className="p-6">Pelaksanaan Kegiatan</th>
                <th className="p-6 text-center">Dokumentasi</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={6} className="p-10 text-center font-bold text-slate-400 animate-pulse">Memuat...</td></tr> : 
               currentItems.length > 0 ? currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 group">
                      
                      <td className="p-6 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-20 font-bold text-slate-400 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                          <Calendar size={14} className="text-indigo-500"/> {formatTanggalWaktu(item.tanggal_waktu)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <MapPin size={14} className="text-rose-500"/> {item.tempat}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-start gap-2 text-xs font-medium text-slate-600 max-w-xs">
                           <Users size={14} className="text-emerald-500 shrink-0 mt-0.5"/>
                           <span className="line-clamp-2">{item.peserta}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-medium text-slate-600 line-clamp-3 max-w-md">{item.pelaksanaan}</p>
                      </td>
                      <td className="p-6 text-center">
                        <a href={`${API_BASE_URL}/uploads/${item.dokumentasi}`} target="_blank" rel="noreferrer" className="inline-flex w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-sm">
                          <ImageIcon size={20}/>
                        </a>
                      </td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
               )) : <tr><td colSpan={6} className="p-20 text-center"><Inbox size={48} className="mx-auto text-slate-200 mb-4"/><p className="font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Data</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="mt-6 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Menampilkan {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredData.length)} dari total {filteredData.length} Data
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

      {/* MODAL TAMBAH PENUGASAN */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Form Penugasan Baru</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Lengkapi detail kegiatan Kabid</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal dan Waktu</label>
                  <input type="datetime-local" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm font-bold text-slate-700" value={formData.tanggal_waktu} onChange={e => setFormData({...formData, tanggal_waktu: e.target.value})} />
                </div>
                
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tempat Kegiatan</label>
                  <input type="text" required placeholder="Contoh: Ruang Rapat Lt.2" className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm font-bold text-slate-700" value={formData.tempat} onChange={e => setFormData({...formData, tempat: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Peserta (Yang Terlibat)</label>
                  <input type="text" required placeholder="Contoh: Seluruh Staff Bidang, Perwakilan Dinas..." className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm font-bold text-slate-700" value={formData.peserta} onChange={e => setFormData({...formData, peserta: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pelaksanaan Kegiatan (Deskripsi)</label>
                  <textarea required placeholder="Jelaskan secara singkat apa saja yang dilakukan..." className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 text-sm font-bold text-slate-700 h-24" value={formData.pelaksanaan} onChange={e => setFormData({...formData, pelaksanaan: e.target.value})} />
                </div>

                <div className="col-span-2 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <ImageIcon size={16} /> Unggah Dokumentasi (Foto JPG/PNG)
                  </label>
                  <input type="file" required accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-indigo-500 file:text-white hover:file:bg-brand-dark file:cursor-pointer cursor-pointer transition-all" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                </div>

              </div>
              <button type="submit" className="w-full mt-8 bg-brand-dark text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-500 transition-all active:scale-[0.98]">Simpan Penugasan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenugasanPage;