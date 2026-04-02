import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { Wallet, Plus, Trash2, Search, FileText, X, Inbox, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Pilihan periode diubah hanya menjadi Bulan
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const KeuanganPage: React.FC = () => {
  const { jenis, kategori } = useParams<{ jenis: string, kategori?: string }>();
  
  const isAnggaran = jenis === 'anggaran';
  const titleText = isAnggaran ? 'Realisasi Anggaran' : `PBJ - ${kategori === 'modal' ? 'Modal' : 'Pegawai'}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State form disederhanakan tanpa nilai_anggaran & nilai_realisasi
  const [formData, setFormData] = useState({
    judul_laporan: '',
    tahun: new Date().getFullYear(),
    periode: '',
    keterangan: ''
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const query = kategori ? `?jenis=${jenis}&kategori=${kategori}` : `?jenis=${jenis}`;
      const res = await axios.get(`${API_BASE_URL}/api/keuangan${query}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jenis, kategori]);

  useEffect(() => {
    fetchData();
    setSearchTerm('');
    setCurrentPage(1);
  }, [jenis, kategori, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return Swal.fire('Peringatan', 'File laporan wajib diunggah!', 'warning');

    const submitData = new FormData();
    submitData.append('jenis_laporan', jenis || 'anggaran');
    if (kategori) submitData.append('kategori_pengadaan', kategori);
    
    submitData.append('judul_laporan', formData.judul_laporan);
    submitData.append('tahun', formData.tahun.toString());
    submitData.append('periode', formData.periode);
    submitData.append('keterangan', formData.keterangan);
    submitData.append('file_laporan', file);

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await axios.post(`${API_BASE_URL}/api/keuangan`, submitData);
      Swal.fire('Berhasil', 'Laporan berhasil disimpan', 'success');
      setShowModal(false); setFile(null);
      setFormData({ judul_laporan: '', tahun: new Date().getFullYear(), periode: '', keterangan: '' });
      fetchData();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan laporan', 'error');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Hapus Laporan?', text: "Data ini tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus' })
    .then(async (res) => {
      if (res.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/api/keuangan/${id}`);
        Swal.fire('Terhapus', 'Laporan dihapus', 'success');
        fetchData();
      }
    });
  };

  // Logika Pagination & Pencarian
  const filteredData = data.filter(d => 
    d.judul_laporan.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.periode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Wallet size={36} className="text-brand-primary" /> Laporan {titleText}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Publikasi transparansi keuangan {titleText.toLowerCase()} instansi.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary shadow-xl transition-all active:scale-95">
          <Plus size={20} /> Unggah Laporan
        </button>
      </div>

      {/* PENCARIAN */}
      <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Cari nama laporan atau bulan..." 
          className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:text-slate-400" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-6 w-16 text-center">No</th>
                <th className="p-6">Informasi Laporan</th>
                <th className="p-6">Keterangan</th>
                <th className="p-6 text-center">Dokumen PDF</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="p-10 text-center font-bold text-slate-400 animate-pulse">Memuat...</td></tr> : 
               currentItems.length > 0 ? currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 group transition-all">
                      <td className="p-6 text-center font-bold text-slate-400">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-slate-700 text-sm max-w-sm line-clamp-2">{item.judul_laporan}</div>
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1">
                          Bulan {item.periode} • Tahun {item.tahun}
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 max-w-xs">{item.keterangan || '-'}</p>
                      </td>
                      <td className="p-6 text-center">
                        <a 
                          href={`${API_BASE_URL}/uploads/${item.file_laporan}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                            item.file_laporan.toLowerCase().endsWith('.pdf') 
                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {item.file_laporan.toLowerCase().endsWith('.pdf') ? (
                             <><Eye size={16}/> Lihat PDF</>
                          ) : (
                             <><Download size={16}/> Unduh Excel</>
                          )}
                        </a>
                      </td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleDelete(item.id)} className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
               )) : <tr><td colSpan={5} className="p-20 text-center"><Inbox size={48} className="mx-auto text-slate-200 mb-4"/><p className="font-bold text-slate-400 uppercase tracking-widest">Data Kosong</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION INFO */}
      <div className="mt-6 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Halaman {currentPage} dari {totalPages || 1} — Total {filteredData.length} Laporan
          </p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
          </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Unggah Laporan</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Lengkapi detail dan lampirkan PDF</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Dokumen Laporan</label>
                  <input required placeholder="Contoh: Laporan Realisasi Triwulan..." className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-brand-primary text-sm font-bold text-slate-700" value={formData.judul_laporan} onChange={e => setFormData({...formData, judul_laporan: e.target.value})} />
                </div>
                
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bulan Laporan</label>
                  <select required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-brand-primary text-sm font-bold text-slate-700 cursor-pointer" value={formData.periode} onChange={e => setFormData({...formData, periode: e.target.value})}>
                    <option value="">-- Pilih Bulan --</option>
                    {BULAN.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tahun Anggaran</label>
                  <input type="number" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-brand-primary text-sm font-bold text-slate-700" value={formData.tahun} onChange={e => setFormData({...formData, tahun: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Keterangan (Opsional)</label>
                  <textarea placeholder="Tambahkan catatan jika ada..." className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-brand-primary text-sm font-bold text-slate-700 h-24" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
                </div>

                <div className="col-span-2 p-6 bg-slate-50 rounded-4xl border border-slate-200 border-dashed">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={16} /> Pilih Dokumen Laporan (PDF / Excel)
                  </label>
                  <input 
                    type="file" 
                    required 
                    accept=".pdf,.xls,.xlsx" 
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-brand-primary file:text-white hover:file:bg-brand-dark file:cursor-pointer cursor-pointer transition-all" 
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                  />
                </div>

              </div>
              <button type="submit" className="w-full mt-8 bg-brand-dark text-white py-5 rounded-4xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-brand-primary transition-all active:scale-[0.98]">Simpan & Publikasikan Laporan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeuanganPage;