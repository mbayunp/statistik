import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Key, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import { API_BASE_URL } from '../config';

const ResetPassword: React.FC = () => {
  // State untuk mengontrol gerbang PIN
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  // State untuk form reset
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Fungsi untuk mengecek PIN ke Backend
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-pin`, { pin });
      
      // Jika PIN benar, buka gembok halaman
      setIsUnlocked(true);
      Swal.fire({
        icon: 'success',
        title: 'Akses Dibuka!',
        text: 'Silakan reset password admin.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'PIN Keamanan salah!',
        confirmButtonColor: '#00D2B4'
      });
      setPin('');
    }
  };

  // Fungsi untuk mereset password (setelah gembok terbuka)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Password baru dan konfirmasi tidak cocok!',
        confirmButtonColor: '#00D2B4'
      });
    }

    try {
      // Mengirimkan username, password baru, dan PIN sebagai validasi akhir
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { 
        username, 
        newPassword, 
        pin 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password admin berhasil direset, silakan login dengan password baru.',
        confirmButtonColor: '#00D2B4'
      }).then(() => {
        navigate('/login');
      });

    } catch (err) {
      let message = 'Terjadi kesalahan saat mereset password.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mereset',
        text: message,
        confirmButtonColor: '#00D2B4'
      });
    }
  };

  // ==========================================
  // TAMPILAN 1: GERBANG PIN
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 border border-slate-100 overflow-hidden">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <h2 className="text-3xl font-black text-brand-dark text-center mb-2">Reset Darurat</h2>
            <p className="text-slate-400 text-center text-sm mb-10 font-medium tracking-tight">
              Masukkan PIN Keamanan untuk membuka halaman reset password admin
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-6">
              <div className="relative group">
                <Key className="absolute left-4 top-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="Masukkan PIN Rahasia"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all font-medium text-brand-dark"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                <Lock size={20} /> BUKA HALAMAN RESET
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
              Kembali ke <Link to="/login" className="text-brand-primary font-bold hover:underline">Halaman Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: FORM RESET PASSWORD (Jika sudah unlock)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 border border-slate-100 overflow-hidden">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-brand-dark text-center mb-2">Ganti Password</h2>
          <p className="text-slate-400 text-center text-sm mb-10 font-medium tracking-tight">
            Masukkan username admin dan password baru.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Username Admin"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium text-brand-dark"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-brand-secondary transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Password Baru"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all font-medium text-brand-dark"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-brand-secondary transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Konfirmasi Password Baru"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all font-medium text-brand-dark"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-brand-dark text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Key size={20} /> SIMPAN PASSWORD BARU
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;