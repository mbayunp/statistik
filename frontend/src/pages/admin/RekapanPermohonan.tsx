import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Database, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Inbox,
  Loader2
} from 'lucide-react';

const RekapanPermohonan: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Pagination
  const [filterTahun, setFilterTahun] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Menarik data langsung dari API Garut Satu Data
    const res = await axios.get('/api-garut/api/request-data/total');
    setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat data dari server API', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logika
  const filteredData = data.filter(d => {
    let matchTahun = filterTahun === '' || d.tahun.toString() === filterTahun;
    let matchBulan = filterBulan === '' || d.bulan.toLowerCase() === filterBulan.toLowerCase();
    return matchTahun && matchBulan;
  });

  // Pagination Logika
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Dapatkan daftar tahun unik untuk dropdown
  const uniqueYears = Array.from(new Set(data.map(d => d.tahun))).sort((a: any, b: any) => b - a);

  // Hitung Total dari data yang difilter
  const totalSelesai = filteredData.reduce((sum, item) => sum + item.jumlah_selesai, 0);
  const totalDitolak = filteredData.reduce((sum, item) => sum + item.jumlah_ditolak, 0);
  const totalDiproses = filteredData.reduce((sum, item) => sum + item.jumlah_diproses, 0);
  const totalPengajuan = filteredData.reduce((sum, item) => sum + item.dalam_pengajuan, 0);
  const grandTotal = totalSelesai + totalDitolak + totalDiproses + totalPengajuan;

  // ================= EXPORT EXCEL =================
  const handleExportExcel = () => {
    if (filteredData.length === 0) return Swal.fire('Peringatan', 'Tidak ada data untuk diekspor!', 'warning');
    
    const excelData = filteredData.map((item, index) => ({
      'No': index + 1,
      'Tahun': item.tahun,
      'Bulan': item.bulan,
      'Dalam Pengajuan': item.dalam_pengajuan,
      'Diproses': item.jumlah_diproses,
      'Ditolak': item.jumlah_ditolak,
      'Selesai': item.jumlah_selesai,
      'Total Request': item.dalam_pengajuan + item.jumlah_diproses + item.jumlah_ditolak + item.jumlah_selesai
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapan Permohonan");
    XLSX.writeFile(workbook, `Rekapan_Permohonan_Data_${filterTahun || 'Semua'}.xlsx`);
  };

  // ================= EXPORT PDF =================
  const handleExportPDF = () => {
    if (filteredData.length === 0) return Swal.fire('Peringatan', 'Tidak ada data untuk diekspor!', 'warning');
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`REKAPAN PERMOHONAN DATA KAB. GARUT`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${filterBulan || 'Semua Bulan'} ${filterTahun || 'Semua Tahun'}`, 14, 26);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 32);

    const tableData = filteredData.map((item, i) => [
      i + 1,
      item.tahun,
      item.bulan,
      item.dalam_pengajuan,
      item.jumlah_diproses,
      item.jumlah_ditolak,
      item.jumlah_selesai,
      item.dalam_pengajuan + item.jumlah_diproses + item.jumlah_ditolak + item.jumlah_selesai
    ]);

    autoTable(doc, {
      startY: 38,
      head: [['No', 'Tahun', 'Bulan', 'Pengajuan', 'Diproses', 'Ditolak', 'Selesai', 'Total']],
      body: tableData,
      headStyles: { fillColor: [15, 23, 42], halign: 'center' }, // brand-dark
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center', fontStyle: 'bold' }
      }
    });

    doc.save(`Rekapan_Permohonan_Data_${filterTahun || 'Semua'}.pdf`);
  };

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Database size={36} className="text-brand-primary" /> Rekapan Permohonan
          </h1>
          <p className="text-slate-500 font-medium mt-1">Laporan rekapitulasi data dari Portal Satu Data Garut.</p>
        </div>
        
        {/* TOMBOL EXPORT */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
           <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-3 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold text-slate-500 transition-colors">
             <Download size={16} /> PDF
           </button>
           <div className="w-px h-8 bg-slate-200 mx-1 my-auto"></div>
           <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-500 transition-colors">
             <FileSpreadsheet size={16} /> Excel
           </button>
        </div>
      </div>

      {/* FILTER & STATISTIK CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Kolom Filter */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-center gap-4">
           <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
             <Filter size={16} /> Filter Data
           </div>
           <div className="flex gap-3">
              <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                <select className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer" value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}>
                  <option value="">Semua Tahun</option>
                  {uniqueYears.map(yr => <option key={yr as string} value={yr as string}>{yr}</option>)}
                </select>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                <select className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer" value={filterBulan} onChange={(e) => { setFilterBulan(e.target.value); setCurrentPage(1); }}>
                  <option value="">Semua Bulan</option>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(bln => (
                    <option key={bln} value={bln}>{bln}</option>
                  ))}
                </select>
              </div>
           </div>
        </div>

        {/* Kolom Summary Statistik */}
        <div className="lg:col-span-2 bg-brand-dark p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
           <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2">Total Akumulasi</p>
                <div className="text-3xl font-black">{grandTotal} <span className="text-sm font-medium text-slate-400 normal-case">Permohonan</span></div>
              </div>
              <div className="flex gap-4 sm:gap-8 text-right">
                 <div>
                   <div className="text-xs font-bold text-slate-400 mb-1">Selesai</div>
                   <div className="text-xl font-black text-emerald-400">{totalSelesai}</div>
                 </div>
                 <div>
                   <div className="text-xs font-bold text-slate-400 mb-1">Diproses</div>
                   <div className="text-xl font-black text-amber-400">{totalDiproses}</div>
                 </div>
                 <div>
                   <div className="text-xs font-bold text-slate-400 mb-1">Ditolak</div>
                   <div className="text-xl font-black text-red-400">{totalDitolak}</div>
                 </div>
              </div>
           </div>
           {/* Hiasan background */}
           <Database size={120} className="absolute -right-6 -bottom-6 text-white opacity-5" />
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-6 text-center w-16">No</th>
                <th className="p-6">Periode</th>
                <th className="p-6 text-center">Pengajuan</th>
                <th className="p-6 text-center">Diproses</th>
                <th className="p-6 text-center">Ditolak</th>
                <th className="p-6 text-center text-emerald-600">Selesai</th>
                <th className="p-6 text-center text-brand-dark bg-slate-100/50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-primary" size={40} /><p className="mt-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Menghubungkan ke API...</p></td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const barisTotal = item.dalam_pengajuan + item.jumlah_diproses + item.jumlah_ditolak + item.jumlah_selesai;
                  return (
                    <tr key={index} className="hover:bg-slate-50/80 group transition-colors">
                      <td className="p-6 text-center font-bold text-slate-400">{indexOfFirstItem + index + 1}</td>
                      <td className="p-6">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                           <Calendar size={14} className="text-brand-primary" /> {item.bulan} {item.tahun}
                        </div>
                      </td>
                      <td className="p-6 text-center font-bold text-slate-500">{item.dalam_pengajuan}</td>
                      <td className="p-6 text-center font-bold text-amber-500">{item.jumlah_diproses}</td>
                      <td className="p-6 text-center font-bold text-red-500">{item.jumlah_ditolak}</td>
                      <td className="p-6 text-center font-black text-emerald-500 text-lg">{item.jumlah_selesai}</td>
                      <td className="p-6 text-center font-black text-brand-dark bg-slate-50/50">{barisTotal}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="p-20 text-center"><Inbox size={48} className="mx-auto text-slate-200 mb-4"/><p className="font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Rekapan Data</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Menampilkan halaman {currentPage} dari {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50"><ChevronRight size={16}/></button>
          </div>
      </div>

    </div>
  );
};

export default RekapanPermohonan;