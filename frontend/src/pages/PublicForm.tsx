import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Loader2, CheckCircle2, AlertCircle, Camera, Compass, UploadCloud, PenTool,
  Star, MapPin, Mail, Phone, Link as LinkIcon, Calendar, Clock, RefreshCw,
  ExternalLink, FileText, Check, X, Info, Hash
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Tipe Data Pertanyaan & Formulir
export interface FormQuestion {
  id: string | number;
  element_category?: 'layout' | 'input';
  question_type: string;
  question_text: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  is_required?: boolean;
  validation_rules?: {
    min?: number;
    max?: number;
    min_length?: number;
    max_length?: number;
    allowed_file_types?: string[];
    max_file_size_mb?: number;
  };
  layout_config?: {
    banner_url?: string;
    image_align?: 'left' | 'center' | 'right';
    scale_min?: number;
    scale_max?: number;
    scale_min_label?: string;
    scale_max_label?: string;
    display_mode?: 'stars' | 'numbers';
  };
}

export interface FormDetail {
  id: number | string;
  title: string;
  slug: string;
  description?: string;
  is_active?: number;
  questions: FormQuestion[];
}

// ============================================================================
// 1. SUB-KOMPONEN: DIGITAL SIGNATURE PAD (CANVAS)
// ============================================================================
const DigitalSignaturePad: React.FC<{
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimension
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 180;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Auto-upload snapshot signature ke server
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file_attachment', blob, `sig-${Date.now()}.png`);
        const res = await axios.post(`${API_BASE_URL}/api/formulir/upload`, formData);
        if (res.data.success) {
          onChange(res.data.file_url);
        }
      } catch (err) {
        console.error('Upload signature error:', err);
      } finally {
        setIsUploading(false);
      }
    }, 'image/png');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden relative touch-none group hover:border-brand-primary transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair block"
        />

        {isEmpty && !value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
            <PenTool size={24} className="mb-1 opacity-40" />
            <span className="text-xs font-semibold">Tanda tangani di area ini (Gunakan mouse atau layar sentuh)</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-xs">
            <Loader2 className="animate-spin" size={12} /> Menyimpan...
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          Bersihkan Tanda Tangan
        </button>
        {value && !isEmpty && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check size={14} /> TTD Siap Dikirim
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. SUB-KOMPONEN: LIVE CAMERA CAPTURE (WEBCAM / HP CAMERA)
// ============================================================================
const CameraCaptureInput: React.FC<{
  value: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      // Fallback standard video
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diaktifkan di peramban Anda.');
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file_attachment', blob, `camera-${Date.now()}.jpg`);
        const res = await axios.post(`${API_BASE_URL}/api/formulir/upload`, formData);
        if (res.data.success) {
          onChange(res.data.file_url);
        }
      } catch (err) {
        console.error('Upload camera error:', err);
        Swal.fire('Gagal', 'Gagal mengunggah foto snapshot', 'error');
      } finally {
        setIsUploading(false);
      }
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className="space-y-3">
      {/* 1. Kondisi Sudah Ada Foto Terambil */}
      {value && !isCameraActive && (
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 group">
          <img src={value} alt="Snapshot Kamera" className="w-full h-48 object-cover" />
          <div className="p-3 bg-white flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Foto Berhasil Diambil
            </span>
            <button
              type="button"
              onClick={startCamera}
              className="text-xs font-bold text-slate-600 hover:text-brand-primary flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} /> Ambil Ulang
            </button>
          </div>
        </div>
      )}

      {/* 2. Kondisi Kamera Aktif */}
      {isCameraActive && (
        <div className="rounded-2xl overflow-hidden border border-slate-300 bg-black max-w-md w-full relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isUploading}
              className="bg-brand-primary hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Camera size={16} /> Jepret Foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-slate-800/80 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* 3. Tombol Buka Kamera Awal */}
      {!value && !isCameraActive && (
        <div>
          <button
            type="button"
            onClick={startCamera}
            disabled={isUploading}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-pink-50 border border-slate-300 hover:border-pink-300 text-slate-700 hover:text-pink-600 font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-xs"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} className="text-pink-500" />}
            Buka Kamera & Ambil Foto
          </button>
          {cameraError && <p className="text-xs text-red-500 font-semibold mt-2">{cameraError}</p>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. SUB-KOMPONEN: GEOLOCATION DETECTOR
// ============================================================================
const GeolocationInput: React.FC<{
  value: unknown;
  onChange: (val: { lat: number; lng: number; accuracy?: number; timestamp?: string }) => void;
}> = ({ value, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Parse existing data if formatted JSON
  let parsedLocation: { lat: number; lng: number; accuracy?: number } | null = null;
  if (value) {
    if (typeof value === 'object' && value !== null && 'lat' in value && 'lng' in value) {
      parsedLocation = value as { lat: number; lng: number; accuracy?: number };
    } else if (typeof value === 'string' && value.startsWith('{')) {
      try {
        parsedLocation = JSON.parse(value);
      } catch {
        parsedLocation = null;
      }
    }
  }

  const detectLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      return setGeoError('Peramban Anda tidak mendukung deteksi lokasi (Geolocation).');
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const geoObj = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date().toISOString()
        };
        onChange(geoObj);
      },
      (err) => {
        setIsLocating(false);
        console.error(err);
        setGeoError('Gagal mendeteksi lokasi. Pastikan GPS dan izin lokasi peramban telah diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      {parsedLocation ? (
        <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">
                {parsedLocation.lat}, {parsedLocation.lng}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">
                Akurasi GPS: ±{parsedLocation.accuracy || 10} meter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps?q=${parsedLocation.lat},${parsedLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
            >
              Lihat di Peta <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 p-2 hover:bg-blue-100 rounded-xl transition-colors"
              title="Perbarui Titik Lokasi"
            >
              <RefreshCw size={14} className={isLocating ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={detectLocation}
            disabled={isLocating}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-xs"
          >
            {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Compass size={18} className="text-blue-500" />}
            {isLocating ? 'Mendeteksi Titik GPS...' : 'Dapatkan Titik Koordinat Lokasi Saya (GPS)'}
          </button>
          {geoError && <p className="text-xs text-red-500 font-semibold mt-2">{geoError}</p>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. SUB-KOMPONEN: FILE UPLOAD WITH STATUS
// ============================================================================
const FileUploadInput: React.FC<{
  value: string;
  onChange: (url: string) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
}> = ({ value, onChange, maxSizeMb = 10 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      return Swal.fire('Ukuran Terlalu Besar', `Maksimal ukuran file adalah ${maxSizeMb}MB!`, 'warning');
    }

    setFileName(file.name);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file_attachment', file);
      const res = await axios.post(`${API_BASE_URL}/api/formulir/upload`, formData);
      if (res.data.success) {
        onChange(res.data.file_url);
      }
    } catch (err: unknown) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan saat mengunggah berkas', 'error');
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="bg-cyan-50/80 border border-cyan-200 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{fileName || 'Berkas Lampiran Terunggah'}</p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-700 font-semibold hover:underline flex items-center gap-1"
              >
                Lihat / Unduh Dokumen <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setFileName('');
            }}
            className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
            title="Ganti Berkas"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-300 hover:border-brand-primary bg-slate-50 hover:bg-brand-primary/5 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-brand-primary mb-2" size={24} />
              <span className="text-xs font-bold text-slate-600">Mengunggah berkas...</span>
            </div>
          ) : (
            <>
              <UploadCloud size={28} className="text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Pilih atau Seret Berkas ke Sini</span>
              <span className="text-[10px] text-slate-400 mt-0.5">PDF, Word, Excel, ZIP (Maksimal {maxSizeMb}MB)</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
    </div>
  );
};

// ============================================================================
// 5. SUB-KOMPONEN: RATING / LINEAR SCALE PICKER
// ============================================================================
const RatingScaleInput: React.FC<{
  value: number | string;
  onChange: (val: number) => void;
  scaleMax?: number;
  minLabel?: string;
  maxLabel?: string;
}> = ({ value, onChange, scaleMax = 5, minLabel = 'Sangat Buruk', maxLabel = 'Sangat Baik' }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const currentVal = Number(value) || 0;
  const items = Array.from({ length: scaleMax }, (_, i) => i + 1);

  return (
    <div className="space-y-3 pt-1">
      {/* Bintang / Angka Interaktif */}
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((num) => {
          const isSelected = currentVal >= num;
          const isHovered = hovered !== null && hovered >= num;

          return (
            <button
              key={num}
              type="button"
              onMouseEnter={() => setHovered(num)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(num)}
              className={`flex items-center justify-center w-11 h-11 rounded-2xl font-black text-sm transition-all active:scale-90 ${
                isSelected || isHovered
                  ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {scaleMax <= 5 ? <Star size={20} className={isSelected || isHovered ? 'fill-slate-900' : ''} /> : num}
            </button>
          );
        })}
      </div>

      {/* Label Min & Max */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
        <span>1: {minLabel}</span>
        <span>{scaleMax}: {maxLabel}</span>
      </div>
    </div>
  );
};

// ============================================================================
// HALAMAN UTAMA: PUBLIC FORM
// ============================================================================
const PublicForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/formulir/${slug}`);
        if (res.data.success) {
          setForm(res.data.data);
        }
      } catch (err: unknown) {
        console.error(err);
        const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Formulir tidak ditemukan atau sudah tidak aktif.';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchForm();
  }, [slug]);

  // Handle Input Changes
  const handleAnswerChange = (questionId: string | number, value: unknown, isCheckbox = false) => {
    if (isCheckbox) {
      const currentList: string[] = Array.isArray(answers[questionId]) ? [...(answers[questionId] as string[])] : [];
      const item = String(value);
      const updated = currentList.includes(item)
        ? currentList.filter((v) => v !== item)
        : [...currentList, item];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Client-side required field validation
    for (const q of form.questions) {
      if (q.element_category === 'layout') continue; // Skip layout elements
      if (q.is_required) {
        const ans = answers[q.id];
        const isEmpty =
          ans === undefined ||
          ans === null ||
          ans === '' ||
          (Array.isArray(ans) && ans.length === 0);

        if (isEmpty) {
          return Swal.fire({
            icon: 'warning',
            title: 'Kolom Wajib Diisi',
            text: `Pertanyaan "${q.question_text}" wajib diisi sebelum mengirim formulir.`,
            confirmButtonColor: '#10b981'
          });
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        form_id: form.id,
        answers: answers
      };

      const res = await axios.post(`${API_BASE_URL}/api/formulir/submit`, payload);
      if (res.data.success) {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      console.error('Submit error:', err);
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan saat mengirim jawaban.';
      Swal.fire('Gagal Mengirim', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary mb-3" size={48} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Formulir...</p>
      </div>
    );
  }

  // 2. Error State (Not Found / Inactive)
  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full">
          <AlertCircle className="text-amber-500 mx-auto mb-4" size={56} />
          <h2 className="text-xl font-black text-slate-800 mb-2">Formulir Tidak Tersedia</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
            {error || 'Formulir yang Anda cari tidak ditemukan atau telah dinonaktifkan oleh administrator.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // 3. Success Thank You Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl max-w-2xl w-full border-t-16 border-t-emerald-500 animate-in zoom-in-95 duration-500">
          <CheckCircle2 size={72} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Terima Kasih!</h1>
          <p className="text-slate-600 font-medium mb-8 text-base leading-relaxed">
            Tanggapan Anda untuk formulir <span className="font-black text-slate-800">"{form.title}"</span> telah berhasil direkam oleh sistem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setAnswers({});
                setIsSuccess(false);
              }}
              className="bg-brand-primary text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
            >
              Kirim Tanggapan Lain
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-slate-200 transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Form Renderer Utama
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex justify-center text-left font-sans">
      <div className="max-w-3xl w-full space-y-6">

        {/* Header Kartu Judul Formulir */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border-t-16 border-t-brand-primary space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-snug">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-slate-600 font-medium whitespace-pre-line text-sm md:text-base leading-relaxed">
              {form.description}
            </p>
          )}
          <hr className="border-slate-100" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            * Menunjukkan pertanyaan yang wajib diisi
          </p>
        </div>

        {/* Form Elements Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((q, idx) => {
            const isLayout = q.element_category === 'layout';

            // ==========================================
            // A. RENDER BLOK TATA LETAK / KONTEN STATIS
            // ==========================================
            if (isLayout) {
              // 1. Section Header
              if (q.question_type === 'section_header') {
                return (
                  <div key={q.id || idx} className="bg-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">{q.question_text}</h2>
                    {q.description && (
                      <p className="text-purple-200 text-xs sm:text-sm font-medium leading-relaxed">
                        {q.description}
                      </p>
                    )}
                  </div>
                );
              }

              // 2. Banner Media
              if (q.question_type === 'banner_media') {
                const bannerUrl = q.layout_config?.banner_url;
                return (
                  <div key={q.id || idx} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-3">
                    {bannerUrl ? (
                      <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-96">
                        <img src={bannerUrl} alt={q.question_text} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    {q.question_text && (
                      <p className="text-xs font-bold text-slate-600 text-center">{q.question_text}</p>
                    )}
                  </div>
                );
              }

              // 3. Paragraph Text (Info Box)
              if (q.question_type === 'paragraph_text') {
                return (
                  <div key={q.id || idx} className="bg-amber-50/70 border border-amber-200/80 p-6 rounded-3xl shadow-sm flex items-start gap-4">
                    <Info size={24} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      {q.question_text && <h4 className="font-bold text-amber-900 text-sm mb-1">{q.question_text}</h4>}
                      {q.description && (
                        <p className="text-xs text-amber-800 font-medium whitespace-pre-line leading-relaxed">
                          {q.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // 4. Divider
              if (q.question_type === 'divider') {
                return (
                  <div key={q.id || idx} className="py-2">
                    <hr className="border-t-2 border-slate-200 border-dashed" />
                  </div>
                );
              }
            }

            // ==========================================
            // B. RENDER ELEMEN INPUT DATA INTERAKTIF
            // ==========================================
            return (
              <div
                key={q.id || idx}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header Pertanyaan */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {q.question_text} {q.is_required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {q.description && (
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {q.description}
                    </p>
                  )}
                </div>

                {/* Body Input Berdasarkan Tipe */}
                <div className="pt-1">
                  
                  {/* 1. Teks Singkat */}
                  {q.question_type === 'short_text' && (
                    <input
                      type="text"
                      className="w-full sm:w-3/4 border-b-2 border-slate-200 focus:border-brand-primary outline-none py-2 text-sm font-semibold text-slate-800 bg-transparent transition-colors placeholder:text-slate-300"
                      placeholder={q.placeholder || 'Jawaban singkat Anda...'}
                      value={(answers[q.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}

                  {/* 2. Teks Panjang / Textarea */}
                  {q.question_type === 'long_text' && (
                    <textarea
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-2xl p-4 text-sm font-medium text-slate-800 outline-none resize-none transition-colors placeholder:text-slate-300 leading-relaxed"
                      placeholder={q.placeholder || 'Tuliskan jawaban lengkap Anda di sini...'}
                      value={(answers[q.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}

                  {/* 3. Angka / Number */}
                  {q.question_type === 'number' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-1/2">
                      <Hash size={16} className="text-slate-400" />
                      <input
                        type="number"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                        placeholder={q.placeholder || '0'}
                        value={(answers[q.id] as number | string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 4. Nomor Telepon / WA */}
                  {q.question_type === 'phone' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-2/3">
                      <Phone size={16} className="text-slate-400" />
                      <input
                        type="tel"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                        placeholder={q.placeholder || '08xxxxxxxxxx'}
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 5. Alamat Email */}
                  {q.question_type === 'email' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-2/3">
                      <Mail size={16} className="text-slate-400" />
                      <input
                        type="email"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                        placeholder={q.placeholder || 'nama@domain.com'}
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 6. Alamat Lengkap */}
                  {q.question_type === 'address' && (
                    <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 w-full">
                      <MapPin size={18} className="text-slate-400 mt-1 shrink-0" />
                      <textarea
                        rows={3}
                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none leading-relaxed"
                        placeholder={q.placeholder || 'Ketik alamat lengkap domisili / kegiatan...'}
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 7. Tautan URL */}
                  {q.question_type === 'url' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-3/4">
                      <LinkIcon size={16} className="text-slate-400" />
                      <input
                        type="url"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                        placeholder={q.placeholder || 'https://example.com'}
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 8. Tanggal & Waktu */}
                  {q.question_type === 'date' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-1/2">
                      <Calendar size={16} className="text-slate-400" />
                      <input
                        type="date"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 cursor-pointer"
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {q.question_type === 'time' && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-1/3">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="time"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 cursor-pointer"
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    </div>
                  )}

                  {/* 9. Pilihan Ganda (Radio) */}
                  {q.question_type === 'radio' && q.options && (
                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isChecked = answers[q.id] === opt;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-dark font-bold shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`radio_${q.id}`}
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleAnswerChange(q.id, opt)}
                              className="w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 10. Kotak Centang (Checkbox) */}
                  {q.question_type === 'checkbox' && q.options && (
                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const currentArr = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                        const isChecked = currentArr.includes(opt);
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-brand-primary/10 border-brand-primary text-brand-dark font-bold shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleAnswerChange(q.id, opt, true)}
                              className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* 11. Dropdown (Select) */}
                  {q.question_type === 'select' && q.options && (
                    <select
                      className="w-full sm:w-2/3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-brand-primary font-bold text-sm text-slate-700 cursor-pointer"
                      value={(answers[q.id] as string) || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    >
                      <option value="">Pilih opsi...</option>
                      {q.options.map((opt, optIdx) => (
                        <option key={optIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* 12. Rating / Skala Kepuasan */}
                  {q.question_type === 'rating' && (
                    <RatingScaleInput
                      value={(answers[q.id] as number | string) || 0}
                      onChange={(val) => handleAnswerChange(q.id, val)}
                      scaleMax={q.layout_config?.scale_max || 5}
                      minLabel={q.layout_config?.scale_min_label}
                      maxLabel={q.layout_config?.scale_max_label}
                    />
                  )}

                  {/* 13. Tanda Tangan Digital (Signature) */}
                  {q.question_type === 'signature' && (
                    <DigitalSignaturePad
                      value={(answers[q.id] as string) || ''}
                      onChange={(url) => handleAnswerChange(q.id, url)}
                      required={q.is_required}
                    />
                  )}

                  {/* 14. Foto Kamera Langsung */}
                  {q.question_type === 'camera_capture' && (
                    <CameraCaptureInput
                      value={(answers[q.id] as string) || ''}
                      onChange={(url) => handleAnswerChange(q.id, url)}
                    />
                  )}

                  {/* 15. Deteksi Lokasi GPS */}
                  {q.question_type === 'geolocation' && (
                    <GeolocationInput
                      value={answers[q.id]}
                      onChange={(geoObj) => handleAnswerChange(q.id, geoObj)}
                    />
                  )}

                  {/* 16. Unggah Berkas Dokumen */}
                  {q.question_type === 'file_upload' && (
                    <FileUploadInput
                      value={(answers[q.id] as string) || ''}
                      onChange={(url) => handleAnswerChange(q.id, url)}
                      maxSizeMb={q.validation_rules?.max_file_size_mb || 10}
                    />
                  )}

                </div>
              </div>
            );
          })}

          {/* Tombol Kirim Jawaban */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-brand-dark hover:bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={18} /> Mengirim Jawaban...</>
              ) : (
                <><CheckCircle2 size={18} /> Kirim Formulir</>
              )}
            </button>
            <p className="text-[11px] font-bold text-slate-400">Garut Satu Data • Diskominfo</p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PublicForm;