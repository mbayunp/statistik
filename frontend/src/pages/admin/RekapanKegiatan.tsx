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
  Filter,
  Images,
  Link as LinkIcon
} from 'lucide-react';
import ModalRekapan from './ModalRekapan';
import { API_BASE_URL } from '../../config';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const RekapanKegiatan: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');
  const [selectedMonth, setSelectedMonth] = useState<string>('semua'); 

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
    setTimeout(() => { fetchKegiatan(); }, 0); 
  }, []);

  useEffect(() => {
    setTimeout(() => { setCurrentPage(1); }, 0);
  }, [activeSubTab, selectedMonth]);

  const parseImages = (imageField: unknown): string[] => {
    if (!imageField) return [];

    const strData = imageField;

    if (Array.isArray(strData)) {
      const flatList: string[] = [];
      for (const item of strData) {
        if (typeof item === 'string') {
          if (item.startsWith('[')) {
            flatList.push(...parseImages(item));
          } else {
            flatList.push(item);
          }
        } else if (Array.isArray(item)) {
          flatList.push(...parseImages(item));
        } else if (item) {
          flatList.push(String(item));
        }
      }
      return flatList;
    }

    if (typeof strData === 'string') {
      try {
        let parsed = JSON.parse(strData);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parseImages(parsed);
      } catch { /* ignore */ }

      const manualClean = (strData as string).replace(/[[\]"\\]/g, '').trim(); 
      if (manualClean.includes(',')) {
        return manualClean.split(',').map(s => s.trim()).filter(Boolean); 
      }
      return manualClean ? [manualClean] : [];
    }

    return [];
  };

  const getImageUrl = (path: string) => {
    if (!path) return "https://placehold.co/600x400?text=Tanpa+Gambar";
    if (path.startsWith('http')) return path;
    
    let cleanPath = path.replace(/[[\]"\\]/g, '').trim(); 
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
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
        } catch {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentData = kegiatan.filter((k: any) => k.kategori === activeSubTab);

  if (selectedMonth !== 'semua') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentData = currentData.filter((item: any) => {
      if (!item.tanggal) return false;
      const dateObj = new Date(item.tanggal);
      if (isNaN(dateObj.getTime())) return false;
      return dateObj.getMonth().toString() === selectedMonth;
    });
  }

  currentData = currentData.sort((a, b) => {
    const timeA = a.tanggal ? new Date(a.tanggal).getTime() : 0;
    const timeB = b.tanggal ? new Date(b.tanggal).getTime() : 0;
    return sortOrder === 'terbaru' ? timeB - timeA : timeA - timeB; 
  });

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
    } catch {
      return null;
    }
  };

  const exportExcel = async () => {
    if (currentData.length === 0) return Swal.fire('Kosong', 'Tidak ada data', 'info');
    
    Swal.fire({
      title: 'Menyiapkan Excel...',
      text: 'Sedang memuat gambar ke dalam baris, mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekapan');

      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal Pelaksanaan', key: 'tanggal', width: 25 },
        { header: 'Uraian / Judul', key: 'judul', width: 35 },
        { header: 'Deskripsi', key: 'deskripsi', width: 45 },
        { header: 'Link Materi', key: 'link', width: 40 }, // FIELD BARU
        { header: 'Dokumentasi', key: 'dokumentasi', width: 35 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009688' } };
      worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

      for (let i = 0; i < currentData.length; i++) {
        const item = currentData[i];
        
        const row = worksheet.addRow({
          no: i + 1,
          tanggal: formatTanggalKalender(item.tanggal),
          judul: item.nama_kegiatan || "Tanpa Judul",
          deskripsi: item.keterangan || "-",
          link: item.link_materi || "-" // FIELD BARU
        });
        row.alignment = { vertical: 'top', wrapText: true };

        const images = parseImages(item.gambar || item.dokumentasi);
        
        if (images.length > 0) {
           const maxImages = Math.min(images.length, 3);
           row.height = maxImages * 90; 

           for (let imgIndex = 0; imgIndex < maxImages; imgIndex++) {
              const base64Img = await getBase64ImageFromUrl(getImageUrl(images[imgIndex]));
              
              if (base64Img) {
                 const imageId = workbook.addImage({
                    base64: base64Img,
                    extension: 'jpeg',
                 });

                 worksheet.addImage(imageId, {
                    tl: { col: 5.1, row: i + 1 + (imgIndex * 0.9) }, // Geser kolom untuk gambar karena ada link
                    ext: { width: 140, height: 80 }
                 });
              }
           }
        } else {
           row.getCell('dokumentasi').value = 'Tanpa Gambar';
           row.getCell('dokumentasi').alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Laporan_${activeSubTab}_2026.xlsx`);
      Swal.close();

    } catch (error) {
      console.error(error);
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses file Excel.', 'error');
    }
  };

  const exportPDF = async () => {
    if (currentData.length === 0) return Swal.fire('Kosong', 'Tidak ada data', 'info');
    
    Swal.fire({
      title: 'Menyiapkan PDF...',
      text: 'Sedang menyusun gambar dokumen.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`LAPORAN KEGIATAN: ${activeSubTab}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);

    const tableData = [];
    const allRowImages: string[][] = [];

    for (let i = 0; i < currentData.length; i++) {
      const item = currentData[i];
      const images = parseImages(item.gambar || item.dokumentasi);
      
      const rowBase64s: string[] = [];
      for (const img of images.slice(0, 3)) {
         const base64Img = await getBase64ImageFromUrl(getImageUrl(img));
         if (base64Img) rowBase64s.push(base64Img);
      }
      allRowImages.push(rowBase64s);
      
      // Menggabungkan keterangan dan link ke dalam satu sel di PDF agar tidak penuh
      let deskripsiPDF = item.keterangan || "-";
      if (item.link_materi) deskripsiPDF += `\n\nLampiran: ${item.link_materi}`;

      tableData.push([
        i + 1, 
        formatTanggalKalender(item.tanggal), 
        item.nama_kegiatan || "Tanpa Judul",
        deskripsiPDF,
        '' 
      ]);
    }

    autoTable(doc, { 
      startY: 32, 
      head: [['No', 'Tanggal', 'Judul / Uraian', 'Deskripsi & Link', 'Dokumentasi']], 
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
            const rowImgs = allRowImages[data.row.index] || [];
            data.cell.styles.minCellHeight = rowImgs.length > 0 ? (rowImgs.length * 30) + 4 : 30; 
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
           const rowImgs = allRowImages[data.row.index] || [];
           let currentY = data.cell.y + 2; 
           
           for (const base64Img of rowImgs) {
              if (base64Img && base64Img.startsWith('data:image')) {
                 doc.addImage(base64Img, 'JPEG', data.cell.x + 2, currentY, 36, 26);
                 currentY += 30;
              }
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
    } catch { 
      Swal.fire('Gagal', 'Tidak bisa mengunduh gambar', 'error');
    }
  };

  const nextImage = () => setCurrentPreviewIndex((prev) => (prev + 1) % previewImages.length);
  const prevImage = () => setCurrentPreviewIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);

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

        <div className="flex flex-wrap justify-end mb-6 gap-3">
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

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-12 text-center">No</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-36">Tanggal</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Uraian / Judul</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[30%]">Deskripsi</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-32">Materi / Lampiran</th> {/* KOLOM BARU */}
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-48 text-center">Dokumentasi</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={7} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-brand-primary" size={40} />
                        <p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Memuat Data...</p>
                     </td>
                   </tr>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ) : currentItems.length > 0 ? currentItems.map((item: any, index: number) => {
                  
                  const images = parseImages(item.gambar || item.dokumentasi);
                  const displayImageUrl = images.length > 0 ? getImageUrl(images[0]) : "https://placehold.co/600x400?text=Tanpa+Gambar";

                  return (
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

                      {/* KOLOM LINK MATERI */}
                      <td className="p-6 align-top">
                        {item.link_materi ? (
                          <a 
                            href={item.link_materi} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all w-fit uppercase tracking-widest"
                          >
                            <LinkIcon size={12} /> Buka Link
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Tidak ada</span>
                        )}
                      </td>

                      <td className="p-6 align-top text-center">
                        <div 
                          onClick={() => {
                            if (images.length > 0) {
                              setPreviewImages(images);
                              setCurrentPreviewIndex(0);
                            }
                          }} 
                          className={`relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-slate-100 w-full h-24 ${images.length > 0 ? 'cursor-pointer group/img' : ''}`}
                        >
                            <img 
                               src={displayImageUrl} 
                               className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                               alt="Dokumentasi" 
                               onError={(e) => { e.currentTarget.src = "https://placehold.co/400x300?text=Error+Loading+Image"; }}
                            />
                            
                            {images.length > 1 && (
                              <div className="absolute top-2 right-2 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/20 shadow-lg flex items-center gap-1 z-10">
                                <Images size={12} /> +{images.length - 1}
                              </div>
                            )}

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
                  )
                }) : (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                       <Search className="mx-auto mb-4 text-slate-200" size={56} />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
        data={selectedData || undefined} 
      />

      {/* MODAL SLIDER GALLERY */}
      {previewImages.length > 0 && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-brand-dark/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <button onClick={() => setPreviewImages([])} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-50">
            <X size={40} />
          </button>

          {previewImages.length > 1 && (
            <button onClick={prevImage} className="absolute left-4 lg:left-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-50">
              <ChevronLeft size={32} />
            </button>
          )}
          <div className="max-w-5xl w-full flex flex-col items-center relative overflow-hidden px-12">
            <div key={currentPreviewIndex} className="animate-in fade-in zoom-in-95 duration-300 w-full flex flex-col items-center justify-center">
              <img 
                src={getImageUrl(previewImages[currentPreviewIndex])} 
                alt={`Preview ${currentPreviewIndex + 1}`} 
                className="max-w-full max-h-[65vh] object-contain rounded-4xl shadow-2xl border border-white/10" 
              />
              
              {/* === INDIKATOR NAMA FILE UNTUK DEBUGGING === */}
              <div className="mt-4 bg-brand-dark/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-center">
                 <p className="text-white font-bold text-sm tracking-wider">
                   Gambar {currentPreviewIndex + 1} dari {previewImages.length}
                 </p>
                 <p className="text-emerald-400 font-mono text-[10px] mt-1 break-all">
                   Path Asli: {previewImages[currentPreviewIndex]}
                 </p>
              </div>
            </div>

            {previewImages.length > 1 && (
              <div className="flex items-center gap-2 mt-6">
                {previewImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentPreviewIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentPreviewIndex ? 'w-8 bg-brand-primary' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}

            <button 
              onClick={() => forceDownloadImage(getImageUrl(previewImages[currentPreviewIndex]))} 
              className="mt-8 bg-brand-primary hover:bg-brand-dark text-white px-10 py-4 rounded-full font-black text-xs transition-all flex items-center gap-3 shadow-2xl active:scale-95"
            >
              <DownloadCloud size={20} /> UNDUH GAMBAR INI
            </button>
          </div>

          {previewImages.length > 1 && (
            <button onClick={nextImage} className="absolute right-4 lg:right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-50">
              <ChevronRight size={32} />
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default RekapanKegiatan;