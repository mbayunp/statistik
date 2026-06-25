import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  X,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface SuratItem {
  id: number;
  nomor_surat: string;
  instansi: string;
  tanggal_surat: string;
  tanggal_terima: string;
  perihal: string;
  file_surat?: string;
}

const SuratPage: React.FC = () => {
  // Ambil parameter 'type' dari URL (isinya 'masuk' atau 'keluar')
  const { type } = useParams<{ type: string }>(); 
  const isMasuk = type === 'masuk'; 

  const [surat, setSurat] = useState<SuratItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    nomor_surat: '',
    instansi: '', 
    tanggal_surat: '',
    tanggal_terima: '',
    perihal: '',
    keterangan: ''
  });

  // 1. Fungsi Fetch Data (Dinamis berdasarkan type)
  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/surat/${type}`);
      setSurat(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [type]);

  // Render ulang data setiap kali parameter URL berubah (pindah menu masuk <-> keluar)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSurat();
      setSearchTerm(''); 
      setCurrentPage(1); // Reset halaman ke 1 saat pindah tipe surat
    }, 0);
    return () => clearTimeout(timer);
  }, [type, fetchSurat]); 

  // Reset halaman ke 1 saat pengguna melakukan pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Helper Format Tanggal
  const formatTanggal = (tanggalString: string) => {
    if (!tanggalString) return "-";
    const dateObj = new Date(tanggalString);
    if (isNaN(dateObj.getTime())) return tanggalString;
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('isSurat', 'true'); 
    data.append('jenis_surat', type || 'masuk'); 
    
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (file) {
      data.append('file_surat', file); 
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      await axios.post(`${API_BASE_URL}/api/surat`, data);
      
      Swal.fire('Berhasil', `Surat ${type} berhasil dicatat`, 'success');
      setShowModal(false);
      setFile(null);
      setFormData({ nomor_surat: '', instansi: '', tanggal_surat: '', tanggal_terima: '', perihal: '', keterangan: '' });
      fetchSurat();
    } catch (err) {
      let message = 'Gagal simpan surat';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      Swal.fire('Error', message, 'error');
    }
  };

  // 4. Handle Delete
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Data?',
      text: "Data surat akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/surat/${id}`);
          Swal.fire('Terhapus', 'Data berhasil dihapus', 'success');
          fetchSurat();
        } catch {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
        }
      }
    });
  };

  // 5. Filter Pencarian & Pagination
  const filteredSurat = surat.filter(s => 
    s.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.perihal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 lg:p-10 bg-slate-50 min-h-screen text-left overflow-y-auto">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              {isMasuk ? <Mail size={36} className="text-emerald-500" /> : <Send size={36} className="text-blue-500" />} 
              Surat {type}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manajemen pengarsipan dokumen surat {type} instansi.</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl hover-lift active-shrink cursor-pointer"
          >
            <Plus size={20} /> Catat Surat {type}
          </button>
        </div>

        {/* === CONTROL BAR (SEARCH & LIMIT) === */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* SEARCH BAR */}
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder={`Cari nomor surat, ${isMasuk ? 'asal' : 'tujuan'} instansi, atau perihal...`} 
              className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ROW LIMIT DROPDOWN */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
             <span className="text-[10px] font-black text-slate-400 uppercase">Baris:</span>
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

        {/* === TABLE SECTION === */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* Versi Desktop (Tabel) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">No</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Info Surat</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-56">Log Tanggal</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perihal</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Dokumen</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                        <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat data...</p>
                     </td>
                   </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group align-top">
                      
                      {/* NOMOR URUT DINAMIS */}
                      <td className="p-6 text-center font-black text-slate-400 text-sm">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="p-6">
                        <div className="font-bold text-slate-800 leading-tight mb-1 text-sm">{s.nomor_surat}</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${isMasuk ? 'text-emerald-500' : 'text-blue-500'}`}>
                          <Building2 size={12} />
                          {s.instansi}
                        </div>
                      </td>
                      
                      <td className="p-6">
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            Tgl Surat: <span className="font-bold text-slate-600">{formatTanggal(s.tanggal_surat)}</span>
                          </div>
                          <div className="text-[11px] text-slate-800 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isMasuk ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            {isMasuk ? 'Diterima:' : 'Dikirim:'} <span className="font-black">{formatTanggal(s.tanggal_terima)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                         <p className="text-xs font-medium text-slate-600 line-clamp-3 italic max-w-sm">"{s.perihal}"</p>
                      </td>

                      <td className="p-6 text-center">
                        {s.file_surat ? (
                          <a 
                            href={`${API_BASE_URL}/uploads/${s.file_surat}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-all hover:scale-110 ${
                              s.file_surat.toLowerCase().endsWith('.pdf') 
                              ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                            }`}
                            title="Buka Dokumen"
                          >
                            {s.file_surat.toLowerCase().endsWith('.pdf') ? <FileText size={20} /> : <Download size={20} />}
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[10px] italic font-bold uppercase">No File</span>
                        )}
                      </td>

                      <td className="p-6 text-center">
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          className="w-10 h-10 inline-flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <Inbox size={64} />
                          <p className="mt-4 font-black text-sm uppercase tracking-widest">Data Tidak Ditemukan</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Versi Mobile (Card List) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-20 text-center">
                 <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                 <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat data...</p>
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((s, index) => (
                <div key={s.id} className="p-6 space-y-4 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Info Surat</div>
                      <div className="font-bold text-slate-800 text-sm leading-tight">{s.nomor_surat}</div>
                      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mt-1 ${isMasuk ? 'text-emerald-500' : 'text-blue-500'}`}>
                        <Building2 size={12} />
                        {s.instansi}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right shrink-0">
                      No. {indexOfFirstItem + index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Tgl Surat</span>
                      <span className="text-xs font-bold text-slate-700">{formatTanggal(s.tanggal_surat)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">{isMasuk ? 'Diterima' : 'Dikirim'}</span>
                      <span className="text-xs font-black text-slate-800">{formatTanggal(s.tanggal_terima)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Perihal</span>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{s.perihal}"</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    {s.file_surat ? (
                      <a 
                        href={`${API_BASE_URL}/uploads/${s.file_surat}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          s.file_surat.toLowerCase().endsWith('.pdf') 
                          ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {s.file_surat.toLowerCase().endsWith('.pdf') ? <FileText size={14} /> : <Download size={14} />}
                        Dokumen
                      </a>
                    ) : (
                      <span className="text-slate-300 text-[10px] italic font-bold uppercase">No File</span>
                    )}

                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="inline-flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} /> <span className="text-xs font-bold">Hapus</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                 <div className="flex flex-col items-center opacity-20">
                    <Inbox size={64} />
                    <p className="mt-4 font-black text-sm uppercase tracking-widest">Data Tidak Ditemukan</p>
                 </div>
              </div>
            )}
          </div>

        </div>

        {/* === PAGINATION === */}
        {filteredSurat.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Halaman {currentPage} dari {totalPages || 1} — Total {filteredSurat.length} Surat
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
          </div>
        )}

      </div>

      {/* === MODAL TAMBAH SURAT === */}
      {showModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Catat Surat {type}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Lengkapi form sesuai fisik surat</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nomor Surat</label>
                  <input required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" placeholder="Contoh: 001/SK/III/2026" value={formData.nomor_surat} onChange={e => setFormData({...formData, nomor_surat: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    {isMasuk ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi / Penerima'}
                  </label>
                  <input required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" placeholder="Nama Instansi" value={formData.instansi} onChange={e => setFormData({...formData, instansi: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex mb-2 items-center gap-1"><Calendar size={12} /> Tanggal di Surat</label>
                  <input type="date" className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" value={formData.tanggal_surat} onChange={e => setFormData({...formData, tanggal_surat: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex mb-2 items-center gap-1">
                    <Calendar size={12} /> {isMasuk ? 'Tanggal Diterima' : 'Tanggal Dikirim'}
                  </label>
                  <input type="date" required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" value={formData.tanggal_terima} onChange={e => setFormData({...formData, tanggal_terima: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Perihal / Hal</label>
                  <textarea required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold h-24" placeholder="Isi ringkasan perihal surat..." value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unggah Dokumen (JPG/PNG/PDF)</label>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-brand-dark file:text-white hover:file:bg-brand-primary file:cursor-pointer cursor-pointer" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                </div>
              </div>

              <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-4xl font-black uppercase tracking-[0.2em] text-xs mt-8 hover:bg-brand-primary transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]">
                Simpan & Arsipkan Surat {type}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratPage;