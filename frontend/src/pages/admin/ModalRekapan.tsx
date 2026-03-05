import React, { useState } from 'react';
import { X, Calendar, FileText, Tag, UploadCloud, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ModalKegiatan: React.FC<ModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: '',
    nama_kegiatan: '',
    tipe: 'bulanan',
    kategori: 'PENGELOLAAN PORTAL',
    dokumentasi: null as File | null
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dokumentasi) {
      Swal.fire('Peringatan', 'Dokumentasi (gambar) wajib diunggah!', 'warning');
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('tanggal', formData.tanggal);
    data.append('nama_kegiatan', formData.nama_kegiatan);
    data.append('tipe', formData.tipe);
    data.append('kategori', formData.kategori);
    data.append('dokumentasi', formData.dokumentasi);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rekapan`, {
        method: 'POST',
        body: data,
        headers: { 
        }
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data kegiatan berhasil ditambahkan!',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Reset form setelah sukses
        setFormData({
          tanggal: '', nama_kegiatan: '', tipe: 'bulanan', 
          kategori: 'PENGELOLAAN PORTAL', dokumentasi: null
        });
        setFileName(null);
        
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
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl relative z-10 transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
          <div>
            <h3 className="text-xl font-black text-brand-dark tracking-tight">Tambah Kegiatan</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Isi formulir di bawah ini dengan lengkap</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
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
                  required 
                />
              </div>
            </div>

            {/* Input Nama Kegiatan */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Uraian / Nama Kegiatan</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <textarea 
                  placeholder="Deskripsikan kegiatan yang dilakukan..." 
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-slate-600 font-medium h-28 resize-none"
                  onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})} 
                  required 
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

            {/* Input File (Modern UI) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unggah Dokumentasi (Gambar)</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 mb-3 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="text-brand-primary" size={24} />
                  </div>
                  <p className="mb-1 text-sm text-slate-500 font-medium">
                    <span className="font-bold text-brand-primary">Klik untuk unggah</span> atau seret gambar ke sini
                  </p>
                  <p className="text-xs text-slate-400">
                    {fileName ? <span className="font-bold text-brand-dark">{fileName}</span> : "PNG, JPG atau JPEG (Maks. 5MB)"}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFormData({...formData, dokumentasi: file || null});
                    setFileName(file ? file.name : null);
                  }} 
                />
              </label>
            </div>

          </form>
        </div>

        {/* Footer (Action Buttons) */}
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
              'SIMPAN REKAPAN'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalKegiatan;