import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom'; // Tambahkan ini
import { 
  Mail, 
  Send, // Tambahkan icon Send untuk surat keluar
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  X,
  Inbox
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const SuratPage: React.FC = () => {
  // Ambil parameter 'type' dari URL (isinya 'masuk' atau 'keluar')
  const { type } = useParams<{ type: string }>(); 
  const isMasuk = type === 'masuk'; // Boolean untuk mempermudah logika UI

  const [surat, setSurat] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    nomor_surat: '',
    instansi: '', // Ubah asal_surat menjadi instansi agar universal
    tanggal_surat: '',
    tanggal_terima: '',
    perihal: '',
    keterangan: ''
  });

  // 1. Fungsi Fetch Data (Dinamis berdasarkan type)
  const fetchSurat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/surat/${type}`);
      setSurat(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Render ulang data setiap kali parameter URL berubah (pindah menu masuk <-> keluar)
  useEffect(() => {
    fetchSurat();
    setSearchTerm(''); // Reset pencarian saat pindah menu
  }, [type]); 

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
    data.append('jenis_surat', type || 'masuk'); // Kirim jenis surat ke backend
    
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
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal simpan surat', 'error');
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
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
        }
      }
    });
  };

  // 5. Filter Pencarian
  const filteredSurat = surat.filter(s => 
    s.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.perihal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
        
        {/* HEADER SECTION DINAMIS */}
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
            className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} /> Catat Surat {type}
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-200 flex items-center gap-4">
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

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Info Surat</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Log Tanggal</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Perihal</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dokumen</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={5} className="p-10 text-center animate-pulse text-slate-400 font-bold">Memuat data...</td></tr>
                ) : filteredSurat.length > 0 ? filteredSurat.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
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
                       <p className="text-xs font-medium text-slate-600 line-clamp-2 italic max-w-xs">"{s.perihal}"</p>
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
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
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
        </div>
      </div>

      {/* MODAL TAMBAH SURAT DINAMIS */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto">
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

                {/* LABEL INSTANSI BERUBAH SESUAI TIPE */}
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    {isMasuk ? 'Asal Instansi / Pengirim' : 'Tujuan Instansi / Penerima'}
                  </label>
                  <input required className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" placeholder="Nama Instansi" value={formData.instansi} onChange={e => setFormData({...formData, instansi: e.target.value})} />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1"><Calendar size={12} /> Tanggal di Surat</label>
                  <input type="date" className="w-full p-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all text-sm font-bold" value={formData.tanggal_surat} onChange={e => setFormData({...formData, tanggal_surat: e.target.value})} />
                </div>

                {/* LABEL TANGGAL TERIMA/KIRIM BERUBAH SESUAI TIPE */}
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
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

              <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs mt-8 hover:bg-brand-primary transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98]">
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