import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { 
  Database, 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Inbox,
  Loader2
} from 'lucide-react';
import logoGarut from '../../assets/images/logo.png';
import logoGsd from '../../assets/images/logo-gsd.png';
import { API_BASE_URL } from '../../config';

const RekapanPermohonan: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Pagination
  const [filterTahun, setFilterTahun] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchData = async () => {
    try {
      setLoading(true);
      // Menarik data langsung dari API Garut Satu Data (Prioritas backend internal -> proxy nginx -> direct)
      const res = await axios.get(`${API_BASE_URL}/api/satudata/request-data/total`)
        .catch(() => axios.get('/api-garut/api/request-data/total'))
        .catch(() => axios.get('https://satudata-api.garutkab.go.id/api/request-data/total'));
      setData(res.data?.data || res.data || []);
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
    const matchTahun = filterTahun === '' || d.tahun.toString() === filterTahun;
    const matchBulan = filterBulan === '' || d.bulan.toLowerCase() === filterBulan.toLowerCase();
    return matchTahun && matchBulan;
  });

  // Pagination Logika
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Dapatkan daftar tahun unik untuk dropdown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueYears = Array.from(new Set(data.map(d => d.tahun))).sort((a: any, b: any) => b - a);

  // Hitung Total dari data yang difilter
  const totalSelesai = filteredData.reduce((sum, item) => sum + (item.jumlah_selesai || 0), 0);
  const totalDitolak = filteredData.reduce((sum, item) => sum + (item.jumlah_ditolak || 0), 0);
  const totalDiproses = filteredData.reduce((sum, item) => sum + (item.jumlah_diproses || 0), 0);
  const totalPengajuan = filteredData.reduce((sum, item) => sum + (item.dalam_pengajuan || 0), 0);
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

  // ================= EXPORT / PRINT PDF =================
  const handlePrint = () => {
    if (filteredData.length === 0) {
      return Swal.fire('Peringatan', 'Tidak ada data untuk dicetak!', 'warning');
    }
    window.print();
  };

  return (
    <div className="p-8 lg:p-10 bg-slate-50 min-h-screen text-left">
      
      {/* CSS Stylesheet Khusus Mode Print / Cetak PDF */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          header, nav, aside, button, .no-print, select, input, .swal2-container {
            display: none !important;
          }
          body, .min-h-screen, .p-8, .lg\\:p-10, main, .flex-1 {
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
            font-size: 10pt !important;
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
      <div className="print-only">
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
            Laporan Rekapitulasi Permohonan Data
          </h3>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Periode: {filterBulan || 'Semua Bulan'} {filterTahun || 'Semua Tahun'}
          </p>
          <p className="text-[9pt] text-slate-500">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Ringkasan Rekapitulasi Angka */}
        <div className="grid grid-cols-5 border border-slate-700 text-center py-2 mb-3 text-xs font-bold bg-slate-50">
          <div>Pengajuan: <span className="font-extrabold">{totalPengajuan}</span></div>
          <div>Diproses: <span className="font-extrabold">{totalDiproses}</span></div>
          <div>Ditolak: <span className="font-extrabold">{totalDitolak}</span></div>
          <div>Selesai: <span className="font-extrabold">{totalSelesai}</span></div>
          <div>Total Permohonan: <span className="font-extrabold">{grandTotal}</span></div>
        </div>

        {/* Tabel Rekapan Lengkap Untuk Print */}
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '35px', textAlign: 'center' }}>No</th>
              <th style={{ textAlign: 'center' }}>Tahun</th>
              <th>Bulan</th>
              <th style={{ textAlign: 'center' }}>Pengajuan</th>
              <th style={{ textAlign: 'center' }}>Diproses</th>
              <th style={{ textAlign: 'center' }}>Ditolak</th>
              <th style={{ textAlign: 'center' }}>Selesai</th>
              <th style={{ textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const rowTotal = (item.dalam_pengajuan || 0) + (item.jumlah_diproses || 0) + (item.jumlah_ditolak || 0) + (item.jumlah_selesai || 0);
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>{item.tahun}</td>
                    <td style={{ fontWeight: 600 }}>{item.bulan}</td>
                    <td style={{ textAlign: 'center' }}>{item.dalam_pengajuan}</td>
                    <td style={{ textAlign: 'center' }}>{item.jumlah_diproses}</td>
                    <td style={{ textAlign: 'center' }}>{item.jumlah_ditolak}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.jumlah_selesai}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{rowTotal}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '15px' }}>Tidak ada data permohonan</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
              <td colSpan={3} style={{ textAlign: 'center', textTransform: 'uppercase' }}>Total Keseluruhan</td>
              <td style={{ textAlign: 'center' }}>{totalPengajuan}</td>
              <td style={{ textAlign: 'center' }}>{totalDiproses}</td>
              <td style={{ textAlign: 'center' }}>{totalDitolak}</td>
              <td style={{ textAlign: 'center' }}>{totalSelesai}</td>
              <td style={{ textAlign: 'center' }}>{grandTotal}</td>
            </tr>
          </tfoot>
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
            <p className="text-xs font-black text-slate-900 uppercase mt-0.5">Pengelola Satu Data Garut</p>
            <div className="signature-space"></div>
            <div className="signature-line">
              ( ............................................ )
            </div>
            <p className="text-[9pt] text-slate-600 mt-0.5">Diskominfo Kabupaten Garut</p>
          </div>
        </div>
      </div>

      {/* ================= SCREEN UI (NO-PRINT) ================= */}
      <div className="screen-only">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 no-print">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Database size={36} className="text-brand-primary" /> Rekapan Permohonan
            </h1>
            <p className="text-slate-500 font-medium mt-1">Laporan rekapitulasi data dari Portal Satu Data Garut.</p>
          </div>
          
          {/* TOMBOL EXPORT */}
          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 no-print">
             <button 
               onClick={handlePrint} 
               className="flex items-center gap-2 px-5 py-3 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
               title="Cetak Laporan / Simpan PDF"
             >
               <Printer size={16} /> Export PDF
             </button>
             <div className="w-px h-8 bg-slate-200 mx-1 my-auto"></div>
             <button 
               onClick={handleExportExcel} 
               className="flex items-center gap-2 px-5 py-3 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
             >
               <FileSpreadsheet size={16} /> Excel
             </button>
          </div>
        </div>

        {/* FILTER & STATISTIK CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 no-print">
          {/* Kolom Filter */}
          <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 flex flex-col justify-center gap-4">
             <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
               <Filter size={16} /> Filter Data
             </div>
             <div className="flex gap-3">
                <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <select 
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer" 
                    value={filterTahun} 
                    onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Semua Tahun</option>
                    {uniqueYears.map(yr => <option key={yr as string} value={yr as string}>{yr}</option>)}
                  </select>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <select 
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 cursor-pointer" 
                    value={filterBulan} 
                    onChange={(e) => { setFilterBulan(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Semua Bulan</option>
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(bln => (
                      <option key={bln} value={bln}>{bln}</option>
                    ))}
                  </select>
                </div>
             </div>
          </div>

          {/* Kolom Summary Statistik */}
          <div className="lg:col-span-2 bg-brand-dark p-6 rounded-4xl shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
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

        {/* TABEL DATA SCREEN */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative z-10 no-print">
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
                    const barisTotal = (item.dalam_pengajuan || 0) + (item.jumlah_diproses || 0) + (item.jumlah_ditolak || 0) + (item.jumlah_selesai || 0);
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

        {/* PAGINATION SCREEN */}
        <div className="mt-6 flex justify-between items-center px-4 no-print">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan halaman {currentPage} dari {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 cursor-pointer"><ChevronLeft size={16}/></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm hover:bg-slate-50 cursor-pointer"><ChevronRight size={16}/></button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default RekapanPermohonan;