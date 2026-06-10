import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { motion } from 'motion/react';
import { Mail, Lock, User, MapPin, Building2, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { user, login, register } = useAuth();
  const { clearAllData } = useData();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [address, setAddress] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMessage(null);
    try {
      if (isRegister) {
        if (!businessName || !email || !password) {
          throw new Error('Silakan lengkapi data wajib.');
        }
        clearAllData();
        await register({ businessName, ownerName, businessType: businessType as any, address, email, password });
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Terjadi kesalahan sistem.');
      console.error('Auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] dark:bg-zinc-950 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-2" />
          <p className="text-gray-500 dark:text-zinc-400 text-sm text-center px-4">
            {isRegister ? 'Solusi Digital untuk UMKM Anda' : 'daftarkan usaha dengan amanah, karena setiap transaksi akan dipertanggungjawabkan'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-gray-400 dark:text-zinc-600 size-5" />
                <input 
                  type="text" placeholder="Nama Usaha" 
                  value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 dark:text-zinc-600 size-5" />
                <input 
                  type="text" placeholder="Nama Pemilik" 
                  value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={businessType} onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="retail">Perdagangan</option>
                  <option value="fnb">F&B</option>
                  <option value="health">Kesehatan</option>
                  <option value="service">Jasa</option>
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-zinc-600 size-5" />
                <input 
                  type="text" placeholder="Alamat" 
                  value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 dark:text-zinc-600 size-5" />
            <input 
              type="email" placeholder="Email" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 dark:text-zinc-600 size-5" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 dark:text-zinc-600 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? 'Daftar Sekarang' : 'Masuk'}
                <ChevronRight className="size-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-gray-600 dark:text-zinc-400 hover:text-primary transition-colors"
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar sekarang'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
