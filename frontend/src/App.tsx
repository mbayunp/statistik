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
import FormulirList from './pages/admin/FormulirList';
import FormBuilder from './pages/admin/FormBuilder';
import FormulirResponses from './pages/admin/FormulirResponses';
import ShortlinkList from './pages/admin/ShortlinkList';
import ActivityLogPage from './pages/admin/ActivityLogPage';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
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
          <Route path="laporan-tenaga-ahli" element={<LaporanBulanan />} />
          <Route path="formulir" element={<FormulirList />} />
          <Route path="formulir/builder" element={<FormBuilder />} />
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