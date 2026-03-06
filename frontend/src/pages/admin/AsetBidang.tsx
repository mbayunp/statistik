import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Monitor, Plus, Trash2, Search, X, Inbox, ChevronLeft, ChevronRight, FileSpreadsheet, Box, MapPin, Edit3 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AsetBidang: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State untuk Mode Edit
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // State Pencarian & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialForm = {
    nama_barang: '',
    jenis_barang: '',
    merk_model: '',
    tahun_pembelian: new Date().getFullYear(),
    jumlah: 1,
    penempatan: '',
    keadaan: 'baik'
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/aset`);
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

  // Fungsi untuk buka modal tambah
  const handleAddClick = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  // Fungsi untuk buka modal edit
  const handleEditClick = (item: any) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      nama_barang: item.nama_barang,
      jenis_barang: item.jenis_barang,
      merk_model: item.merk_model,
      tahun_pembelian: item.tahun_pembelian,
      jumlah: item.jumlah,
      penempatan: item.penempatan || '',
      keadaan: item.keadaan
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      if (editMode && currentId) {
        // Logika Update
        await axios.put(`${API_BASE_URL}/api/aset/${currentId}`, formData);
        Swal.fire('Berhasil', 'Data aset berhasil diperbarui', 'success');
      } else {
        // Logika Create
        await axios.post(`${API_BASE_URL}/api/aset`, formData);
        Swal.fire('Berhasil', 'Aset berhasil dicatat', 'success');
      }
      
      setShowModal(false); 
      setFormData(initialForm);
      fetchData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Hapus Aset?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus' })
    .then(async (res) => {
      if (res.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/api/aset/${id}`);
        Swal.fire('Terhapus', 'Data dihapus', 'success');
        fetchData();
      }
    });
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) return Swal.fire('Peringatan', 'Tidak ada data!', 'warning');
    
    const excelData = filteredData.map((item, index) => ({
      'No': index + 1,
      'Nama Barang': item.nama_barang,
      'Jenis Barang': item.jenis_barang,
      'Merk / Model': item.merk_model,
      'Penempatan': item.penempatan || '-',
      'Tahun': item.tahun_pembelian,
      'Jumlah': item.jumlah,
      'Keadaan': item.keadaan.toUpperCase()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [{wch: 5}, {wch: 30}, {wch: 20}, {wch: 25}, {wch: 25}, {wch: 10}, {wch: 10}, {wch: 15}];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Aset");
    XLSX.writeFile(workbook, `Data_Aset_Bidang.xlsx`);
  };

  const filteredData = data.filter(d => 
    d.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.merk_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.jenis_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.penempatan && d.penempatan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const renderBadge = (kondisi: string) => {
    switch(kondisi) {
      case 'baik': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">Baik</span>;
      case 'kurang baik': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">Kurang Baik</span>;
      case 'rusak berat': return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase">Rusak Berat</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Monitor size={36} className="text-blue-500" /> Aset Bidang
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manajemen pendataan barang dan inventaris.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-xl transition-all">
            <FileSpreadsheet size={20} /> Export Excel
          </button>
          <button onClick={handleAddClick} className="bg-brand-dark text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 shadow-xl transition-all">
            <Plus size={20} /> Tambah Aset
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 w-full md:w-96">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-400"><Search size={18} /></div>
          <input type="text" placeholder="Cari barang, jenis, ruangan..." className="w-full bg-transparent outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase">Baris:</span>
           <select className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10</option><option value={50}>50</option><option value={100}>100</option>
            </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-6 text-center sticky left-0 bg-slate-50 z-20 w-16">No</th>
                <th className="p-6">Barang & Spesifikasi</th>
                <th className="p-6">Penempatan</th>
                <th className="p-6 text-center">Tahun</th>
                <th className="p-6 text-center">Jumlah</th>
                <th className="p-6 text-center">Kondisi</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={7} className="p-10 text-center font-bold text-slate-400 animate-pulse">Memuat...</td></tr> : 
               currentItems.length > 0 ? currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 group">
                      <td className="p-6 text-center sticky left-0 bg-white group-hover:bg-slate-50 z-20 font-bold text-slate-400 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-slate-800 text-sm">{item.nama_barang}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Box size={12}/> {item.jenis_barang}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase">{item.merk_model}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <MapPin size={14} className="text-rose-500" />
                          {item.penempatan || '-'}
                        </div>
                      </td>
                      <td className="p-6 text-center font-bold text-slate-600">{item.tahun_pembelian}</td>
                      <td className="p-6 text-center font-black text-slate-800 text-lg">{item.jumlah}</td>
                      <td className="p-6 text-center">{renderBadge(item.keadaan)}</td>
                      <td className="p-6 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEditClick(item)} className="w-9 h-9 inline-flex items-center justify-center text-slate-300 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-all">
                            <Edit3 size={18}/>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-9 h-9 inline-flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
               )) : <tr><td colSpan={7} className="p-20 text-center"><Inbox size={48} className="mx-auto text-slate-200 mb-4"/><p className="font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Data Aset</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Halaman {currentPage} dari {totalPages || 1} — Total {filteredData.length} Barang
          </p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
          </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editMode ? 'Edit Data Aset' : 'Tambah Aset Baru'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">{editMode ? 'Perbarui informasi aset bidang' : 'Lengkapi detail inventaris'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Barang</label>
                  <input type="text" required placeholder="Contoh: Laptop Kantor, Meja Rapat..." className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.nama_barang} onChange={e => setFormData({...formData, nama_barang: e.target.value})} />
                </div>
                
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jenis Barang</label>
                  <input type="text" required placeholder="Contoh: Elektronik, Mebel..." className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.jenis_barang} onChange={e => setFormData({...formData, jenis_barang: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Merk / Model</label>
                  <input type="text" required placeholder="Contoh: Lenovo Thinkpad, Olympic..." className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.merk_model} onChange={e => setFormData({...formData, merk_model: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Penempatan (Ruangan)</label>
                  <input type="text" required placeholder="Contoh: Ruang Rapat Lt. 1, Ruang Kabid..." className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.penempatan} onChange={e => setFormData({...formData, penempatan: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tahun Pembelian</label>
                  <input type="number" required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.tahun_pembelian} onChange={e => setFormData({...formData, tahun_pembelian: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jumlah Barang</label>
                  <input type="number" min="1" required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-blue-500 text-sm font-bold text-slate-700" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Keadaan Barang</label>
                  <div className="flex gap-4">
                    {['baik', 'kurang baik', 'rusak berat'].map((kondisi) => (
                      <label key={kondisi} className={`flex-1 flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.keadaan === kondisi ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        <input type="radio" name="keadaan" value={kondisi} className="hidden" checked={formData.keadaan === kondisi} onChange={(e) => setFormData({...formData, keadaan: e.target.value})} />
                        <span className="font-bold text-xs uppercase">{kondisi}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
              <button type="submit" className="w-full mt-8 bg-brand-dark text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all active:scale-[0.98]">
                {editMode ? 'Simpan Perubahan' : 'Simpan Aset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsetBidang;