import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  ScanFace,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogIn,
  LogOut,
  Camera,
  Building2,
  Sparkles,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import {
  loadFaceApiModels,
  extractFaceDescriptor,
  calculateEuclideanDistance,
  calculateSimilarityPercent,
  findBestMatchingTenagaAhli,
  faceapi,
  type TenagaAhliDescriptorItem
} from '../utils/faceApi';

interface PengaturanAbsensi {
  id: number;
  nama_lokasi: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  jam_masuk: string;
  jam_pulang: string;
}

interface TenagaAhliItem extends TenagaAhliDescriptorItem {
  nip?: string;
  foto_referensi?: string | null;
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

// Haversine Distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const PresensiTenagaAhli: React.FC = () => {
  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Data
  const [tenagaAhliList, setTenagaAhliList] = useState<TenagaAhliItem[]>([]);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<number | null>(null);
  const [pengaturan, setPengaturan] = useState<PengaturanAbsensi>({
    id: 1,
    nama_lokasi: 'Dinas Komunikasi dan Informatika Kab. Garut',
    latitude: -7.20378529,
    longitude: 107.88695705,
    radius_meter: 100,
    jam_masuk: '07:30:00',
    jam_pulang: '16:00:00'
  });

  // Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userDistance, setUserDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Form
  const [kategoriKerja, setKategoriKerja] = useState<'WFO' | 'Dinas Luar' | 'Izin/Sakit'>('WFO');
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Camera & Face API
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [matchedPegawai, setMatchedPegawai] = useState<TenagaAhliItem | null>(null);
  const [modelLoading, setModelLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDescriptorRef = useRef<Float32Array | null>(null);

  // 1. Digital Clock Interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Initial Data
  const fetchData = async () => {
    try {
      const [resPengaturan, resTA] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/absensi/pengaturan`),
        axios.get(`${API_BASE_URL}/api/absensi/tenaga-ahli`)
      ]);

      if (resPengaturan.data.success && resPengaturan.data.data) {
        setPengaturan(resPengaturan.data.data);
      }
      if (resTA.data.success && resTA.data.data) {
        setTenagaAhliList(resTA.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. Geolocation Watcher
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung geolokasi');
      setGpsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setGpsError(null);
        setGpsLoading(false);

        if (pengaturan.latitude && pengaturan.longitude) {
          const dist = calculateDistance(lat, lng, Number(pengaturan.latitude), Number(pengaturan.longitude));
          setUserDistance(dist);
        }
      },
      (err) => {
        setGpsError(err.message || 'Gagal mendeteksi lokasi');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [pengaturan.latitude, pengaturan.longitude]);

  // Recalculate distance when settings change
  useEffect(() => {
    if (userLocation && pengaturan.latitude && pengaturan.longitude) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(pengaturan.latitude),
        Number(pengaturan.longitude)
      );
      setUserDistance(dist);
    }
  }, [userLocation, pengaturan]);

  // 4. Initialize Camera & Face-API
  useEffect(() => {
    let isMounted = true;

    const setupCameraAndModels = async () => {
      try {
        setModelLoading(true);
        await loadFaceApiModels();
        if (!isMounted) return;
        setModelLoading(false);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
            startDetectionLoop();
          };
        }
      } catch (err) {
        console.error('Camera/Model setup error:', err);
        setModelLoading(false);
        setCameraReady(false);
      }
    };

    setupCameraAndModels();

    return () => {
      isMounted = false;
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. Face Detection & Matching Loop
  const startDetectionLoop = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const result = await extractFaceDescriptor(video);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result) {
        setFaceDetected(true);
        lastDescriptorRef.current = result.rawDescriptor;

        // Draw Bounding Box
        const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
        faceapi.matchDimensions(canvas, displaySize);
        const resized = faceapi.resizeResults(result.detection, displaySize);
        const box = resized.box;

        // Perform Matching
        // Mode A: If specific pegawai selected, check match with their descriptor
        // Mode B: If no pegawai selected, find best match across all TA (1:N)
        let currentMatch: TenagaAhliItem | null = null;
        let score: number | null = null;

        if (selectedPegawaiId) {
          const target = tenagaAhliList.find(t => t.id === selectedPegawaiId);
          if (target && target.face_descriptor) {
            let desc: number[] | null = null;
            if (Array.isArray(target.face_descriptor)) {
              desc = target.face_descriptor;
            } else if (typeof target.face_descriptor === 'string') {
              try { desc = JSON.parse(target.face_descriptor); } catch { desc = null; }
            }
            if (desc && Array.isArray(desc)) {
              const dist = calculateEuclideanDistance(result.rawDescriptor, desc);
              const sim = calculateSimilarityPercent(dist);
              score = sim;
              if (dist <= 0.48) {
                currentMatch = target;
              }
            }
          }
        } else {
          // 1:N match
          const best = findBestMatchingTenagaAhli(result.rawDescriptor, tenagaAhliList, 0.48);
          if (best) {
            currentMatch = best.item;
            score = best.similarity;
            // Auto-select pegawai if not manually selected
            setSelectedPegawaiId(best.item.id);
          }
        }

        setMatchedPegawai(currentMatch);
        setFaceMatchScore(score);

        // Visual Canvas Overlay
        const isMatchSuccess = Boolean(currentMatch);
        ctx.strokeStyle = isMatchSuccess ? '#00D2B4' : '#F59E0B';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Header label above box
        const labelText = isMatchSuccess
          ? `${currentMatch?.nama} (${score}%)`
          : `Wajah Terdeteksi (${Math.round(result.score * 100)}%)`;

        ctx.fillStyle = '#002B2D';
        ctx.fillRect(box.x, box.y - 28, Math.max(box.width, 200), 24);
        ctx.fillStyle = isMatchSuccess ? '#00D2B4' : '#F59E0B';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(labelText, box.x + 8, box.y - 12);

      } else {
        setFaceDetected(false);
        lastDescriptorRef.current = null;
        setFaceMatchScore(null);
      }
    }, 200);
  };

  // Selected Pegawai Object
  const selectedPegawai = tenagaAhliList.find(t => t.id === selectedPegawaiId);

  // Geofence Validation
  const isOutOfRadius = userDistance != null && userDistance > (pengaturan.radius_meter || 100);
  const isWfoBlocked = kategoriKerja === 'WFO' && isOutOfRadius;

  // 6. Handle Clock-In / Clock-Out
  const handleSubmitPresensi = async (tipe: 'masuk' | 'pulang') => {
    if (!selectedPegawaiId) {
      Swal.fire('Perhatian', 'Pilih nama Tenaga Ahli terlebih dahulu.', 'warning');
      return;
    }

    if (kategoriKerja === 'WFO' && isOutOfRadius) {
      Swal.fire({
        icon: 'error',
        title: 'Di Luar Radius Kantor',
        text: `Jarak Anda saat ini ${userDistance} meter dari kantor (batas toleransi ${pengaturan.radius_meter}m). Jika bertugas di lapangan, pilih kategori "Dinas Luar".`
      });
      return;
    }

    if ((kategoriKerja === 'Dinas Luar' || kategoriKerja === 'Izin/Sakit') && !keterangan.trim()) {
      Swal.fire('Keterangan Wajib', `Mohon isi rincian keterangan tugas untuk presensi kategori ${kategoriKerja}.`, 'warning');
      return;
    }

    try {
      setSubmitting(true);

      // Snapshot camera frame to Blob
      let photoBlob: Blob | null = null;
      if (videoRef.current && cameraReady) {
        const video = videoRef.current;
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = video.videoWidth || 640;
        snapCanvas.height = video.videoHeight || 480;
        const snapCtx = snapCanvas.getContext('2d');
        if (snapCtx) {
          snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
          photoBlob = await new Promise<Blob | null>((resolve) => {
            snapCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.90);
          });
        }
      }

      const formData = new FormData();
      formData.append('pegawai_id', String(selectedPegawaiId));
      formData.append('tipe', tipe);
      formData.append('kategori_kerja', kategoriKerja);
      formData.append('keterangan', keterangan);

      if (userLocation) {
        formData.append('latitude', String(userLocation.lat));
        formData.append('longitude', String(userLocation.lng));
      }
      if (faceMatchScore) {
        formData.append('face_score', String(Number((faceMatchScore / 100).toFixed(2))));
      }
      if (photoBlob) {
        formData.append('foto', photoBlob, `presensi_${tipe}_${selectedPegawaiId}_${Date.now()}.jpg`);
      }

      const res = await axios.post(`${API_BASE_URL}/api/absensi/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: tipe === 'masuk' ? 'Presensi Masuk Berhasil!' : 'Presensi Pulang Berhasil!',
          html: `
            <div class="text-left space-y-2 mt-2 text-xs">
              <p><strong>Nama:</strong> ${selectedPegawai?.nama}</p>
              <p><strong>Waktu:</strong> ${new Date().toLocaleTimeString('id-ID')} WIB</p>
              <p><strong>Status:</strong> ${res.data.status_kehadiran || (tipe === 'masuk' ? 'Hadir' : 'Selesai')}</p>
              <p><strong>Jarak Kantor:</strong> ${res.data.jarak_meter ?? userDistance ?? '-'} meter</p>
            </div>
          `,
          confirmButtonColor: '#00D2B4'
        });

        // Reset keterangan & refresh data
        setKeterangan('');
        fetchData();
      } else {
        throw new Error(res.data.message || 'Presensi gagal');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Presensi Ditolak',
        text: axiosError.response?.data?.message || 'Terjadi kesalahan saat memproses presensi.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#001E20] to-slate-950 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      {/* HEADER SECTION */}
      <header className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Kembali ke Beranda Portal"
          >
            <ArrowLeft size={18} />
          </a>
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-primary text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} /> Diskominfo Kabupaten Garut
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ScanFace size={24} className="text-brand-primary" /> Portal Presensi Tenaga Ahli
            </h1>
          </div>
        </div>

        {/* Real-time Clock Card */}
        <div className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-brand-primary">
              {currentTime.toLocaleTimeString('id-ID')} <span className="text-xs font-bold text-slate-400">WIB</span>
            </div>
          </div>
          <Clock size={24} className="text-brand-secondary animate-pulse" />
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-5xl mx-auto w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: CAMERA VIEWPORT */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center">
            {modelLoading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 text-white gap-3 p-6 text-center">
                <RefreshCw size={36} className="animate-spin text-brand-primary" />
                <h4 className="font-black text-sm uppercase tracking-wider">Memuat Model Pengenalan Wajah...</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Menyiapkan detektor biometrik Face-API neural network di peramban Anda.
                </p>
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

            {/* LIVE DETECTION OVERLAY BADGE */}
            <div className="absolute top-4 left-4 z-20">
              {faceDetected ? (
                matchedPegawai ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/95 text-white font-black text-xs uppercase tracking-wider shadow-lg backdrop-blur-md animate-pulse">
                    <CheckCircle2 size={14} /> Terverifikasi: {matchedPegawai.nama.split(' ')[0]} ({faceMatchScore}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white font-black text-xs uppercase tracking-wider shadow-lg backdrop-blur-md">
                    <Sparkles size={14} /> Wajah Terdeteksi (Pilih Nama)
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-slate-300 font-bold text-xs uppercase tracking-wider border border-white/10 backdrop-blur-md">
                  <Camera size={14} /> Arahkan Wajah ke Kamera...
                </span>
              )}
            </div>

            {/* GEOFENCE STATUS BADGE OVERLAY */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="bg-black/75 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 truncate">
                  <MapPin size={16} className={isOutOfRadius ? 'text-amber-400 shrink-0' : 'text-emerald-400 shrink-0'} />
                  <span className="truncate">
                    {gpsLoading
                      ? 'Mencari sinyal GPS...'
                      : userDistance != null
                        ? `${userDistance} meter dari ${pengaturan.nama_lokasi}`
                        : gpsError || 'GPS tidak tersedia'}
                  </span>
                </div>
                <div>
                  {userDistance != null && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${!isOutOfRadius
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                      {!isOutOfRadius ? 'Dalam Radius' : 'Luar Radius'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-slate-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Building2 size={18} className="text-brand-primary shrink-0" />
              <div>
                <span className="font-bold text-white block">{pengaturan.nama_lokasi}</span>
                <span className="text-[11px] text-slate-400">
                  Radius toleransi: <strong>{pengaturan.radius_meter}m</strong> • Masuk: <strong>{String(pengaturan.jam_masuk).slice(0, 5)} WIB</strong>
                </span>
              </div>
            </div>
            {userLocation && (
              <span className="text-[10px] font-mono font-bold text-slate-400">
                GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: IDENTITY SELECTION & CLOCK ACTIONS */}
        <div className="lg:col-span-5 space-y-5 bg-white/5 border border-white/10 p-6 sm:p-7 rounded-3xl backdrop-blur-md">
          {/* Identity Selection */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
              Pilih Identitas Tenaga Ahli
            </label>
            <div className="relative">
              <select
                value={selectedPegawaiId || ''}
                onChange={(e) => setSelectedPegawaiId(Number(e.target.value) || null)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 ring-brand-primary appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Nama Anda --</option>
                {tenagaAhliList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nama} ({t.jabatan || 'Tenaga Ahli'})
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {selectedPegawai && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                  {selectedPegawai.foto_referensi ? (
                    <img
                      src={`${API_BASE_URL}${selectedPegawai.foto_referensi}`}
                      alt={selectedPegawai.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ScanFace size={18} />
                    </div>
                  )}
                </div>
                <div className="text-left truncate">
                  <h4 className="font-bold text-white text-xs truncate">{selectedPegawai.nama}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-slate-400">{selectedPegawai.jabatan || 'Tenaga Ahli'}</span>
                    {selectedPegawai.has_face || selectedPegawai.face_descriptor ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Face ID Terdaftar
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <AlertCircle size={10} /> Belum Ada Face ID
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Kehadiran Hari Ini */}
          {selectedPegawai && (
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2 text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Status Kehadiran Hari Ini
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Presensi Masuk:</span>
                  {selectedPegawai.is_checked_in ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {String(selectedPegawai.jam_masuk).slice(0, 5)} WIB
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400">Belum Check-In</span>
                  )}
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Presensi Pulang:</span>
                  {selectedPegawai.is_checked_out ? (
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {String(selectedPegawai.jam_pulang).slice(0, 5)} WIB
                    </span>
                  ) : (
                    <span className="font-bold text-slate-400">Belum Check-Out</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kategori Kerja Selector */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
              Kategori Penugasan Hari Ini
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setKategoriKerja('WFO')}
                className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${kategoriKerja === 'WFO'
                  ? 'bg-brand-primary text-brand-dark border-brand-primary shadow-lg shadow-brand-primary/20 font-black'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
              >
                WFO
              </button>
              <button
                type="button"
                onClick={() => setKategoriKerja('Dinas Luar')}
                className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${kategoriKerja === 'Dinas Luar'
                  ? 'bg-brand-secondary text-brand-dark border-brand-secondary shadow-lg shadow-brand-secondary/20 font-black'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
              >
                Dinas Luar
              </button>
              <button
                type="button"
                onClick={() => setKategoriKerja('Izin/Sakit')}
                className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${kategoriKerja === 'Izin/Sakit'
                  ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-lg shadow-amber-400/20 font-black'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
              >
                Izin / Sakit
              </button>
            </div>
          </div>

          {/* Keterangan Tugas Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
              Rincian Tugas / Keterangan {kategoriKerja !== 'WFO' && <span className="text-rose-400">*Wajib</span>}
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={
                kategoriKerja === 'WFO'
                  ? 'Catatan kegiatan kerja hari ini (opsional)...'
                  : kategoriKerja === 'Dinas Luar'
                    ? 'Lokasi penugasan lapangan & uraian kegiatan...'
                    : 'Alasan izin atau sakit...'
              }
              className="w-full bg-slate-900 border border-white/20 rounded-xl p-3 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:ring-2 ring-brand-primary"
            />
          </div>

          {/* WFO Warning if out of radius */}
          {isWfoBlocked && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong>Radius Terkunci:</strong> Anda berada {userDistance}m dari kantor (melebihi {pengaturan.radius_meter}m). Silakan beralih ke kategori <strong>Dinas Luar</strong> jika sedang bertugas luar.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={submitting || !selectedPegawaiId || isWfoBlocked}
              onClick={() => handleSubmitPresensi('masuk')}
              className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${!submitting && selectedPegawaiId && !isWfoBlocked
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20 active:scale-98'
                : 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                }`}
            >
              <LogIn size={18} /> {submitting ? 'Memproses...' : 'Check-In Masuk'}
            </button>

            <button
              type="button"
              disabled={submitting || !selectedPegawaiId || !selectedPegawai?.is_checked_in}
              onClick={() => handleSubmitPresensi('pulang')}
              className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${!submitting && selectedPegawaiId && selectedPegawai?.is_checked_in
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 active:scale-98'
                : 'bg-white/10 text-slate-500 cursor-not-allowed shadow-none'
                }`}
            >
              <LogOut size={18} /> {submitting ? 'Memproses...' : 'Check-Out Pulang'}
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-white/10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Bidang Statistik - Dinas Komunikasi dan Informatika Kabupaten Garut</p>
        <div className="flex items-center gap-4 text-slate-400 font-bold">
          <a href="/admin/absensi-ta" className="hover:text-brand-primary transition-colors">
            Panel Admin Absensi
          </a>
          <span>•</span>
          <a href="/" className="hover:text-brand-primary transition-colors">
            Portal Statistik
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PresensiTenagaAhli;
