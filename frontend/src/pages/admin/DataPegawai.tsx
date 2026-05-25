import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserPlus, Edit, Trash2, Users, Search, GripVertical } from 'lucide-react';
import { API_BASE_URL } from '../../config';

interface Pegawai {
  id: number;
  nip?: string;
  nama: string;
  jabatan?: string;
  golongan?: string;
  urutan?: number;
}

const DataPegawai: React.FC = () => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nip: '', nama: '', jabatan: '', golongan: '' });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const fetchPegawai = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/pegawai`);
      setPegawai(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPegawai(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && currentId) {
        await axios.put(`${API_BASE_URL}/api/pegawai/${currentId}`, formData);
        Swal.fire('Berhasil', 'Data diperbarui', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/pegawai`, formData);
        Swal.fire('Berhasil', 'Pegawai ditambahkan', 'success');
      }
      setShowModal(false);
      setFormData({ nip: '', nama: '', jabatan: '', golongan: '' });
      fetchPegawai();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      Swal.fire('Error', axiosError.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleEdit = (p: Pegawai) => {
    setEditMode(true);
    setCurrentId(p.id);
    setFormData({ nip: p.nip || '', nama: p.nama, jabatan: p.jabatan || '', golongan: p.golongan || '' });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Pegawai?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/pegawai/${id}`);
          fetchPegawai();
          Swal.fire('Terhapus', '', 'success');
        } catch {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
        }
      }
    });
  };

  // === FUNGSI DRAG AND DROP REVISI ===
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    setDraggedOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPegawai = [...pegawai];
    const draggedItem = newPegawai[draggedIndex];
    newPegawai.splice(draggedIndex, 1);
    newPegawai.splice(dropIndex, 0, draggedItem);

    setPegawai(newPegawai);
    setDraggedIndex(null);

    try {
      const reorderedData = newPegawai.map((p, index) => ({ id: p.id, urutan: index + 1 }));
      await axios.put(`${API_BASE_URL}/api/pegawai/reorder`, { data: reorderedData });
    } catch (error) {
      console.error('Gagal menyimpan urutan', error);
      Swal.fire('Gagal', 'Urutan gagal disimpan ke server', 'error');
      fetchPegawai();
    }
  };

  const filteredPegawai = pegawai.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.nip && p.nip.includes(searchTerm))
  );

  return (
    <div>
      <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Users size={32} className="text-brand-primary" /> Manajemen Pegawai
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Kelola data jabatan, golongan, dan identitas pegawai.</p>
          </div>
          
          <button 
            onClick={() => { setEditMode(false); setFormData({nip:'', nama:'', jabatan:'', golongan:''}); setShowModal(true); }}
            className="bg-brand-dark text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95"
          >
            <UserPlus size={20} /> Tambah Pegawai
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Cari berdasarkan Nama atau NIP..." 
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6 w-12 text-center">Handle</th>
                <th className="p-6">NIP</th>
                <th className="p-6">Nama Pegawai</th>
                <th className="p-6">Jabatan</th>
                <th className="p-6 text-center">Gol</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <tr key={i} className="animate-pulse">
                     <td className="p-6 text-center"><div className="w-6 h-6 bg-slate-100 rounded-lg mx-auto" /></td>
                     <td className="p-6"><div className="w-24 h-4 bg-slate-100 rounded-md" /></td>
                     <td className="p-6"><div className="w-40 h-4 bg-slate-100 rounded-md" /></td>
                     <td className="p-6"><div className="w-32 h-4 bg-slate-100 rounded-md" /></td>
                     <td className="p-6 text-center"><div className="w-10 h-6 bg-slate-100 rounded-lg mx-auto" /></td>
                     <td className="p-6"><div className="w-16 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                   </tr>
                 ))
              ) : filteredPegawai.map((p, index) => (
                <tr 
                  key={p.id} 
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={() => setDraggedOverIndex(null)}
                  onDrop={() => handleDrop(index)}
                  className={`hover:bg-slate-50/80 transition-all duration-200 group relative ${
                    draggedIndex === index ? 'opacity-30 bg-slate-100 scale-[0.98] shadow-inner' : ''
                  } ${
                    draggedOverIndex === index ? 'border-b-4 border-dashed border-brand-primary bg-brand-primary/5 shadow-lg' : ''
                  }`}
                >
                  {/* KOLOM HANDLE: Hanya area ini yang bisa nge-drag baris */}
                  <td className="p-6 text-center text-slate-300">
                    <div
                      draggable={searchTerm === ''}
                      onDragStart={() => handleDragStart(index)}
                      className={`cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-slate-100 hover:text-brand-primary inline-flex items-center justify-center transition-all ${searchTerm !== '' ? 'opacity-20 cursor-not-allowed' : ''}`}
                      title={searchTerm !== '' ? "Matikan pencarian untuk mengatur urutan" : "Tarik untuk mengatur urutan"}
                    >
                      <GripVertical size={20} />
                    </div>
                  </td>

                  {/* KOLOM DATA: Tetap bisa di-copy */}
                  <td className="p-6 font-mono text-xs text-slate-500 font-bold select-text">{p.nip || '-'}</td>
                  <td className="p-6 font-bold text-slate-800 text-sm select-text">{p.nama}</td>
                  <td className="p-6 text-sm font-medium text-slate-600 select-text">{p.jabatan || '-'}</td>
                  <td className="p-6 text-center"><span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{p.golongan || '-'}</span></td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(p)} className="w-10 h-10 inline-flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-10 h-10 inline-flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TETAP SAMA */}
      {showModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden my-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editMode ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">NIP (Opsional)</label>
                  <input 
                    type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm text-slate-700"
                    value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                  <input 
                    required type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm text-slate-700"
                    value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jabatan</label>
                    <input 
                      type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm text-slate-700"
                      value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Golongan</label>
                    <input 
                      type="text" placeholder="Contoh: IV/a" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm text-slate-700"
                      value={formData.golongan} onChange={(e) => setFormData({...formData, golongan: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl active:scale-[0.98] mt-4">
                {editMode ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPegawai;