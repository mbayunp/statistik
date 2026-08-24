import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Beranda from './pages/Beranda';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Tentang from './pages/Tentang';
import Kegiatan from './pages/Kegiatan';
import PublicForm from './pages/PublicForm';
import LinkRedirect from './pages/LinkRedirect';

import Dashboard from './pages/admin/Dashboard';
import RekapanKegiatan from './pages/admin/RekapanKegiatan';
import KegiatanPublik from './pages/admin/KegiatanPublik';
import DataPegawai from './pages/admin/DataPegawai';
import SuratPage from './pages/admin/SuratPage';
import Kontak from './pages/Kontak';
import DaftarStatistikAdmin from './pages/admin/DaftarStatistik';
import AdminLayout from './pages/admin/AdminLayout';
import BerkasArsip from './pages/admin/BerkasArsip';
import KeuanganPage from './pages/admin/KeuanganPage';
import PenugasanPage from './pages/admin/PenugasanPage';
import AsetBidang from './pages/admin/AsetBidang';
import RekapanPermohonan from './pages/admin/RekapanPermohonan';
import LaporanBulanan from './pages/admin/LaporanBulanan';
import LaporanKinerjaPegawai from './pages/admin/LaporanKinerjaPegawai';
import FormulirList from './pages/admin/FormulirList';
import FormBuilder from './pages/admin/FormBuilder';
import FormulirResponses from './pages/admin/FormulirResponses';
import ShortlinkList from './pages/admin/ShortlinkList';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import { isTokenExpired, handleSessionExpired } from './utils/auth';
import KalenderAdmin from './pages/admin/KalenderUtama';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const expired = isTokenExpired(token);

  React.useEffect(() => {
    if (!token || expired) {
      handleSessionExpired('Sesi login Anda telah berakhir atau belum terautentikasi (Error 403). Silakan login kembali.');
    }
  }, [token, expired]);

  if (!token || expired) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <span className="font-black text-2xl">403</span>
          </div>
          <h2 className="text-xl font-black mb-2">Sesi Login Berakhir</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Masa berlaku token login Anda telah habis atau Anda belum terautentikasi. Silakan masuk kembali ke Menu Login Admin.
          </p>
          <button 
            onClick={() => handleSessionExpired('Membuka Halaman Login Admin...')}
            className="w-full bg-brand-primary hover:bg-brand-dark text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            Ke Menu Login Admin
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* === GRUP HALAMAN PUBLIK === */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Beranda />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/kegiatan" element={<Kegiatan />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/form/:slug" element={<PublicForm />} />
          <Route path="/s/:code" element={<LinkRedirect />} />
        </Route>

        {/* === GRUP AUTH === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* === GRUP HALAMAN ADMIN === */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rekapan" element={<RekapanKegiatan />} />
          <Route path="kegiatan" element={<KegiatanPublik />} />
          <Route path="pegawai" element={<DataPegawai />} />
          
          <Route path="surat" element={<Navigate to="/admin/surat/masuk" replace />} />
          <Route path="surat/:type" element={<SuratPage />} />
          
          <Route path="daftar-kegiatan" element={<DaftarStatistikAdmin />} />
          <Route path="berkas-arsip" element={<BerkasArsip />} />
          <Route path="keuangan/:jenis" element={<KeuanganPage />} />
          <Route path="keuangan/:jenis/:kategori" element={<KeuanganPage />} />
          <Route path="penugasan" element={<PenugasanPage />} />
          <Route path="aset" element={<AsetBidang />} />
          <Route path="rekapan-permohonan" element={<RekapanPermohonan />} />
          <Route path="kalender" element={<KalenderAdmin />} />
          <Route path="laporan-tenaga-ahli" element={<LaporanBulanan />} />
          <Route path="laporan-kinerja" element={<LaporanKinerjaPegawai />} />
          <Route path="formulir" element={<FormulirList />} />
          <Route path="formulir/builder" element={<FormBuilder />} />
          <Route path="formulir/edit/:id" element={<FormBuilder />} />
          <Route path="formulir/responses/:formId" element={<FormulirResponses />} />
          <Route path="tautan" element={<ShortlinkList />} />
          <Route path="riwayat-aktivitas" element={<ActivityLogPage />} />
        </Route>

        {/* 404 - Page Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;