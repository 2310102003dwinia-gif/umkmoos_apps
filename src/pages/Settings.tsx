import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun, 
  BookOpen, 
  Camera, 
  MapPin, 
  Mail, 
  Save, 
  Check,
  Plus,
  Palette,
  ShieldCheck,
  Lock,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [activeSegment, setActiveSegment] = useState<'profile' | 'security' | 'payment' | 'system' | 'sharia'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    businessName: user?.businessName || '',
    ownerName: user?.ownerName || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const colors = [
    { name: 'Forest Green', value: '#054d24' },
    { name: 'Navy Blue', value: '#1e3a8a' },
    { name: 'Burgundy', value: '#7f1d1d' },
    { name: 'Deep Zinc', value: '#18181b' },
  ];

  const handleSave = async () => {
    setErrorMsg(null);
    try {
      if (activeSegment === 'profile') {
        await updateProfile(profileData);
      } else if (activeSegment === 'security') {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
          throw new Error('Mohon isi semua kolom password.');
        }
        if (passwordData.new !== passwordData.confirm) {
          throw new Error('Password baru dan konfirmasi tidak sesuai.');
        }
        if (passwordData.new.length < 6) {
          throw new Error('Password baru minimal 6 karakter.');
        }
        await changePassword(passwordData.current, passwordData.new);
        setPasswordData({ current: '', new: '', confirm: '' });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Terjadi kesalahan.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
          <p className="text-gray-500 dark:text-zinc-400">Sesuaikan aplikasi UMKMoo's dengan identitas bisnis Anda.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          {isSaved ? <Check className="size-5" /> : <Save className="size-5" />}
          {isSaved ? 'Berhasil Disimpan' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', name: 'Profil Pengguna', icon: User },
            { id: 'security', name: 'Keamanan Akun', icon: Lock },
            { id: 'payment', name: 'Metode Pembayaran', icon: CreditCard },
            { id: 'system', name: 'Sistem & Tampilan', icon: Globe },
            { id: 'sharia', name: 'Akuntansi Syariah', icon: BookOpen },
          ].map(seg => (
            <button
              key={seg.id}
              onClick={() => setActiveSegment(seg.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all",
                activeSegment === seg.id 
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm border border-gray-100 dark:border-zinc-700" 
                  : "text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
              )}
            >
              <seg.icon className="size-5" />
              {seg.name}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeSegment === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-8"
              >
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img 
                      src={user?.avatarUrl} 
                      className="w-24 h-24 rounded-[32px] border-4 border-primary/10 object-cover shadow-xl"
                    />
                    <button className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 text-primary hover:scale-110 transition-all">
                      <Camera className="size-4" />
                    </button>
                  </div>
                  <h3 className="mt-4 font-bold text-xl dark:text-white">{user?.ownerName}</h3>
                  <p className="text-gray-400 text-sm">{user?.businessName}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Usaha</label>
                    <input 
                      type="text" 
                      value={profileData.businessName} 
                      onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full px-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Pemilik</label>
                    <input 
                      type="text" 
                      value={profileData.ownerName} 
                      onChange={(e) => setProfileData(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full px-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Usaha</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={profileData.address} 
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSegment === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-8"
              >
                <div>
                  <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                    <Lock className="size-5 text-primary" />
                    Ubah Password
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Gunakan password yang kuat untuk melindungi akun bisnis Anda.</p>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-xs text-red-600 font-bold">
                    <AlertCircle className="size-4" />
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-6 max-w-md">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showPass.current ? "text" : "password"} 
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-4 top-3 text-gray-400 dark:text-zinc-600 hover:text-primary transition-colors"
                      >
                        {showPass.current ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gray-100 dark:bg-zinc-800 w-full" />

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showPass.new ? "text" : "password"} 
                        value={passwordData.new}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-4 top-3 text-gray-400 dark:text-zinc-600 hover:text-primary transition-colors"
                      >
                        {showPass.new ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showPass.confirm ? "text" : "password"} 
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder="Masukkan kembali password baru"
                        className="w-full px-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-4 top-3 text-gray-400 dark:text-zinc-600 hover:text-primary transition-colors"
                      >
                        {showPass.confirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSegment === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg dark:text-white">Metode Pembayaran Digital</h3>
                  <button className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-xl">
                    <Plus className="size-4" /> Tambah Akun
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Bank Syariah Indonesia (BSI)', acc: '712****001', type: 'Rekening' },
                    { name: 'Gopay Merchant', acc: '0812-****-456', type: 'E-wallet' },
                    { name: 'OVO Business', acc: '0812-****-456', type: 'E-wallet' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-primary">
                          <CreditCard className="size-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{p.type} • {p.acc}</p>
                        </div>
                      </div>
                      <button className="text-red-500 font-bold text-xs hover:underline">Hapus</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSegment === 'system' && (
              <motion.div
                key="system"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-sm space-y-10"
              >
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white"><Sun className="size-5" /> Tampilan & Tema</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={cn(
                        "flex items-center justify-center gap-3 p-6 rounded-3xl border transition-all",
                        theme === 'light' 
                          ? "bg-white border-primary text-primary shadow-md" 
                          : "bg-zinc-800 text-gray-400 border-zinc-700"
                      )}
                    >
                      <Sun className="size-5" /> Mode Terang
                    </button>
                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={cn(
                        "flex items-center justify-center gap-3 p-6 rounded-3xl border transition-all",
                        theme === 'dark' 
                          ? "bg-zinc-900 border-white text-white shadow-md shadow-zinc-400/20" 
                          : "bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border-gray-100 dark:border-zinc-700"
                      )}
                    >
                      <Moon className="size-5" /> Mode Gelap
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white"><Palette className="size-5" /> Warna Aksen Dashboard</h3>
                   <div className="flex flex-wrap gap-4">
                      {colors.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setAccentColor(c.value)}
                          className={cn(
                            "w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110",
                            accentColor === c.value ? "border-white dark:border-zinc-900 ring-2 ring-primary" : "border-transparent"
                          )}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <h3 className="font-bold text-lg flex items-center gap-2"><Globe className="size-5" /> Bahasa Aplikasi</h3>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => setLanguage('id')}
                        className={cn("px-6 py-3 rounded-2xl font-bold text-sm", language === 'id' ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500")}
                      >
                        Bahasa Indonesia
                      </button>
                      <button 
                        onClick={() => setLanguage('en')}
                        className={cn("px-6 py-3 rounded-2xl font-bold text-sm", language === 'en' ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500")}
                      >
                        English (US)
                      </button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeSegment === 'sharia' && (
              <motion.div
                key="sharia"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-10 rounded-[40px] border border-gray-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 mb-8">
                  <div className="flex items-center gap-4 text-primary mb-6">
                    <ShieldCheck className="size-16" />
                    <div>
                      <h3 className="text-2xl font-bold dark:text-white">UMKM Berkah Syariah</h3>
                      <p className="opacity-70 font-medium dark:text-zinc-400">Prinsip Akuntansi Syariah Terintegrasi</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-zinc-300 leading-relaxed font-medium">
                    umkmoo's membantu Anda menerapkan prinsip-prinsip ekonomi Islam dalam operasional sehari-hari. 
                    Setiap transaksi dipantau menggunakan algoritma AI untuk memastikan tidak adanya unsur riba, gharar, atau maysir.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-primary" /> Akad Murabahah
                     </h4>
                     <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal">
                       Digunakan untuk jual beli barang dagangan dimana harga beli dan keuntungan (margin) disepakati secara transparan oleh kedua pihak.
                     </p>
                   </div>
                   <div className="space-y-3">
                     <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-primary" /> Akad Mudharabah
                     </h4>
                     <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal">
                       Digunakan untuk barang titipan (konsinyasi) dimana pemilik modal dan pengelola (toko) membagi keuntungan sesuai porsi yang disepakati.
                     </p>
                   </div>
                </div>

                <div className="mt-12 text-center p-6 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sertifikasi Sistem</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Sistem ini dikembangkan sesuai kaidah pengelolaan UMKM yang amanah dan transparan.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
