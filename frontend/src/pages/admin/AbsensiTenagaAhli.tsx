import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  ScanFace, 
  CalendarCheck, 
  MapPin, 
  Settings, 
  Search, 
  Download, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Sparkles, 
  Navigation, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Briefcase, 
  FileSpreadsheet,
  MapPinned
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { loadFaceApiModels, extractFaceDescriptor, faceapi } from '../../utils/faceApi';

interface PengaturanAbsensi {
  id: number;
  nama_lokasi: string;
  latitude: number | string;
  longitude: number | string;
  radius_meter: number;
  jam_masuk: string;
  jam_pulang: string;
  updated_at?: string;
}

interface TenagaAhliItem {
  id: number;
  nama: string;
  nip?: string;
  jabatan?: string;
  foto_referensi?: string | null;
  face_descriptor?: number[] | null;
  has_face?: boolean | number;
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  kategori_kerja?: string;
  status_kehadiran?: string;
  foto_masuk?: string | null;
  foto_pulang?: string | null;
  jarak_meter?: number | null;
  face_score?: number | null;
  is_checked_in?: boolean | number;
  is_checked_out?: boolean | number;
}

interface RekapItem {
  pegawai_id: number;
  nama: string;
  nip?: string;
  jabatan?: string;
  foto_referensi?: string | null;
  tanggal: string;
  jam_masuk?: string | null;
  jam_pulang?: string | null;
  kategori_kerja?: string;
  status_kehadiran?: string;
  lat_masuk?: number | string;
  lng_masuk?: number | string;
  jarak_meter?: number | null;
  foto_masuk?: string | null;
  foto_pulang?: string | null;
  face_score?: number | null;
  keterangan?: string;
  is_hadir?: boolean | number;
}

interface RekapSummary {
  total_ta: number;
  hadir: number;
  tepat_waktu: number;
  terlambat: number;
  dinas_luar: number;
  izin: number;
  belum_absen: number;
  sudah_pulang: number;
}

const AbsensiTenagaAhli: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'enroll' | 'pengaturan'>('rekap');
  const [loading, setLoading] = useState(false);

  // Tab 1: Rekap
  const [filterMode, setFilterMode] = useState<'harian' | 'bulanan'>('harian');
  const [tanggalFilter, setTanggalFilter] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bulanFilter, setBulanFilter] = useState<number>(() => new Date().getMonth() + 1);
  const [tahunFilter, setTahunFilter] = useState<number>(() => new Date().getFullYear());
  const [searchRekap, setSearchRekap] = useState('');
  const [rekapData, setRekapData] = useState<RekapItem[]>([]);
  const [rekapSummary, setRekapSummary] = useState<RekapSummary>({
    total_ta: 0,
    hadir: 0,
    tepat_waktu: 0,
    terlambat: 0,
    dinas_luar: 0,
    izin: 0,
    belum_absen: 0,
    sudah_pulang: 0
  });

  // Modal Image Preview
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Tab 2: Enrollment
  const [tenagaAhliList, setTenagaAhliList] = useState<TenagaAhliItem[]>([]);
  const [searchEnroll, setSearchEnroll] = useState('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedPegawaiForEnroll, setSelectedPegawaiForEnroll] = useState<TenagaAhliItem | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionScore, setFaceDetectionScore] = useState<number>(0);
  const [isSavingFace, setIsSavingFace] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDescriptorRef = useRef<number[] | null>(null);

  // Tab 3: Pengaturan
  const [pengaturan, setPengaturan] = useState<PengaturanAbsensi>({
    id: 1,
    nama_lokasi: 'Dinas Komunikasi dan Informatika Kab. Garut',
    latitude: -7.20378529,
    longitude: 107.88695705,
    radius_meter: 100,
    jam_masuk: '07:30:00',
    jam_pulang: '16:00:00'
  });
  const [savingPengaturan, setSavingPengaturan] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ==========================================
  // FETCHERS
  // ==========================================
  const fetchRekap = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/absensi/rekap`;
      if (filterMode === 'harian') {
        url += `?tanggal=${tanggalFilter}`;
      } else {
        url += `?bulan=${bulanFilter}&tahun=${tahunFilter}`;
      }

      const res = await axios.get(url, { headers: getAuthHeader() });
      if (res.data.success) {
        setRekapData(res.data.data || []);
        if (res.data.summary) {
          setRekapSummary(res.data.summary);
        } else {
          // Hitung summary manual jika mode bulanan
          const list = res.data.data || [];
          const hadir = list.filter((r: RekapItem) => r.jam_masuk && r.kategori_kerja !== 'Izin/Sakit').length;
          const terlambat = list.filter((r: RekapItem) => r.status_kehadiran === 'Terlambat').length;
          const tepat_waktu = list.filter((r: RekapItem) => r.status_kehadiran === 'Tepat Waktu').length;
          const dinas_luar = list.filter((r: RekapItem) => r.kategori_kerja === 'Dinas Luar').length;
          const izin = list.filter((r: RekapItem) => r.kategori_kerja === 'Izin/Sakit').length;
          setRekapSummary({
            total_ta: list.length,
            hadir,
            tepat_waktu,
            terlambat,
            dinas_luar,
            izin,
            belum_absen: 0,
            sudah_pulang: list.filter((r: RekapItem) => r.jam_pulang).length
          });
        }
      }
    } catch (err: unknown) {
      console.error('Error fetchRekap:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenagaAhli = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/absensi/tenaga-ahli`);
      if (res.data.success) {
        setTenagaAhliList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetchTenagaAhli:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPengaturan = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/absensi/pengaturan`);
      if (res.data.success && res.data.data) {
        setPengaturan(res.data.data);
      }
    } catch (err) {
      console.error('Error fetchPengaturan:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'rekap') {
      fetchRekap();
    } else if (activeTab === 'enroll') {
      fetchTenagaAhli();
    } else if (activeTab === 'pengaturan') {
      fetchPengaturan();
    }
  }, [activeTab, filterMode, tanggalFilter, bulanFilter, tahunFilter]);

  // ==========================================
  // FACE ENROLLMENT LOGIC
  // ==========================================
  const startCamera = async (pegawai: TenagaAhliItem) => {
    setSelectedPegawaiForEnroll(pegawai);
    setIsCameraModalOpen(true);
    setCameraLoading(true);
    setFaceDetected(false);
    setFaceDetectionScore(0);
    currentDescriptorRef.current = null;

    try {
      // 1. Muat model Face-API
      await loadFaceApiModels();

      // 2. Minta akses kamera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraLoading(false);
          startFaceDetectionLoop();
        };
      }
    } catch (err: unknown) {
      console.error('Error starting camera for enrollment:', err);
      setCameraLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Kamera Gagal Dibuka',
        text: 'Pastikan Anda memberikan izin akses kamera pada browser.'
      });
      closeCameraModal();
    }
  };

  const startFaceDetectionLoop = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const result = await extractFaceDescriptor(video);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (result) {
          setFaceDetected(true);
          setFaceDetectionScore(Math.round(result.score * 100));
          currentDescriptorRef.current = result.descriptor;

          // Gambar bounding box rapi di canvas
          const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
          faceapi.matchDimensions(canvas, displaySize);
          const resizedDetections = faceapi.resizeResults(result.detection, displaySize);
          
          const box = resizedDetections.box;
          ctx.strokeStyle = '#00D2B4';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Gambar label
          ctx.fillStyle = '#002B2D';
          ctx.fillRect(box.x, box.y - 28, box.width, 24);
          ctx.fillStyle = '#00D2B4';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`Wajah Terdeteksi (${Math.round(result.score * 100)}%)`, box.x + 8, box.y - 12);
        } else {
          setFaceDetected(false);
          setFaceDetectionScore(0);
          currentDescriptorRef.current = null;
        }
      }
    }, 200);
  };

  const closeCameraModal = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraModalOpen(false);
    setSelectedPegawaiForEnroll(null);
    setFaceDetected(false);
    setFaceDetectionScore(0);
    currentDescriptorRef.current = null;
  };

  const handleCaptureAndSaveFace = async () => {
    if (!videoRef.current || !currentDescriptorRef.current || !selectedPegawaiForEnroll) {
      Swal.fire('Perhatian', 'Wajah belum terdeteksi secara optimal. Mohon hadap ke kamera.', 'warning');
      return;
    }

    try {
      setIsSavingFace(true);

      // Snapshot frame video ke canvas offscreen
      const video = videoRef.current;
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = video.videoWidth || 640;
      snapCanvas.height = video.videoHeight || 480;
      const snapCtx = snapCanvas.getContext('2d');
      if (!snapCtx) throw new Error('Gagal membuat canvas gambar');

      snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

      // Konversi ke Blob JPEG
      const blob = await new Promise<Blob | null>((resolve) => {
        snapCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Gagal memproses file foto referensi');

      const formData = new FormData();
      formData.append('pegawai_id', String(selectedPegawaiForEnroll.id));
      formData.append('face_descriptor', JSON.stringify(currentDescriptorRef.current));
      formData.append('foto_referensi', blob, `ref_face_${selectedPegawaiForEnroll.id}.jpg`);

      const res = await axios.post(`${API_BASE_URL}/api/absensi/enroll-face`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: `Referensi biometrik wajah untuk "${selectedPegawaiForEnroll.nama}" berhasil disimpan.`,
          confirmButtonColor: '#00D2B4'
        });
        closeCameraModal();
        fetchTenagaAhli();
      } else {
        throw new Error(res.data.message || 'Gagal menyimpan wajah');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      Swal.fire('Error', axiosError.response?.data?.message || 'Gagal menyimpan referensi wajah', 'error');
    } finally {
      setIsSavingFace(false);
    }
  };

  // ==========================================
  // PENGATURAN GEOFENCE & JAM KERJA
  // ==========================================
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Error', 'Browser Anda tidak mendukung geolokasi.', 'error');
      return;
    }

    Swal.fire({
      title: 'Mendeteksi Titik GPS...',
      text: 'Mohon izinkan akses lokasi pada browser.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        Swal.close();
        setPengaturan(prev => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(8)),
          longitude: Number(pos.coords.longitude.toFixed(8))
        }));
        Swal.fire('Berhasil', 'Koordinat GPS kantor berhasil diperbarui dari lokasi Anda saat ini.', 'success');
      },
      (err) => {
        Swal.close();
        Swal.fire('Gagal Mengambil Lokasi', err.message || 'Pastikan GPS perangkat Anda aktif.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSavePengaturan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPengaturan(true);
      const res = await axios.put(`${API_BASE_URL}/api/absensi/pengaturan`, pengaturan, {
        headers: getAuthHeader()
      });
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pengaturan Disimpan',
          text: 'Konfigurasi lokasi geofence dan jam kerja berhasil diperbarui.',
          confirmButtonColor: '#00D2B4'
        });
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      Swal.fire('Error', axiosError.response?.data?.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSavingPengaturan(false);
    }
  };

  // ==========================================
  // EXCEL EXPORT (SPJ KEHADIRAN)
  // ==========================================
  const handleExportExcel = async () => {
    if (rekapData.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada data rekap presensi pada filter yang dipilih.', 'info');
      return;
    }

    try {
      Swal.fire({
        title: 'Menyiapkan Rekap SPJ...',
        text: 'Mengompilasi lembar kerja kehadiran Tenaga Ahli...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Bidang Statistik Diskominfo Garut';
      const sheet = workbook.addWorksheet('Rekap Presensi');

      // Header Laporan
      sheet.mergeCells('A1:J1');
      sheet.getCell('A1').value = 'DAFTAR REKAPITULASI PRESENSI TENAGA AHLI';
      sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF002B2D' } };
      sheet.getCell('A1').alignment = { horizontal: 'center' };

      sheet.mergeCells('A2:J2');
      const periodeText = filterMode === 'harian'
        ? `Tanggal: ${tanggalFilter}`
        : `Periode: Bulan ${bulanFilter} Tahun ${tahunFilter}`;
      sheet.getCell('A2').value = `Dinas Komunikasi dan Informatika Kabupaten Garut (${periodeText})`;
      sheet.getCell('A2').font = { bold: false, size: 11, italic: true };
      sheet.getCell('A2').alignment = { horizontal: 'center' };

      sheet.addRow([]); // Blank row

      // Header Tabel
      const tableHeaders = [
        'No', 'Tanggal', 'Nama Pegawai', 'Jabatan / NIP', 'Jam Masuk', 
        'Jam Pulang', 'Kategori', 'Status Kehadiran', 'Jarak (m)', 'Keterangan Tugas'
      ];
      const headerRow = sheet.addRow(tableHeaders);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF002B2D' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Lebar Kolom
      sheet.columns = [
        { key: 'no', width: 6 },
        { key: 'tanggal', width: 14 },
        { key: 'nama', width: 32 },
        { key: 'jabatan', width: 25 },
        { key: 'masuk', width: 14 },
        { key: 'pulang', width: 14 },
        { key: 'kategori', width: 16 },
        { key: 'status', width: 18 },
        { key: 'jarak', width: 12 },
        { key: 'keterangan', width: 40 },
      ];

      // Baris Data
      rekapData.forEach((item, index) => {
        const row = sheet.addRow({
          no: index + 1,
          tanggal: item.tanggal,
          nama: item.nama,
          jabatan: `${item.jabatan || '-'}${item.nip ? ` / ${item.nip}` : ''}`,
          masuk: item.jam_masuk ? String(item.jam_masuk).slice(0, 5) : 'Belum Masuk',
          pulang: item.jam_pulang ? String(item.jam_pulang).slice(0, 5) : (item.jam_masuk ? 'Belum Pulang' : '-'),
          kategori: item.kategori_kerja || '-',
          status: item.status_kehadiran || (item.jam_masuk ? 'Hadir' : 'Belum Absen'),
          jarak: item.jarak_meter != null ? `${item.jarak_meter} m` : '-',
          keterangan: item.keterangan || '-'
        });

        // Alternating fill
        if (index % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
        row.alignment = { vertical: 'middle', wrapText: true };
      });

      // Border tabel
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber >= 4) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `SPJ_Presensi_Tenaga_Ahli_${filterMode === 'harian' ? tanggalFilter : `${tahunFilter}_${bulanFilter}`}.xlsx`;
      saveAs(new Blob([buffer]), filename);

      Swal.close();
      Swal.fire('Berhasil', `File SPJ Presensi berhasil diunduh (${filename})`, 'success');
    } catch (err) {
      console.error('Error export excel:', err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat memproses ekspor Excel.', 'error');
    }
  };

  const filteredRekap = rekapData.filter(r => 
    r.nama.toLowerCase().includes(searchRekap.toLowerCase()) ||
    (r.nip && r.nip.includes(searchRekap)) ||
    (r.kategori_kerja && r.kategori_kerja.toLowerCase().includes(searchRekap.toLowerCase()))
  );

  const filteredEnroll = tenagaAhliList.filter(t =>
    t.nama.toLowerCase().includes(searchEnroll.toLowerCase()) ||
    (t.nip && t.nip.includes(searchEnroll)) ||
    (t.jabatan && t.jabatan.toLowerCase().includes(searchEnroll.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-10 bg-slate-50 min-h-screen text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-black text-xs uppercase tracking-wider mb-2">
            <ScanFace size={14} /> Modul Biometrik & Geofence
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            Absensi Tenaga Ahli
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Monitoring kehadiran presensi biometrik wajah, radius kantor, dan registrasi profil biometrik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/presensi-ta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-brand-primary/20 transition-all cursor-pointer shadow-md hover-lift"
          >
            <Camera size={18} /> Buka Portal Presensi <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-brand-dark text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck size={18} /> Rekap & Monitoring
        </button>
        <button
          onClick={() => setActiveTab('enroll')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'enroll'
              ? 'bg-brand-dark text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <ScanFace size={18} /> Registrasi Wajah (Face ID)
        </button>
        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'pengaturan'
              ? 'bg-brand-dark text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Settings size={18} /> Pengaturan Geofence & Jam Kerja
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: REKAP & MONITORING                                      */}
      {/* ============================================================== */}
      {activeTab === 'rekap' && (
        <div className="space-y-8">
          {/* SUMMARY STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Total TA</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-dark">{rekapSummary.total_ta}</span>
                <span className="text-[10px] font-bold text-slate-400">Orang</span>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 shadow-xs">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block mb-1">Hadir Masuk</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">{rekapSummary.hadir}</span>
                <span className="text-[10px] font-bold text-emerald-600">Org</span>
              </div>
            </div>

            <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/70 shadow-xs">
              <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block mb-1">Tepat Waktu</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-teal-700">{rekapSummary.tepat_waktu}</span>
                <span className="text-[10px] font-bold text-teal-600">Org</span>
              </div>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 shadow-xs">
              <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block mb-1">Terlambat</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-700">{rekapSummary.terlambat}</span>
                <span className="text-[10px] font-bold text-amber-600">Org</span>
              </div>
            </div>

            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200/70 shadow-xs">
              <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block mb-1">Dinas Luar</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-sky-700">{rekapSummary.dinas_luar}</span>
                <span className="text-[10px] font-bold text-sky-600">Org</span>
              </div>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/70 shadow-xs">
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block mb-1">Belum Absen</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-700">{rekapSummary.belum_absen}</span>
                <span className="text-[10px] font-bold text-rose-600">Org</span>
              </div>
            </div>
          </div>

          {/* FILTER & ACTIONS BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                <button
                  onClick={() => setFilterMode('harian')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === 'harian' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setFilterMode('bulanan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterMode === 'bulanan' ? 'bg-white text-brand-dark shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Bulanan
                </button>
              </div>

              {/* Harian Date Picker */}
              {filterMode === 'harian' ? (
                <input
                  type="date"
                  value={tanggalFilter}
                  onChange={(e) => setTanggalFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={bulanFilter}
                    onChange={(e) => setBulanFilter(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary cursor-pointer"
                  >
                    {[
                      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                    ].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={tahunFilter}
                    onChange={(e) => setTahunFilter(Number(e.target.value))}
                    className="w-20 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                  />
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={fetchRekap}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                title="Muat ulang data rekap"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Tenaga Ahli..."
                  value={searchRekap}
                  onChange={(e) => setSearchRekap(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 ring-brand-primary"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <FileSpreadsheet size={16} /> Ekspor Excel (SPJ)
              </button>
            </div>
          </div>

          {/* REKAP TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="p-5 w-12 text-center">No</th>
                    <th className="p-5">Tenaga Ahli</th>
                    <th className="p-5">Presensi Masuk</th>
                    <th className="p-5">Presensi Pulang</th>
                    <th className="p-5">Verifikasi Lokasi & Face</th>
                    <th className="p-5">Kategori / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-5 text-center"><div className="w-6 h-6 bg-slate-100 rounded-md mx-auto" /></td>
                        <td className="p-5"><div className="w-44 h-5 bg-slate-100 rounded-md" /></td>
                        <td className="p-5"><div className="w-32 h-5 bg-slate-100 rounded-md" /></td>
                        <td className="p-5"><div className="w-28 h-5 bg-slate-100 rounded-md" /></td>
                        <td className="p-5"><div className="w-36 h-5 bg-slate-100 rounded-md" /></td>
                        <td className="p-5"><div className="w-40 h-5 bg-slate-100 rounded-md" /></td>
                      </tr>
                    ))
                  ) : filteredRekap.length > 0 ? (
                    filteredRekap.map((item, index) => (
                      <tr key={`${item.pegawai_id}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-5 text-center font-mono text-xs text-slate-400 font-bold">{index + 1}</td>
                        
                        {/* Profile Col */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                              {item.foto_referensi ? (
                                <img
                                  src={`${API_BASE_URL}${item.foto_referensi}`}
                                  alt={item.nama}
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-85 transition-opacity"
                                  onClick={() => setPreviewImage({
                                    url: `${API_BASE_URL}${item.foto_referensi}`,
                                    title: item.nama,
                                    subtitle: 'Foto Referensi Biometrik Wajah'
                                  })}
                                />
                              ) : (
                                <Users size={20} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{item.nama}</h4>
                              <p className="text-xs text-slate-400 font-medium">
                                {item.jabatan || 'Tenaga Ahli'}{item.nip ? ` • ${item.nip}` : ''}
                              </p>
                              {filterMode === 'bulanan' && (
                                <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">
                                  Tgl: {item.tanggal}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Presensi Masuk Col */}
                        <td className="p-5">
                          {item.jam_masuk ? (
                            <div className="flex items-center gap-3">
                              {item.foto_masuk && (
                                <div 
                                  onClick={() => setPreviewImage({
                                    url: `${API_BASE_URL}${item.foto_masuk}`,
                                    title: item.nama,
                                    subtitle: `Foto Masuk • ${String(item.jam_masuk).slice(0, 5)} WIB (${item.status_kehadiran || '-'})`
                                  })}
                                  className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                  title="Klik untuk memperbesar foto presensi masuk"
                                >
                                  <img src={`${API_BASE_URL}${item.foto_masuk}`} alt="Foto Masuk" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                                  <Clock size={14} className="text-emerald-500" />
                                  <span>{String(item.jam_masuk).slice(0, 5)} WIB</span>
                                </div>
                                <div className="mt-1">
                                  {item.status_kehadiran === 'Tepat Waktu' ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                                      Tepat Waktu
                                    </span>
                                  ) : item.status_kehadiran === 'Terlambat' ? (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                                      Terlambat
                                    </span>
                                  ) : (
                                    <span className="bg-sky-50 text-sky-700 border border-sky-200/60 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                                      {item.status_kehadiran || 'Hadir'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Belum Masuk
                            </span>
                          )}
                        </td>

                        {/* Presensi Pulang Col */}
                        <td className="p-5">
                          {item.jam_pulang ? (
                            <div className="flex items-center gap-3">
                              {item.foto_pulang && (
                                <div 
                                  onClick={() => setPreviewImage({
                                    url: `${API_BASE_URL}${item.foto_pulang}`,
                                    title: item.nama,
                                    subtitle: `Foto Pulang • ${String(item.jam_pulang).slice(0, 5)} WIB`
                                  })}
                                  className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-blue-200 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                  title="Klik untuk memperbesar foto presensi pulang"
                                >
                                  <img src={`${API_BASE_URL}${item.foto_pulang}`} alt="Foto Pulang" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                                  <Clock size={14} className="text-blue-500" />
                                  <span>{String(item.jam_pulang).slice(0, 5)} WIB</span>
                                </div>
                                <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider inline-block mt-1">
                                  Check-Out
                                </span>
                              </div>
                            </div>
                          ) : item.jam_masuk ? (
                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Belum Pulang
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Verifikasi Lokasi & Face Col */}
                        <td className="p-5">
                          {item.jam_masuk ? (
                            <div className="space-y-1.5 text-xs">
                              {/* Jarak */}
                              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                                <MapPin size={14} className={item.jarak_meter && item.jarak_meter <= 100 ? 'text-emerald-500' : 'text-amber-500'} />
                                <span>{item.jarak_meter != null ? `${item.jarak_meter} meter` : '-'}</span>
                                {item.lat_masuk && item.lng_masuk && (
                                  <a
                                    href={`https://www.google.com/maps?q=${item.lat_masuk},${item.lng_masuk}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-primary hover:underline text-[10px] font-bold inline-flex items-center gap-0.5 ml-1"
                                    title="Buka titik koordinat di Google Maps"
                                  >
                                    Maps <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>

                              {/* Face Match Score */}
                              <div className="flex items-center gap-1.5">
                                <ScanFace size={14} className="text-brand-primary" />
                                <span className="text-[10px] font-bold text-slate-500">
                                  Kecocokan:{' '}
                                  <strong className="text-brand-dark">
                                    {item.face_score != null ? `${Math.round(item.face_score * 100)}%` : 'Manual'}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Kategori & Keterangan Col */}
                        <td className="p-5">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider inline-block ${
                              item.kategori_kerja === 'WFO' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : item.kategori_kerja === 'Dinas Luar'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {item.kategori_kerja || '-'}
                            </span>
                            <p className="text-xs text-slate-600 font-medium line-clamp-2 max-w-xs" title={item.keterangan || '-'}>
                              {item.keterangan || '-'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <CalendarCheck size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                          Belum ada rekap presensi pada filter ini
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REGISTRASI WAJAH (FACE ENROLLMENT)                       */}
      {/* ============================================================== */}
      {activeTab === 'enroll' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800">Daftar Biometrik Wajah Tenaga Ahli</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Perekaman 128-float vector biometrik untuk pengenalan wajah mandiri pada kiosk / smartphone.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Tenaga Ahli..."
                value={searchEnroll}
                onChange={(e) => setSearchEnroll(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 ring-brand-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEnroll.map((ta) => {
              const hasFace = Boolean(ta.has_face || ta.face_descriptor);
              return (
                <div 
                  key={ta.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200/70 shrink-0">
                        {ta.foto_referensi ? (
                          <img
                            src={`${API_BASE_URL}${ta.foto_referensi}`}
                            alt={ta.nama}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewImage({
                              url: `${API_BASE_URL}${ta.foto_referensi}`,
                              title: ta.nama,
                              subtitle: 'Foto Referensi Biometrik Wajah'
                            })}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ScanFace size={30} />
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        {hasFace ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 size={13} className="text-emerald-500" /> Terdaftar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            <AlertCircle size={13} className="text-amber-500" /> Belum Terdaftar
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm">{ta.nama}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {ta.jabatan || 'Tenaga Ahli'}{ta.nip ? ` • ${ta.nip}` : ''}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      ID: #{ta.id}
                    </span>

                    <button
                      onClick={() => startCamera(ta)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                        hasFace 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-brand-dark hover:bg-brand-primary text-white shadow-brand-dark/20'
                      }`}
                    >
                      <Camera size={14} /> {hasFace ? 'Perbarui Wajah' : 'Rekam Wajah'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PENGATURAN GEOFENCE & JAM KERJA                         */}
      {/* ============================================================== */}
      {activeTab === 'pengaturan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <MapPin size={22} className="text-brand-primary" /> Pengaturan Lokasi & Waktu Kantor
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">
              Tentukan koordinat pusat kantor dan batas radius toleransi presensi WFO Tenaga Ahli.
            </p>

            <form onSubmit={handleSavePengaturan} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Nama Lokasi / Instansi
                </label>
                <input
                  type="text"
                  required
                  value={pengaturan.nama_lokasi}
                  onChange={(e) => setPengaturan({ ...pengaturan, nama_lokasi: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pengaturan.latitude}
                    onChange={(e) => setPengaturan({ ...pengaturan, latitude: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={pengaturan.longitude}
                    onChange={(e) => setPengaturan({ ...pengaturan, longitude: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Navigation size={14} className="text-brand-primary" /> Ambil Titik Lokasi Saya Saat Ini
                </button>
                <a
                  href={`https://www.google.com/maps?q=${pengaturan.latitude},${pengaturan.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <MapPinned size={14} /> Lihat Titik di Google Maps <ExternalLink size={12} />
                </a>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Radius Batas Toleransi Geofence
                  </label>
                  <span className="text-xs font-black text-brand-dark">{pengaturan.radius_meter} Meter</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={pengaturan.radius_meter}
                  onChange={(e) => setPengaturan({ ...pengaturan, radius_meter: Number(e.target.value) })}
                  className="w-full accent-brand-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>20m (Ketat)</span>
                  <span>100m (Standar Kantor)</span>
                  <span>500m (Kompleks Gedung)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Jam Masuk Kerja (Batas Terlambat)
                  </label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={pengaturan.jam_masuk}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_masuk: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Jam Pulang Kerja (Check-Out)
                  </label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={pengaturan.jam_pulang}
                    onChange={(e) => setPengaturan({ ...pengaturan, jam_pulang: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 outline-none focus:ring-2 ring-brand-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={savingPengaturan}
                  className="w-full py-4 bg-brand-dark hover:bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Settings size={16} /> {savingPengaturan ? 'Menyimpan...' : 'Simpan Pengaturan Geofence & Jam Kerja'}
                </button>
              </div>
            </form>
          </div>

          {/* Info Card Geofence */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-[#002B2D] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-primary border border-white/10">
                <ShieldCheck size={26} />
              </div>
              <h4 className="text-lg font-black tracking-tight">Mekanisme Validasi Geofence</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem menggunakan formula <strong>Haversine</strong> untuk menghitung jarak presisi tinggi (dalam meter) antara koordinat GPS ponsel pegawai dengan koordinat kantor Diskominfo.
              </p>
              <div className="space-y-2 text-xs font-medium text-slate-200 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span><strong>Kategori WFO:</strong> Ditolak otomatis jika jarak melebihi {pengaturan.radius_meter} meter.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span><strong>Kategori Dinas Luar:</strong> Boleh di luar radius kantor dengan wajib menyertakan foto dan keterangan tugas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span><strong>Kategori Izin/Sakit:</strong> Mencatat status izin tanpa validasi radius.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL KAMERA ENROLLMENT                                        */}
      {/* ============================================================== */}
      {isCameraModalOpen && selectedPegawaiForEnroll && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-left">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <ScanFace size={20} className="text-brand-primary" /> Perekaman Wajah (Face ID)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Pegawai: <strong>{selectedPegawaiForEnroll.nama}</strong>
                </p>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* CAMERA PREVIEW CONTAINER */}
              <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
                {cameraLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-3">
                    <RefreshCw size={32} className="animate-spin text-brand-primary" />
                    <span className="text-xs font-bold tracking-wider uppercase">Memuat Model Face-API & Kamera...</span>
                  </div>
                )}

                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
                />

                {/* DETECTION BADGE OVERLAY */}
                <div className="absolute top-4 left-4 z-10">
                  {faceDetected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white font-black text-[10px] uppercase tracking-wider backdrop-blur-sm shadow-md animate-pulse">
                      <Sparkles size={12} /> Wajah Terdeteksi ({faceDetectionScore}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white font-black text-[10px] uppercase tracking-wider backdrop-blur-sm shadow-md">
                      <AlertCircle size={12} /> Arahkan Wajah ke Kamera...
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                💡 <strong>Tips:</strong> Pastikan pencahayaan terang merata dan wajah menghadap tegak lurus ke arah kamera.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCaptureAndSaveFace}
                  disabled={!faceDetected || isSavingFace}
                  className={`w-2/3 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    faceDetected && !isSavingFace
                      ? 'bg-brand-dark hover:bg-brand-primary text-white shadow-brand-dark/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Camera size={16} /> {isSavingFace ? 'Menyimpan Biometrik...' : 'Ambil Foto & Simpan Referensi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL FULLSCREEN IMAGE PREVIEW                                 */}
      {/* ============================================================== */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{previewImage.title}</h4>
                {previewImage.subtitle && (
                  <p className="text-xs text-slate-400 font-medium">{previewImage.subtitle}</p>
                )}
              </div>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 bg-slate-900">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiTenagaAhli;
