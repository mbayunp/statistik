import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Beranda from './pages/Beranda';
import Login from './pages/Login';
import Register from './pages/Register';
import Tentang from './pages/Tentang';
import Kegiatan from './pages/Kegiatan';

// Import Halaman Admin
import Dashboard from './pages/admin/Dashboard';
import RekapanKegiatan from './pages/admin/RekapanKegiatan';
import KegiatanPublik from './pages/admin/KegiatanPublik';
import DataPegawai from './pages/admin/DataPegawai';
import SuratMasuk from './pages/admin/SuratMasuk';
import Kontak from './pages/Kontak';
import DaftarStatistikAdmin from './pages/admin/DaftarStatistik';
import AdminLayout from './pages/admin/AdminLayout';

// 1. Komponen untuk memproteksi halaman Admin
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token'); // Ambil token dari storage
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 2. Layout khusus halaman Publik (Navbar + Footer)
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Outlet /> {/* Halaman anak akan muncul di sini */}
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
        </Route>

        {/* === GRUP AUTH (Tanpa Navbar/Footer) === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* === GRUP HALAMAN ADMIN (Diproteksi) === */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              {/* Bungkus Outlet dengan AdminLayout di sini! */}
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
          <Route path="surat" element={<SuratMasuk />} />
          <Route path="daftar-kegiatan" element={<DaftarStatistikAdmin />} />
        </Route>

        {/* 404 - Page Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;