import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Calendar, FileText, Tag, UploadCloud, Loader2, AlignLeft, Images } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  data?: any; 
}

const ModalKegiatan: React.FC<ModalProps> = ({ isOpen, onClose, onRefresh, data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeSubTab = queryParams.get('kategori') || 'PENGELOLAAN PORTAL';

  const [formData, setFormData] = useState({
    tanggal: '',
    nama_kegiatan: '',
    keterangan: '',
    tipe: 'bulanan',
    kategori: activeSubTab,
    dokumentasi: [] as File[] // SEKARANG BERUPA ARRAY OF FILES
  });

  useEffect(() => {
    if (data && isOpen) {
      const formattedDate = data.tanggal ? data.tanggal.split('T')[0] : '';
      
      setFormData({
        tanggal: formattedDate,
        nama_kegiatan: data.nama_kegiatan || '',
        keterangan: data.keterangan || '',
        tipe: data.tipe || 'bulanan',
        kategori: data.kategori || activeSubTab, 
        dokumentasi: [] 
      });

      // Logika untuk menampilkan jumlah gambar yang sudah ada saat mode Edit
      if (data.dokumentasi || data.gambar) {
        let count = 1;
        const imgData = data.dokumentasi || data.gambar;
        try {
           const parsed = JSON.parse(imgData);
           if (Array.isArray(parsed)) count = parsed.length;
        } catch(e) {
           if (imgData.includes(',')) count = imgData.split(',').length;
        }
        setFileStatus(`${count} gambar sudah tersimpan (Abaikan jika tak diubah)`);
      } else {
        setFileStatus(null);
      }
    
    } else if (isOpen && !data) {
      setFormData({
        tanggal: '', 
        nama_kegiatan: '', 
        keterangan: '', 
        tipe: 'bulanan', 
        kategori: activeSubTab, 
        dokumentasi: []
      });
      setFileStatus(null);
    }
  }, [data, isOpen, activeSubTab]); 

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Wajib unggah saat tambah data baru
    if (formData.dokumentasi.length === 0 && !data) {
      Swal.fire('Peringatan', 'Minimal 1 dokumentasi (gambar) wajib diunggah!', 'warning');
      return;
    }

    setIsLoading(true);
    const formPayload = new FormData();
    formPayload.append('tanggal', formData.tanggal);
    formPayload.append('nama_kegiatan', formData.nama_kegiatan);
    formPayload.append('keterangan', formData.keterangan); 
    formPayload.append('tipe', formData.tipe);
    formPayload.append('kategori', formData.kategori);
    
    // LOOPING UNTUK MENGIRIM MULTIPLE FILES DENGAN FIELD NAME YANG SAMA
    if (formData.dokumentasi.length > 0) {
      formData.dokumentasi.forEach((file) => {
        formPayload.append('dokumentasi', file);
      });
    }

    const url = data ? `${API_BASE_URL}/api/rekapan/${data.id}` : `${API_BASE_URL}/api/rekapan`;
    const method = data ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formPayload,
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: data ? 'Data kegiatan berhasil diperbarui!' : 'Data kegiatan berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false
        });
        
        onRefresh();
        onClose();
      } else {
        const errData = await response.json();
        Swal.fire('Gagal', errData.message || 'Terjadi kesalahan saat menyimpan data', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl relative z-10 transform transition-all flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
          <div>
            <h3 className="text-xl font-black text-brand-dark tracking-tight">
              {data ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Isi formulir di bawah ini dengan lengkap</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="formKegiatan" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Tanggal */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Kegiatan</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <input 
                  type="date" 
                  className="w-full p-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-600 font-medium" 
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                  value={formData.tanggal}
                  required 
                />
              </div>
            </div>

            {/* Input Judul */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Uraian / Judul Kegiatan</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Contoh: Rapat Koordinasi..." 
                  className="w-full p-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-600 font-medium"
                  onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})} 
                  value={formData.nama_kegiatan}
                  required 
                />
              </div>
            </div>

            {/* Input Deskripsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Lengkap</label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <textarea 
                  placeholder="Jelaskan detail kegiatan, output, atau catatan penting..." 
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-600 font-medium h-28 resize-none"
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                  value={formData.keterangan}
                />
              </div>
            </div>

            {/* Input Kategori */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Sektoral</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <select 
                  className="w-full p-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-600 font-medium appearance-none" 
                  onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  value={formData.kategori}
                >
                  <option value="PENGELOLAAN PORTAL">PENGELOLAAN PORTAL</option>
                  <option value="PENGEMBANGAN FRONTEND">PENGEMBANGAN FRONTEND</option>
                  <option value="PENGEMBANGAN BACKEND">PENGEMBANGAN BACKEND</option>
                  <option value="ADMINISTRASI">ADMINISTRASI</option>
                  <option value="FGD/RAPAT/UNDANGAN">FGD/RAPAT/UNDANGAN</option>
                  <option value="MANAJEMEN DATA">MANAJEMEN DATA</option>
                  <option value="METADATA">METADATA</option>
                  <option value="INFOGRAFIS">INFOGRAFIS</option>
                </select>
              </div>
            </div>

            {/* INPUT MULTIPLE IMAGES */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Dokumentasi (Bisa lebih dari 1 gambar)</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="w-12 h-12 mb-3 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    {formData.dokumentasi.length > 1 ? <Images className="text-brand-primary" size={24} /> : <UploadCloud className="text-brand-primary" size={24} />}
                  </div>
                  
                  {fileStatus ? (
                    <p className="text-xs text-brand-primary font-bold bg-brand-primary/10 px-3 py-1 rounded-full">{fileStatus}</p>
                  ) : (
                    <>
                      <p className="mb-1 text-sm text-slate-500 font-medium">
                        <span className="font-bold text-brand-primary">Klik untuk unggah</span> banyak gambar
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG atau JPEG (Bisa pilih beberapa sekaligus)</p>
                    </>
                  )}
                </div>
                
                {/* TAMBAHAN PROPERTI MULTIPLE */}
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const filesArray = Array.from(e.target.files);
                      setFormData({...formData, dokumentasi: filesArray});
                      setFileStatus(`${filesArray.length} gambar dipilih`);
                    }
                  }} 
                />
              </label>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-[2rem]">
          <button 
            type="submit" 
            form="formKegiatan"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={20} /> MENYIMPAN DATA...</>
            ) : (
              data ? 'SIMPAN PERUBAHAN' : 'SIMPAN REKAPAN'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalKegiatan;