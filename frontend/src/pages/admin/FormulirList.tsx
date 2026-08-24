import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ListChecks, Plus, Settings, Eye, Users, Trash2, Search, FileText, Loader2, Inbox } from 'lucide-react';
import { API_BASE_URL } from '../../config'; 

const FormulirList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/formulir`);
      if (res.data.success) {
        setForms(res.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat formulir:", error);
      Swal.fire('Error', 'Gagal memuat daftar formulir dari server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Formulir?',
      text: "Formulir beserta semua respons dan jawaban akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/formulir/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Formulir berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false
        });
        fetchForms(); 
      } catch (error) {
        console.error(error);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus formulir', 'error');
      }
    }
  };

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    form.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-brand-dark tracking-tight flex items-center gap-3">
            <ListChecks size={36} className="text-brand-primary" /> Pembuat Formulir
          </h1>
          <p className="text-slate-500 font-medium mt-1">Kelola formulir kustom, kuesioner, dan survei publik.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/formulir/builder')} 
          className="bg-brand-dark text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95 shrink-0"
        >
          <Plus size={20} /> Buat Formulir Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3 mb-6 w-full md:w-96">
        <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Cari nama atau slug..." 
          className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* State Loading & Kosong */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Memuat Formulir...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 border-dashed shadow-sm">
          <Inbox size={48} className="text-slate-200 mb-4" />
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Belum ada formulir dibuat</p>
        </div>
      ) : (
        /* Form Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div key={form.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 group flex flex-col">
              
              {/* Card Header */}
              <div className="p-6 border-b border-slate-50 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${form.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {form.is_active ? 'AKTIF' : 'DRAFT'}
                  </div>
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <FileText size={14} /> {new Date(form.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-800 leading-snug group-hover:text-brand-primary transition-colors">
                  {form.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 truncate">
                  /{form.slug}
                </p>
              </div>

              {/* Card Body - Stats */}
              <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
                <button 
                    onClick={() => navigate(`/admin/formulir/responses/${form.id}`)}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-primary font-black transition-colors"
                > 
                    <Users size={16} className="text-brand-secondary" />
                    <span>{form.total_responses || 0} <span className="font-medium text-xs text-slate-400 hover:underline">Respon (Klik untuk melihat)</span></span>
                </button>
                </div>

              {/* Card Footer - Actions */}
              <div className="p-4 grid grid-cols-3 gap-2 mt-auto">
                <button 
                  onClick={() => navigate(`/admin/formulir/edit/${form.id}`)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                  <Settings size={18} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Edit</span>
                </button>
                <button 
                    onClick={() => window.open(`/form/${form.slug}`, '_blank')}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                    <Eye size={18} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Preview</span>
                </button>
                <button 
                  onClick={() => handleDelete(form.id)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default FormulirList;