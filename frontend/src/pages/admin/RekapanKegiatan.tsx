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
  Printer, 
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
import logoGarut from '../../assets/images/logo.png';
import logoGsd from '../../assets/images/logo-gsd.png';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const bulanLabels: Record<string, string> = {
  'semua': 'Semua Bulan',
  '0': 'Januari',
  '1': 'Februari',
  '2': 'Maret',
  '3': 'April',
  '4': 'Mei',
  '5': 'Juni',
  '6': 'Juli',
  '7': 'Agustus',
  '8': 'September',
  '9': 'Oktober',
  '10': 'November',
  '11': 'Desember'
};

const RekapanKegiatan: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // STATE UNTUK SLIDER GAMBAR MULTIPLE
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => { fetchKegiatan(); }, 0); 
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => { setCurrentPage(1); }, 0);
  }, [activeSubTab, selectedMonth]);

  // FUNGSI PEMBACA GAMBAR (SUPER KEBAL ERROR)
  const parseImages = (imageField: unknown): string[] => {
    if (!imageField) return [];

    let strData = imageField;

    if (Array.isArray(strData) && typeof strData[0] === 'string' && strData[0].startsWith('[')) {
      strData = strData[0];
    } else if (Array.isArray(strData)) {
      return strData;
    }

    if (typeof strData === 'string') {
      try {
        let parsed = JSON.parse(strData);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* ignore */ }

      const manualClean = (strData as string).replace(/[[\]"\\]/g, '').trim(); 
      if (manualClean.includes(',')) {
        return manualClean.split(',').map(s => s.trim()).filter(Boolean); 
      }
      return manualClean ? [manualClean] : [];
    }

    return [];
  };

  // FUNGSI PEMBENTUK URL YANG AMAN
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
        { header: 'Dokumentasi', key: 'dokumentasi', width: 35 } // Lebar kolom gambar
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
          deskripsi: item.keterangan || "-"
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
                    tl: { col: 4.1, row: i + 1 + (imgIndex * 0.9) }, 
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

  // ================= PRINT / EXPORT PDF DENGAN WINDOW.PRINT =================
  const handlePrint = () => {
    if (currentData.length === 0) {
      return Swal.fire('Kosong', 'Tidak ada data untuk dicetak', 'info');
    }
    window.print();
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

  // FUNGSI NAVIGASI SLIDER
  const nextImage = () => setCurrentPreviewIndex((prev) => (prev + 1) % previewImages.length);
  const prevImage = () => setCurrentPreviewIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen flex flex-col">
      
      {/* CSS Stylesheet Khusus Mode Cetak / Print PDF */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          header, nav, aside, button, .no-print, select, input, .swal2-container {
            display: none !important;
          }
          body, .flex-1, main, .min-h-screen {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            width: 100% !important;
          }
          .print-only {
            display: block !important;
          }
          .screen-only {
            display: none !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 1rem !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #1e293b !important;
            padding: 6px 8px !important;
            color: #0f172a !important;
            font-size: 9.5pt !important;
            vertical-align: top !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
          }
          .print-signatures {
            display: flex !important;
            justify-content: space-between !important;
            margin-top: 2.5rem !important;
            page-break-inside: avoid !important;
          }
          .signature-box {
            text-align: center !important;
            width: 240px !important;
          }
          .signature-space {
            height: 4.5rem !important;
          }
          .signature-line {
            border-top: 1px solid #0f172a !important;
            font-weight: bold !important;
            padding-top: 0.25rem !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}} />

      {/* ================= SECTION KHUSUS PRINT / CETAK FORMAL ================= */}
      <div className="print-only p-4">
        {/* Kop Surat Resmi */}
        <div className="flex items-center justify-between pb-2">
          <img src={logoGarut} alt="Logo Kab Garut" className="h-20 w-auto object-contain" />
          <div className="text-center flex-1 px-4">
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-800 leading-tight">Pemerintah Kabupaten Garut</h2>
            <h1 className="text-lg font-black tracking-wider uppercase text-slate-900 leading-tight">Dinas Komunikasi dan Informatika</h1>
            <p className="text-xs font-bold text-slate-700 mt-0.5">Bidang Penyelenggaraan Statistik Sektoral</p>
            <p className="text-[9pt] text-slate-600 leading-tight">Jl. Pembangunan No. 181, Sukagalih, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151</p>
            <p className="text-[8.5pt] text-slate-500 leading-tight">Portal: garutsatudata.garutkab.go.id | Email: diskominfo@garutkab.go.id</p>
          </div>
          <img src={logoGsd} alt="Logo Garut Satu Data" className="h-16 w-auto object-contain" />
        </div>
        
        {/* Garis Ganda Pembatas Kop Surat */}
        <div className="border-b-2 border-slate-900 mb-0.5"></div>
        <div className="border-b-[1px] border-slate-900 mb-5"></div>

        {/* Judul Laporan */}
        <div className="text-center mb-4">
          <h3 className="text-base font-black uppercase text-slate-900 tracking-wide underline underline-offset-4">
            Laporan Rekapitulasi Kegiatan: {activeSubTab}
          </h3>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Periode: {selectedMonth !== 'semua' ? bulanLabels[selectedMonth] : 'Semua Bulan'} 2026
          </p>
          <p className="text-[9pt] text-slate-500">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Total: {currentData.length} Rekapan Kegiatan
          </p>
        </div>

        {/* Tabel Rekapan Kegiatan Untuk Print */}
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '30px', textAlign: 'center' }}>No</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Tanggal</th>
              <th style={{ width: '160px' }}>Judul / Uraian</th>
              <th>Deskripsi & Lampiran</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Dokumentasi</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, idx) => {
                const images = parseImages(item.gambar || item.dokumentasi);
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center', fontSize: '9pt' }}>
                      {formatTanggalKalender(item.tanggal)}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {item.nama_kegiatan || 'Tanpa Judul'}
                    </td>
                    <td style={{ whiteSpace: 'pre-line' }}>
                      {item.keterangan || '-'}
                      {item.link_materi && (
                        <div style={{ marginTop: '4px', fontSize: '8.5pt', color: '#0369a1', fontStyle: 'italic' }}>
                          Lampiran: {item.link_materi}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {images.length > 0 ? (
                        <div className="flex flex-col gap-1 items-center justify-center">
                          {images.slice(0, 2).map((img, imgIdx) => (
                            <img 
                              key={imgIdx} 
                              src={getImageUrl(img)} 
                              alt="Dokumentasi" 
                              style={{ maxHeight: '65px', maxWidth: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                            />
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '8.5pt', color: '#94a3b8', fontStyle: 'italic' }}>Tanpa Foto</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '15px' }}>Tidak ada data kegiatan</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Kolom Tanda Tangan Formal */}
        <div className="print-signatures">
          <div className="signature-box">
            <p className="text-xs font-semibold text-slate-700">Mengetahui,</p>
            <p className="text-xs font-black text-slate-900 uppercase mt-0.5">Kepala Bidang PSS</p>
            <div className="signature-space"></div>
            <div className="signature-line">
              ( ............................................ )
            </div>
            <p className="text-[9pt] text-slate-600 mt-0.5">NIP. ............................................</p>
          </div>
          
          <div className="signature-box">
            <p className="text-xs font-semibold text-slate-700">Garut, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs font-black text-slate-900 uppercase mt-0.5">Pelaksana / Tenaga Ahli</p>
            <div className="signature-space"></div>
            <div className="signature-line">
              ( ............................................ )
            </div>
            <p className="text-[9pt] text-slate-600 mt-0.5">Bidang Statistik Sektoral</p>
          </div>
        </div>
      </div>

      {/* ================= SCREEN UI (NO-PRINT) ================= */}
      <main className="flex-1 p-8 lg:p-10 text-left relative overflow-y-auto screen-only">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 no-print">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest mb-3 shadow-sm">
              <Calendar size={12} /> Periode 2026
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-brand-dark uppercase tracking-tight">
              {activeSubTab}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 no-print">
            <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                title="Cetak Laporan / Simpan PDF"
              >
                <Printer size={16} /> Export PDF
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button 
                onClick={exportExcel} 
                className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>

            <button 
              onClick={() => { setSelectedData(null); setIsModalOpen(true); }} 
              className="bg-brand-dark text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-brand-primary transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <Plus size={18} /> Tambah Data
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-end mb-6 gap-3 no-print">
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

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-12 text-center">No</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-36">Tanggal</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Uraian / Judul</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[30%]">Deskripsi</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest w-32">Materi / Lampiran</th>
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
                            
                            {/* BADGE MULTIPLE IMAGES */}
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
                            <button onClick={() => { setSelectedData(item); setIsModalOpen(true); }} className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center border border-blue-100 shadow-sm cursor-pointer"><Edit3 size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} className="w-full py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex justify-center border border-red-100 shadow-sm cursor-pointer"><Trash2 size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  );
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
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center px-4 gap-4 no-print">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Halaman {currentPage} dari {totalPages || 1} — Total {currentData.length} Rekapan
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-brand-dark/95 p-4 backdrop-blur-xl animate-in fade-in duration-300 no-print">
          <button onClick={() => setPreviewImages([])} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-50 cursor-pointer">
            <X size={40} />
          </button>

          {previewImages.length > 1 && (
            <button onClick={prevImage} className="absolute left-4 lg:left-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-50 cursor-pointer">
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
              
              <div className="mt-4 bg-brand-dark/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-center">
                 <p className="text-white font-bold text-sm tracking-wider">
                   Gambar {currentPreviewIndex + 1} dari {previewImages.length}
                 </p>
                 <p className="text-emerald-400 font-mono text-[10px] mt-1 break-all">
                   Path: {previewImages[currentPreviewIndex]}
                 </p>
              </div>
            </div>

            {previewImages.length > 1 && (
              <div className="flex items-center gap-2 mt-6">
                {previewImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentPreviewIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentPreviewIndex ? 'w-8 bg-brand-primary' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}

            <button 
              onClick={() => forceDownloadImage(getImageUrl(previewImages[currentPreviewIndex]))} 
              className="mt-8 bg-brand-primary hover:bg-brand-dark text-white px-10 py-4 rounded-full font-black text-xs transition-all flex items-center gap-3 shadow-2xl active:scale-95 cursor-pointer"
            >
              <DownloadCloud size={20} /> UNDUH GAMBAR INI
            </button>
          </div>

          {previewImages.length > 1 && (
            <button onClick={nextImage} className="absolute right-4 lg:right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-50 cursor-pointer">
              <ChevronRight size={32} />
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default RekapanKegiatan;