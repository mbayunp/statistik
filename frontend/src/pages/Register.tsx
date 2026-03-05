import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import { API_BASE_URL } from '../config';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password });
      
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Akun admin berhasil dibuat, silakan login.',
        confirmButtonColor: '#00D2B4'
      }).then(() => {
        navigate('/login');
      });

    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan saat mendaftar.',
        confirmButtonColor: '#00D2B4'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-brand-primary/10 border border-slate-100 overflow-hidden">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>
          
          <h2 className="text-3xl font-black text-brand-dark text-center mb-2">Daftar Admin</h2>
          <p className="text-slate-400 text-center text-sm mb-10 font-medium tracking-tight">
            Buat akun baru untuk mengelola portal
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Username Baru"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-brand-dark text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <UserPlus size={20} /> DAFTAR SEKARANG
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun? <Link to="/login" className="text-brand-primary font-bold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;