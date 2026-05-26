import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Trash2, Download, Search, Loader2, Code, PieChart } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

interface Laporan {
  id: number;
  bulan: string;
  tahun: number;
  kategori: string;
  nama_file: string;
  file_path: string;
  uploaded_at: string;
}

const LaporanBulanan: React.FC = () => {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Programmer' | 'Statistisi'>('Programmer');

  // State Form
  const [bulan, setBulan] = useState('Januari');
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [kategoriUpload, setKategoriUpload] = useState('Programmer');
  const [file, setFile] = useState<File | null>(null);

  const listBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/laporan`);
      if (res.data.success) {
        setLaporan(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil laporan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Pilih file terlebih dahulu!' });
    }

    const formData = new FormData();
    formData.append('bulan', bulan);
    formData.append('tahun', tahun);
    formData.append('kategori', kategoriUpload);
    formData.append('file_laporan', file);

    setIsUploading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/laporan/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Laporan berhasil diunggah', confirmButtonColor: '#00D2B4' });
        setFile(null); 
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Pindah tab otomatis ke kategori yang baru saja diupload
        setActiveTab(kategoriUpload as 'Programmer' | 'Statistisi');
        fetchLaporan(); 
      }
    } catch (error) {
      let message = 'Gagal mengunggah laporan';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Laporan?',
      text: "Laporan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/laporan/${id}`);
        Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Laporan berhasil dihapus.', confirmButtonColor: '#00D2B4' });
        fetchLaporan();
      } catch {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  };

  // Filter data berdasarkan Tab yang sedang aktif
  const filteredLaporan = laporan.filter(item => item.kategori === activeTab);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-dark tracking-tight">Laporan Bulanan Tenaga Ahli</h1>
        <p className="text-slate-500 font-medium mt-2">Manajemen arsip dokumen bulanan Programmer dan Statistisi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Upload */}
        <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
              <UploadCloud size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">Unggah Laporan</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Divisi / Kategori</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setKategoriUpload('Programmer')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${kategoriUpload === 'Programmer' ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-brand-primary/50'}`}
                >
                  <Code size={16} /> Programmer
                </button>
                <button 
                  type="button"
                  onClick={() => setKategoriUpload('Statistisi')}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${kategoriUpload === 'Statistisi' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-amber-500/50'}`}
                >
                  <PieChart size={16} /> Statistisi
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan</label>
                <select 
                  value={bulan} onChange={(e) => setBulan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                >
                  {listBulan.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun</label>
                <input 
                  type="number" value={tahun} onChange={(e) => setTahun(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Dokumen</label>
              <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center hover:border-brand-primary/50 transition-colors">
                <input 
                  type="file" id="file-upload" onChange={handleFileChange}
                  className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText className="text-slate-400 mb-2" size={32} />
                  <span className="text-sm font-semibold text-brand-primary">
                    {file ? file.name : "Klik untuk mencari file (PDF/Word/Excel)"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">
                    Maksimal 10MB
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit" disabled={isUploading}
              className="w-full bg-brand-dark text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? <><Loader2 size={16} className="animate-spin" /> MENGUNGGAH...</> : <><UploadCloud size={16} /> SIMPAN LAPORAN</>}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Tabel Riwayat & Tabs */}
        <div className="lg:col-span-2 bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          {/* Header & Tabs */}
          <div className="p-8 pb-0 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-6">
            
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab('Programmer')}
                className={`pb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'Programmer' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Code size={18} /> Programmer
              </button>
              <button 
                onClick={() => setActiveTab('Statistisi')}
                className={`pb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'Statistisi' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <PieChart size={18} /> Statistisi
              </button>
            </div>

            <div className="relative pb-4">
              <Search size={16} className="absolute left-4 top-2.5 text-slate-400" />
              <input type="text" placeholder="Cari laporan..." className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 w-full sm:w-56 transition-all" />
            </div>

          </div>

          {/* Tabel Data */}
          <div className="p-0 overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="p-6 border-b border-slate-100">Periode</th>
                  <th className="p-6 border-b border-slate-100">Nama Dokumen</th>
                  <th className="p-6 border-b border-slate-100">Tanggal Upload</th>
                  <th className="p-6 border-b border-slate-100 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-16 text-slate-400">
                      <Loader2 className="animate-spin mx-auto mb-3" size={28} />
                      <span className="font-bold text-xs uppercase tracking-widest">Memuat data...</span>
                    </td>
                  </tr>
                ) : filteredLaporan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-16 text-slate-400">
                      <FileText className="mx-auto mb-4 opacity-30" size={40} />
                      <span className="font-bold text-xs uppercase tracking-widest">Belum ada laporan {activeTab}</span>
                    </td>
                  </tr>
                ) : (
                  filteredLaporan.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                      <td className="p-6">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-black text-xs tracking-wider">
                          {item.bulan} {item.tahun}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${activeTab === 'Programmer' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                            <FileText size={16} />
                          </div>
                          <span className="font-semibold text-slate-700 line-clamp-1 group-hover:text-brand-primary transition-colors cursor-pointer" title={item.nama_file}>
                            {item.nama_file}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-slate-500 font-semibold text-xs">
                        {new Date(item.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`${API_BASE_URL}${item.file_path}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                            title="Unduh File"
                          >
                            <Download size={16} />
                          </a>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                            title="Hapus Laporan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LaporanBulanan;