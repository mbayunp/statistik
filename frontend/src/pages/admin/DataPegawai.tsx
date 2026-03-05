import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserPlus, Edit, Trash2, Users, Search} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const DataPegawai: React.FC = () => {
  const [pegawai, setPegawai] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Modal
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nip: '', nama: '', jabatan: '', golongan: '' });

  const fetchPegawai = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pegawai`);
      setPegawai(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleEdit = (p: any) => {
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
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/pegawai/${id}`);
        fetchPegawai();
        Swal.fire('Terhapus', '', 'success');
      }
    });
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
            <p className="text-slate-500 text-sm font-medium">Kelola data jabatan, golongan, dan identitas pegawai.</p>
          </div>
          
          <button 
            onClick={() => { setEditMode(false); setFormData({nip:'', nama:'', jabatan:'', golongan:''}); setShowModal(true); }}
            className="bg-brand-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-primary transition-all shadow-lg"
          >
            <UserPlus size={20} /> Tambah Pegawai
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan Nama atau NIP..." 
            className="w-full bg-transparent outline-none text-sm font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">NIP</th>
                <th className="p-6">Nama Pegawai</th>
                <th className="p-6">Jabatan</th>
                <th className="p-6 text-center">Gol</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredPegawai.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-6 font-mono text-xs text-brand-primary">{p.nip || '-'}</td>
                  <td className="p-6 font-bold text-slate-800">{p.nama}</td>
                  <td className="p-6">{p.jabatan || '-'}</td>
                  <td className="p-6 text-center"><span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold">{p.golongan || '-'}</span></td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
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
                    type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm"
                    value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                  <input 
                    required type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm"
                    value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jabatan</label>
                    <input 
                      type="text" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm"
                      value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Golongan</label>
                    <input 
                      type="text" placeholder="Contoh: IV/a" className="w-full px-5 py-4 bg-slate-100 rounded-2xl border-none outline-none focus:ring-2 ring-brand-primary transition-all font-bold text-sm"
                      value={formData.golongan} onChange={(e) => setFormData({...formData, golongan: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-brand-primary/20">
                {editMode ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>);
};

export default DataPegawai;