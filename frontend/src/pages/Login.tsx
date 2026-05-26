import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import { API_BASE_URL } from '../config';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      
      localStorage.setItem('token', res.data.token);
      
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Selamat datang di Dashboard Admin',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          title: 'text-brand-dark font-black',
          popup: 'rounded-3xl shadow-2xl border border-slate-100'
        }
      }).then(() => {
        navigate('/admin');
      });

    } catch (err) {
      let message = 'Terjadi kesalahan saat Login.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: message,
        confirmButtonColor: '#00D2B4',
        customClass: {
          popup: 'rounded-3xl shadow-2xl border border-slate-100'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden z-0">
      
      {/* Ornamen Background Glow (Ambient) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-secondary/20 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse-slow delay-1000"></div>

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,210,180,0.08)]">
        <div className="p-10">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full scale-150 -z-10"></div>
            <img src={logo} alt="Logo Garut Satu Data" className="h-16 w-auto relative z-10 drop-shadow-sm" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 text-center mb-2 tracking-tight">Masuk Admin</h2>
          <p className="text-slate-500 text-center text-sm mb-10 font-medium leading-relaxed">
            Kelola portal Bidang Penyelenggaraan Statistik Sektoral
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Username */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors duration-300">
                <User size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Username"
                className="w-full bg-slate-100/50 border border-slate-200/60 rounded-2xl py-4 pl-14 pr-5 focus:bg-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all duration-300 font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Input Password & Lupa Password */}
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-secondary transition-colors duration-300">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  className="w-full bg-slate-100/50 border border-slate-200/60 rounded-2xl py-4 pl-14 pr-14 focus:bg-white focus:border-brand-secondary/50 focus:ring-4 focus:ring-brand-secondary/10 outline-none transition-all duration-300 font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Toggle Show/Hide Password */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-brand-secondary transition-colors duration-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="flex justify-end px-2">
                <Link 
                  to="/reset-password" 
                  className="text-[10px] font-black text-slate-400 hover:text-amber-500 uppercase tracking-widest transition-colors duration-200"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>

            {/* Tombol Login */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-linear-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> 
                  MEMPROSES...
                </>
              ) : (
                <>
                  MASUK <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Navigasi Bawah */}
          <div className="mt-10 space-y-5">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-full h-px bg-slate-200"></div>
              <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                ATAU
              </span>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              Belum punya akun admin?{' '}
              <Link to="/register" className="text-brand-primary font-bold hover:text-brand-secondary hover:underline transition-colors">
                Daftar di sini
              </Link>
            </p>

            <div className="pt-2">
              <Link 
                to="/" 
                className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
                Kembali ke Beranda
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;