import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { X, Upload, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  data?: any; 
}

const ModalKegiatan: React.FC<ModalProps> = ({ isOpen, onClose, onRefresh, data }) => {
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setTanggal(data.tanggal ? data.tanggal.split('T')[0] : '');
      // Sesuaikan fallback keterangan jika ada data lama dengan nama_kegiatan
      setKeterangan(data.keterangan || data.nama_kegiatan || ''); 
      // Sesuaikan fallback gambar jika ada data lama dengan dokumentasi
      const imgPath = data.gambar || data.dokumentasi;
      setPreview(imgPath ? `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}` : null);
    } else {
      setTanggal('');
      setKeterangan('');
      setFile(null);
      setPreview(null);
    }
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Input: File HANYA wajib jika ini tambah data baru (!data)
    if (!data && !file) {
      return Swal.fire("Peringatan", "Silakan pilih foto dokumentasi terlebih dahulu", "warning");
    }

    // 2. Aktifkan State Loading
    setLoading(true);
    Swal.fire({
      title: 'Sedang Memproses...',
      text: 'Mohon jangan tutup halaman ini',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    // 3. Siapkan Data
    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('keterangan', keterangan);
    
    // Hanya append gambar jika user memilih file baru
    if (file) {
      formData.append('gambar', file); 
    }

    try {
      // 4. Cek apakah ini mode Edit (PUT) atau Baru (POST)
      const url = data 
        ? `${API_BASE_URL}/api/kegiatan/${data.id}` 
        : `${API_BASE_URL}/api/kegiatan`;
        
      const method = data ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // Maksimal tunggu 30 detik
      });

      // 5. Cek respon sukses dari backend
      if (response.data.success || response.status === 200 || response.status === 201) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1500, showConfirmButton: false });
        onRefresh(); // Memanggil fetchKegiatan di KegiatanPublik
        onClose();   // Tutup modal
      } else {
        Swal.fire('Gagal', 'Respon server tidak valid.', 'error');
      }

    } catch (error: any) {
      console.error("Upload Error:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses',
        text: error.response?.data?.message || 'Koneksi ke server terputus atau backend mengalami error.'
      });
    } finally {
      // 6. Matikan loading apa pun yang terjadi (Sukses/Gagal)
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
            {data ? 'Edit Postingan' : 'Postingan Baru'}
          </h2>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Tanggal
            </label>
            <input 
              type="date" 
              required 
              value={tanggal} 
              onChange={(e) => setTanggal(e.target.value)} 
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary outline-none font-bold text-slate-700 disabled:opacity-50" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} /> Keterangan
            </label>
            <textarea 
              placeholder="Tulis deskripsi kegiatan..." 
              required 
              rows={3} 
              value={keterangan} 
              onChange={(e) => setKeterangan(e.target.value)} 
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-primary outline-none font-medium text-slate-600 resize-none disabled:opacity-50" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Foto Dokumentasi
            </label>
            <div className={`relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="upload-foto" />
              <label htmlFor="upload-foto" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all overflow-hidden">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center text-slate-400">
                    <Upload size={24} className="mx-auto mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk Upload</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? 'Memproses...' : 'Simpan Postingan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalKegiatan;