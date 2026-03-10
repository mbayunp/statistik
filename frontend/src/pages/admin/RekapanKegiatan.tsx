import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Maximize2, 
  X, 
  DownloadCloud,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter // Tambahan icon filter
} from 'lucide-react';
import ModalRekapan from './ModalRekapan';
import { API_BASE_URL } from '../../config';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const RekapanKegiatan: React.FC = () => {
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');
  const [selectedMonth, setSelectedMonth] = useState<string>('semua'); // STATE BARU UNTUK FILTER BULAN

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeSubTab = queryParams.get('kategori') || 'PENGELOLAAN PORTAL';

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/rekapan`); 
      setKegiatan(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchKegiatan(); 
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, selectedMonth]);

  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=Tanpa+Gambar";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Rekapan?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/rekapan/${id}`);
          fetchKegiatan();
          Swal.fire('Terhapus!', 'Rekapan berhasil dihapus.', 'success');
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus data', 'error');
        }
      }
    });
  };

  const formatTanggalKalender = (tanggalString: string) => {
    const dateObj = new Date(tanggalString);
    if (isNaN(dateObj.getTime())) return tanggalString; 
    return dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  
  let currentData = kegiatan.filter((k: any) => k.kategori === activeSubTab);

  if (selectedMonth !== 'semua') {
    currentData = currentData.filter((item: any) => {
      if (!item.tanggal) return false;
      const dateObj = new Date(item.tanggal);
      if (isNaN(dateObj.getTime())) return false;
      // getMonth() mengembalikan nilai 0 (Januari) sampai 11 (Desember)
      return dateObj.getMonth().toString() === selectedMonth;
    });
  }

  // 3. Sorting
  currentData = currentData.sort((a, b) => {
    const timeA = a.tanggal ? new Date(a.tanggal).getTime() : 0;
    const timeB = b.tanggal ? new Date(b.tanggal).getTime() : 0;
    
    if (sortOrder === 'terbaru') {
      return timeB - timeA; 
    } else {
      return timeA - timeB; 
    }
  });

  // 4. Pagination
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const getBase64ImageFromUrl = async (imageUrl: string) => {
    try {
      const response = await axios.get(imageUrl, { responseType: 'blob' });
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      return null;
    }
  };

  const exportExcel = () => {
    if (currentData.length === 0) return Swal.fire('Kosong', 'Tidak ada data', 'info');
    const dataToExport = currentData.map((item, index) => ({
      'No': index + 1,
      'Tanggal Pelaksanaan': formatTanggalKalender(item.tanggal),
      'Uraian / Judul': item.nama_kegiatan || "Tanpa Judul",
      'Deskripsi': item.keterangan || "-",
      'Link Dokumentasi': getImageUrl(item.gambar || item.dokumentasi)
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekapan");
    XLSX.writeFile(wb, `Laporan_${activeSubTab}_2026.xlsx`);
  };

  const exportPDF = async () => {
    if (currentData.length === 0) return Swal.fire('Kosong', 'Tidak ada data', 'info');
    Swal.fire({
      title: 'Menyiapkan PDF...',
      text: 'Sedang memuat gambar dokumen.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`LAPORAN KEGIATAN: ${activeSubTab}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);

    const tableData = [];
    const base64Images: (string | null)[] = [];

    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      const imgUrl = getImageUrl(item.gambar || item.dokumentasi);
      const base64Img = await getBase64ImageFromUrl(imgUrl);
      base64Images.push(base64Img);
      tableData.push([
        i + 1, 
        formatTanggalKalender(item.tanggal), 
        item.nama_kegiatan || "Tanpa Judul",
        item.keterangan || "-",
        '' 
      ]);
    }

    autoTable(doc, { 
      startY: 32, 
      head: [['No', 'Tanggal', 'Judul / Uraian', 'Deskripsi', 'Dokumentasi']], 
      body: tableData,
      headStyles: { fillColor: [0, 150, 136], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 60 },
        4: { cellWidth: 40 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
            data.cell.styles.minCellHeight = 30; 
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
           const base64Img = base64Images[data.row.index];
           if (base64Img && base64Img.startsWith('data:image')) {
              doc.addImage(base64Img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 36, 26);
           }
        }
      }
    });

    doc.save(`Laporan_${activeSubTab}.pdf`);
    Swal.close(); 
  };

  const forceDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dokumen_Rekapan_${new Date().getTime()}.jpg`;
      link.click();
    } catch (error) { 
      Swal.fire('Gagal', 'Tidak bisa mengunduh gambar', 'error');
    }
  };

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen flex flex-col">
      <main className="flex-1 p-8 lg:p-10 text-left relative overflow-y-auto">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest mb-3 shadow-sm">
              <Calendar size={12} /> Periode 2026
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-brand-dark uppercase tracking-tight">
              {activeSubTab}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold text-slate-500 transition-colors">
                <Download size={16} /> PDF
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-500 transition-colors">
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>

            <button 
              onClick={() => { setSelectedData(null); setIsModalOpen(true); }} 
              className="bg-brand-dark text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95"
            >
              <Plus size={18} /> Tambah Data
            </button>
          </div>
        </div>

        {/* === FILTER BARS (BULAN, URUTAN & LIMIT BARIS) === */}
        <div className="flex flex-wrap justify-end mb-6 gap-3">
          
          {/* Filter Bulan Baru */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
             <Filter size={14} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase">Bulan:</span>
             <select 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer" 
                value={selectedMonth} 
                onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
             >
                <option value="semua">Semua Bulan</option>
                <option value="0">Januari</option>
                <option value="1">Februari</option>
                <option value="2">Maret</option>
                <option value="3">April</option>
                <option value="4">Mei</option>
                <option value="5">Juni</option>
                <option value="6">Juli</option>
                <option value="7">Agustus</option>
                <option value="8">September</option>
                <option value="9">Oktober</option>
                <option value="10">November</option>
                <option value="11">Desember</option>
              </select>
          </div>

          {/* Filter Urutan */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
             <ArrowUpDown size={14} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase">Urutkan:</span>
             <select 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer" 
                value={sortOrder} 
                onChange={(e) => { setSortOrder(e.target.value as 'terbaru' | 'terlama'); setCurrentPage(1); }}
             >
                <option value="terbaru">Tgl Pelaksanaan (Terbaru)</option>
                <option value="terlama">Tgl Pelaksanaan (Terlama)</option>
              </select>
          </div>

          {/* Limit Baris */}
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

        {/* === DATA TABLE === */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-12 text-center">No</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-36">Tanggal</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Uraian / Judul</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[30%]">Deskripsi</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-48 text-center">Dokumentasi</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                        <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat Data...</p>
                     </td>
                   </tr>
                ) : currentItems.length > 0 ? currentItems.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      <td className="p-6 align-top text-center font-black text-slate-400 text-sm">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="p-6 align-top font-bold text-xs text-brand-dark leading-relaxed">
                        {formatTanggalKalender(item.tanggal)}
                      </td>
                      
                      <td className="p-6 align-top text-sm font-bold leading-relaxed text-slate-800">
                        {item.nama_kegiatan || "Tanpa Judul"}
                      </td>

                      <td className="p-6 align-top text-xs font-medium leading-relaxed text-slate-500 whitespace-pre-line">
                        {item.keterangan || <span className="italic opacity-50">Tanpa Deskripsi</span>}
                      </td>

                      <td className="p-6 align-top text-center">
                        <div 
                          onClick={() => setPreviewImage(getImageUrl(item.gambar || item.dokumentasi))} 
                          className="relative overflow-hidden rounded-2xl border border-slate-100 cursor-pointer group/img shadow-sm bg-slate-100 w-full h-24"
                        >
                            <img 
                               src={getImageUrl(item.gambar || item.dokumentasi)} 
                               className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                               alt="Dokumentasi" 
                               onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Error+Loading+Image"; }}
                            />
                            <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                               <Maximize2 className="text-white" size={24} />
                            </div>
                        </div>
                      </td>
                      
                      <td className="p-6 align-top">
                         <div className="flex flex-col gap-2">
                            <button onClick={() => { setSelectedData(item); setIsModalOpen(true); }} className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center border border-blue-100 shadow-sm"><Edit3 size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} className="w-full py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex justify-center border border-red-100 shadow-sm"><Trash2 size={14} /></button>
                         </div>
                      </td>
                    </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <Search className="mx-auto mb-4 text-slate-200" size={56} />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === PAGINATION === */}
        {currentData.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Halaman {currentPage} dari {totalPages || 1} — Total {currentData.length} Rekapan
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

      </main>

      <ModalRekapan 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchKegiatan} 
        data={selectedData} 
      />

      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-dark/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <button onClick={() => setPreviewImage(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all"><X size={40} /></button>
          <div className="max-w-4xl w-full flex flex-col items-center animate-in zoom-in duration-300">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-[2rem] shadow-2xl border border-white/10" />
            <button 
              onClick={() => forceDownloadImage(previewImage)} 
              className="mt-10 bg-brand-primary hover:bg-brand-dark text-white px-10 py-5 rounded-full font-black text-xs transition-all flex items-center gap-3 shadow-2xl active:scale-95"
            >
              <DownloadCloud size={20} /> UNDUH DOKUMEN FISIK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapanKegiatan;