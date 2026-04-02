import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { 
  Plus, Edit, Trash2, Check, X, Search, 
  ChevronLeft, ChevronRight,
  FileText, ClipboardCheck, BarChart3, Globe, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

// Daftar Instansi Produsen Data Kabupaten Garut
const DAFTAR_PRODUSEN = [
    "Badan Kesatuan Bangsa dan Politik",
    "Badan Penanggulangan Bencana Daerah",
    "Badan Pendapatan Daerah",
    "Badan Pengelolaan Keuangan dan Aset Daerah",
    "Badan Perencanaan Pembangunan Daerah",
    "Dinas Kependudukan dan Pencatatan Sipil",
    "Dinas Kesehatan",
    "Dinas Ketahanan Pangan",
    "Dinas Komunikasi dan Informatika",
    "Dinas Koperasi dan UKM",
    "Dinas Lingkungan Hidup",
    "Dinas Pariwisata dan Kebudayaan",
    "Dinas Pekerjaan Umum dan Penataan Ruang",
    "Dinas Pemadam Kebakaran",
    "Dinas Pemberdayaan Masyarakat dan Desa",
    "Dinas Pemuda dan Olahraga",
    "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
    "Dinas Pendidikan",
    "Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak",
    "Dinas Perhubungan",
    "Dinas Perikanan dan Peternakan",
    "Dinas Perindustrian, Perdagangan, Energi dan Sumber Daya Mineral",
    "Dinas Perpustakaan dan Kearsipan",
    "Dinas Pertanian",
    "Dinas Perumahan dan Permukiman",
    "Dinas Sosial",
    "Dinas Tenaga Kerja dan Transmigrasi",
    "Inspektorat Daerah",
    "Satuan Polisi Pamong Praja",
    "Sekretariat Daerah",
    "Sekretariat Dewan Perwakilan Rakyat Daerah"
];

const DaftarStatistikAdmin: React.FC = () => {
    // === STATE UTAMA ===
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // === STATE PAGINATION ===
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // === STATE MODAL ===
    const [showModal, setShowModal] = useState(false);       // Modal Edit/Tambah
    const [showDetail, setShowDetail] = useState(false);     // Modal Detail Landscape
    const [activeTab, setActiveTab] = useState('umum');      // Tab aktif di form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedItem, setSelectedItem] = useState<any>(null); // Data untuk modal detail

    // State Form Lengkap (29 Kolom)
    const initialFormState = {
        id: null,
        nama_kegiatan: '',
        tahun: new Date().getFullYear(),
        cara_pengumpulan_data: '',
        ada_dokumen_perencanaan: 0,
        jenis_dokumen_perencanaan: '',
        sudah_meminta_rekomendasi: 0,
        sudah_mendapat_rekomendasi: 0,
        nomor_identitas_rekomendasi: '',
        produsen_data: '',
        ada_metadata_kegiatan: 0,
        input_ms_keg_ke_indah: 0,
        jumlah_variabel: 0,
        jumlah_indikator: 0,
        ada_metadata_variabel: 0,
        jumlah_metadata_variabel: 0,
        input_ms_var_ke_indah: 0,
        jumlah_ms_var_terinput: 0,
        ada_metadata_indikator: 0,
        jumlah_metadata_indikator: 0,
        input_ms_ind_ke_indah: 0,
        jumlah_ms_ind_terinput: 0,
        memenuhi_standar_data: 0,
        memenuhi_kode_referensi: 0,
        jadwal_rilis: '',
        rilis_tepat_waktu: 0,
        jenis_diseminasi: '',
        link_diseminasi: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // === FETCH DATA ===
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/statistik-sektoral`);
            setData(res.data.data || []);
        } catch (error) { 
            console.error(error); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // === HANDLER INPUT ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    };

    // === LOGIKA CRUD ===
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`${API_BASE_URL}/api/statistik-sektoral/${formData.id}`, formData);
            } else {
                await axios.post(`${API_BASE_URL}/api/statistik-sektoral`, formData);
            }
            Swal.fire({ icon: 'success', title: 'Berhasil Disimpan', timer: 1500, showConfirmButton: false });
            setShowModal(false);
            fetchData();
        } catch { 
            Swal.fire('Error', 'Gagal menyimpan data', 'error'); 
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus data ini?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/statistik-sektoral/${id}`);
                    Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                    fetchData();
                } catch { Swal.fire('Error', 'Gagal menghapus data.', 'error'); }
            }
        });
    };

    // === LOGIKA FILTER & PAGINATION ===
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredData = data.filter((item: any) =>
        item.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produsen_data?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // === HELPER KOMPONEN DETAIL ROW ===
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DetailItem = ({ label, value, isBadge = false }: any) => {
        // Logika warna khusus untuk Cara Pengumpulan Data
        const getCaraPengumpulanColor = (val: string) => {
            switch(val) {
                case 'Kompilasi Data': return 'bg-emerald-600 text-white';
                case 'Survei': return 'bg-blue-600 text-white';
                case 'Pendataan Lengkap': return 'bg-red-700 text-white';
                case 'Teknologi Informasi': return 'bg-purple-700 text-white';
                default: return 'bg-slate-100 text-slate-700';
            }
        };

        return (
            <div className="flex flex-col border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">{label}</span>
                {isBadge ? (
                    <div className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold ${value ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {value ? 'TERSEDIA / YA' : 'TIDAK / BELUM'}
                    </div>
                ) : label === "Cara Pengumpulan" && value ? (
                    <div className={`w-fit px-3 py-1 rounded-lg text-[10px] font-bold ${getCaraPengumpulanColor(value)}`}>
                        {value}
                    </div>
                ) : (
                    <span className="text-sm font-bold text-slate-700 wrap-break-word">{value || '-'}</span>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Admin Statistik</h1>
                    <p className="text-sm text-slate-500 font-medium">Pengelolaan 29 Kolom Data Sektoral</p>
                </div>
                <button 
                    onClick={() => { setFormData(initialFormState); setActiveTab('umum'); setShowModal(true); }}
                    className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform"
                >
                    <Plus size={18} /> Tambah Data Baru
                </button>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
                    <Search size={18} className="text-slate-400" />
                    <input 
                        type="text" placeholder="Cari nama kegiatan atau instansi..." 
                        className="bg-transparent border-none focus:ring-0 text-sm w-full font-bold outline-none"
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Tampilkan:</span>
                    <select 
                        className="bg-white border border-slate-200 rounded-xl text-xs font-bold p-2 outline-none shadow-sm cursor-pointer"
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                        <option value={10}>10 Baris</option>
                        <option value={50}>50 Baris</option>
                        <option value={100}>100 Baris</option>
                    </select>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-6 sticky left-0 bg-slate-50 z-10 w-8 text-center">No</th>
                                <th className="px-6 py-6 sticky left-16 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Nama Kegiatan</th>
                                <th className="px-6 py-6 text-center">Tahun</th>
                                <th className="px-6 py-6">Produsen Data</th>
                                <th className="px-6 py-6 text-center">Status Rekomendasi</th>
                                <th className="px-6 py-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold animate-pulse">Memuat data...</td></tr>
                            ) : currentItems.length > 0 ? (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                currentItems.map((item: any, index: number) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 group transition-all">
                                        <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-center font-bold text-slate-300">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-6 py-5 sticky left-16 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            <div 
                                                className="font-bold text-slate-700 text-xs leading-relaxed w-64 md:w-80 whitespace-normal line-clamp-3" 
                                                title={item.nama_kegiatan}
                                            >
                                                {item.nama_kegiatan}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">{item.tahun}</td>
                                        <td className="px-6 py-5 text-slate-500 text-sm">{item.produsen_data}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                {item.sudah_mendapat_rekomendasi ? 
                                                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Check size={12}/> Diterima</span> : 
                                                    <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Proses</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => { setSelectedItem(item); setShowDetail(true); }} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-colors" title="Lihat Detail Full"><Eye size={18}/></button>
                                                <button onClick={() => { setFormData(item); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-400 font-medium">Tidak ada data ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            <div className="mt-6 flex justify-between items-center px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Halaman {currentPage} dari {totalPages || 1} — Total {filteredData.length} Data
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronLeft size={18}/></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 shadow-sm"><ChevronRight size={18}/></button>
                </div>
            </div>

            {/* MODAL 1: DETAIL LANDSCAPE (READ ONLY) */}
            {showDetail && selectedItem && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-6xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Detail Lengkap Kegiatan</h2>
                                <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest">ID Kegiatan: STAT-{selectedItem.id}</p>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-4 bg-slate-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
                        </div>

                        {/* GRID LANDSCAPE 3 KOLOM */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 h-full">
                                <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FileText size={18}/> Informasi Identitas</h3>
                                <div className="space-y-4">
                                    <DetailItem label="Nama Kegiatan" value={selectedItem.nama_kegiatan} />
                                    <DetailItem label="Tahun" value={selectedItem.tahun} />
                                    <DetailItem label="Produsen Data" value={selectedItem.produsen_data} />
                                    <DetailItem label="Cara Pengumpulan" value={selectedItem.cara_pengumpulan_data} />
                                    <DetailItem label="Dokumen Perencanaan" value={selectedItem.ada_dokumen_perencanaan} isBadge />
                                    <DetailItem label="Jenis Dokumen" value={selectedItem.jenis_dokumen_perencanaan} />
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 h-full">
                                <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><ClipboardCheck size={18}/> Rekomendasi & Metadata</h3>
                                <div className="space-y-4">
                                    <DetailItem label="Sudah Meminta Rekom" value={selectedItem.sudah_meminta_rekomendasi} isBadge />
                                    <DetailItem label="Sudah Mendapat Rekom" value={selectedItem.sudah_mendapat_rekomendasi} isBadge />
                                    <DetailItem label="Nomor Rekomendasi" value={selectedItem.nomor_identitas_rekomendasi} />
                                    <DetailItem label="Metadata Kegiatan" value={selectedItem.ada_metadata_kegiatan} isBadge />
                                    <DetailItem label="Metadata Variabel" value={selectedItem.ada_metadata_variabel} isBadge />
                                    <DetailItem label="Metadata Indikator" value={selectedItem.ada_metadata_indikator} isBadge />
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 h-full">
                                <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><BarChart3 size={18}/> Teknis & Diseminasi</h3>
                                <div className="space-y-4">
                                    <DetailItem label="Jumlah Variabel" value={selectedItem.jumlah_variabel} />
                                    <DetailItem label="Jumlah Indikator" value={selectedItem.jumlah_indikator} />
                                    <DetailItem label="Standar Data" value={selectedItem.memenuhi_standar_data} isBadge />
                                    <DetailItem label="Jadwal Rilis" value={selectedItem.jadwal_rilis} />
                                    <DetailItem label="Jenis Diseminasi" value={selectedItem.jenis_diseminasi} />
                                    <DetailItem label="Link Data" value={selectedItem.link_diseminasi} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => { setShowDetail(false); setFormData(selectedItem); setShowModal(true); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-blue-700">
                                <Edit size={18}/> Edit Data Ini
                            </button>
                            <button onClick={() => setShowDetail(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase hover:bg-slate-200">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: FORM INPUT TABS (CREATE / UPDATE) */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row h-[80vh]">
                            
                            {/* Sidebar Tab Form */}
                            <div className="w-full md:w-64 bg-slate-50 p-8 border-r border-slate-100">
                                <h2 className="font-black text-slate-800 uppercase text-lg mb-8 tracking-tighter">Input Data</h2>
                                <nav className="space-y-2">
                                    {[
                                        { id: 'umum', label: 'Umum', icon: <FileText size={18}/> },
                                        { id: 'rekom', label: 'Rekomendasi', icon: <ClipboardCheck size={18}/> },
                                        { id: 'metadata', label: 'Metadata', icon: <BarChart3 size={18}/> },
                                        { id: 'diseminasi', label: 'Diseminasi', icon: <Globe size={18}/> },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content Form */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                                    <form id="stat-form" onSubmit={handleSubmit} className="space-y-6 text-left">
                                        
                                        {/* TAB 1: UMUM */}
                                        {activeTab === 'umum' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Informasi Dasar</h3>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Nama Kegiatan</label>
                                                    <input name="nama_kegiatan" value={formData.nama_kegiatan} onChange={handleInputChange} required className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary focus:bg-white outline-none font-bold text-slate-700" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Tahun</label>
                                                        <input type="number" name="tahun" value={formData.tahun} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Cara Pengumpulan</label>
                                                        <select 
                                                            name="cara_pengumpulan_data" 
                                                            value={formData.cara_pengumpulan_data} 
                                                            onChange={handleInputChange} 
                                                            className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold cursor-pointer text-slate-700"
                                                        >
                                                            <option value="">-- Pilih Cara --</option>
                                                            <option value="Kompilasi Data">Kompilasi Data</option>
                                                            <option value="Survei">Survei</option>
                                                            <option value="Pendataan Lengkap">Pendataan Lengkap</option>
                                                            <option value="Teknologi Informasi">Teknologi Informasi</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Produsen Data (Instansi)</label>
                                                    <select 
                                                        name="produsen_data" 
                                                        value={formData.produsen_data} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold cursor-pointer text-slate-700"
                                                    >
                                                        <option value="">-- Pilih Instansi Produsen --</option>
                                                        {DAFTAR_PRODUSEN.map((dinas, idx) => (
                                                            <option key={idx} value={dinas}>{dinas}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 2: REKOMENDASI */}
                                        {activeTab === 'rekom' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Status Rekomendasi (BPS)</h3>
                                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input type="checkbox" checked={formData.sudah_meminta_rekomendasi === 1} onChange={e => handleCheckboxChange('sudah_meminta_rekomendasi', e.target.checked)} className="w-5 h-5 accent-brand-primary cursor-pointer" />
                                                        <span className="text-xs font-bold text-slate-600">Sudah Meminta</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input type="checkbox" checked={formData.sudah_mendapat_rekomendasi === 1} onChange={e => handleCheckboxChange('sudah_mendapat_rekomendasi', e.target.checked)} className="w-5 h-5 accent-brand-primary cursor-pointer" />
                                                        <span className="text-xs font-bold text-slate-600">Sudah Mendapat</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block mt-4">Nomor Identitas Rekomendasi</label>
                                                    <input name="nomor_identitas_rekomendasi" value={formData.nomor_identitas_rekomendasi} onChange={handleInputChange} placeholder="Contoh: V-24.32xx.xxx" className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Jenis Dokumen Perencanaan</label>
                                                    <input name="jenis_dokumen_perencanaan" value={formData.jenis_dokumen_perencanaan} onChange={handleInputChange} placeholder="Contoh: KAK / Proposal..." className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 3: METADATA */}
                                        {activeTab === 'metadata' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Metadata & Variabel</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Jumlah Variabel</label>
                                                        <input type="number" name="jumlah_variabel" value={formData.jumlah_variabel} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Jumlah Indikator</label>
                                                        <input type="number" name="jumlah_indikator" value={formData.jumlah_indikator} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
                                                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input type="checkbox" checked={formData.ada_metadata_kegiatan === 1} onChange={e => handleCheckboxChange('ada_metadata_kegiatan', e.target.checked)} className="w-5 h-5 accent-brand-primary" /> Ada Metadata Kegiatan
                                                    </label>
                                                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input type="checkbox" checked={formData.ada_metadata_variabel === 1} onChange={e => handleCheckboxChange('ada_metadata_variabel', e.target.checked)} className="w-5 h-5 accent-brand-primary" /> Ada Metadata Variabel
                                                    </label>
                                                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input type="checkbox" checked={formData.memenuhi_standar_data === 1} onChange={e => handleCheckboxChange('memenuhi_standar_data', e.target.checked)} className="w-5 h-5 accent-brand-primary" /> Memenuhi Standar Data
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 4: DISEMINASI */}
                                        {activeTab === 'diseminasi' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">Penyebarluasan Data</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Jadwal Rilis</label>
                                                        <input name="jadwal_rilis" value={formData.jadwal_rilis} onChange={handleInputChange} placeholder="Contoh: Desember 2026" className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Jenis Diseminasi</label>
                                                        <input name="jenis_diseminasi" value={formData.jenis_diseminasi} onChange={handleInputChange} placeholder="Contoh: Buku / Website" className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Link URL Diseminasi</label>
                                                    <input name="link_diseminasi" value={formData.link_diseminasi} onChange={handleInputChange} placeholder="https://..." className="w-full px-5 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-brand-primary outline-none font-bold text-slate-700" />
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl mt-4">
                                                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer">
                                                        <input type="checkbox" checked={formData.rilis_tepat_waktu === 1} onChange={e => handleCheckboxChange('rilis_tepat_waktu', e.target.checked)} className="w-5 h-5 accent-brand-primary" /> Rilis Sesuai Jadwal (Tepat Waktu)
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                    </form>
                                </div>

                                {/* Footer Form */}
                                <div className="p-8 border-t border-slate-100 flex gap-4">
                                    <button type="submit" form="stat-form" className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-brand-dark transition-colors">Simpan Seluruh Data</button>
                                    <button onClick={() => setShowModal(false)} className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-colors">Batal</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DaftarStatistikAdmin;