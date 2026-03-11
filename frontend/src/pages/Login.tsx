import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import { API_BASE_URL } from '../config';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      
      localStorage.setItem('token', res.data.token);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Selamat datang di Dashboard Admin',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin');
      });

    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: err.response?.data?.message || 'Username atau password salah!',
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
          
          <h2 className="text-3xl font-black text-brand-dark text-center mb-2">Masuk Admin</h2>
          <p className="text-slate-400 text-center text-sm mb-10 font-medium tracking-tight">
            Kelola portal Bidang Penyelenggaraan Statistik Sektoral
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Username"
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
                placeholder="Password"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all font-medium text-brand-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
              MASUK <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-brand-primary transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
            </Link>

            <div className="h-px bg-slate-100 w-full"></div>

            <p className="text-center text-sm text-slate-500">
              Belum punya akun? <Link to="/register" className="text-brand-primary font-bold hover:underline">Daftar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;