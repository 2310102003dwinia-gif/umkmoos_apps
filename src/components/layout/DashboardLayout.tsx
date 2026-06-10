import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../ui/Logo';
import { cn, formatCurrency } from '../../lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  MessageCircle,
  X,
  Send,
  Coins,
  Clock,
  Sun,
  Moon,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Halo! Apa ada yang bisa kami bantu hari ini?', isBot: true, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      text: chatMessage,
      isBot: false,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');

    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: 'Terima kasih atas pertanyaannya. Tim dukungan kami akan segera merespons pesan Anda.',
        isBot: true,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const menuItems = [
    { name: t('dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('cashier'), path: '/cashier', icon: ShoppingCart },
    { name: t('inventory'), path: '/inventory', icon: Package },
    { name: t('employees'), path: '/employees', icon: Users },
    { name: t('zakat'), path: '/zakat', icon: Coins },
    { name: t('reports'), path: '/reports', icon: BarChart3 },
    { name: 'Tutup Kas', path: '/clerking', icon: Wallet },
    { name: t('settings'), path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-primary"
                )}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="size-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 rounded-full px-4 py-2 border border-gray-200 dark:border-zinc-700">
              <Clock className="size-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">{formattedTime}</span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center bg-gray-50 dark:bg-zinc-800 rounded-full px-4 py-2 w-64 border border-gray-200 dark:border-zinc-700 h-10">
              <Search className="size-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder={t('search')} 
                className="bg-transparent border-none focus:outline-none text-sm w-full dark:text-gray-100 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-zinc-400 hover:text-primary transition-colors bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700"
              title={theme === 'light' ? 'Nyalakan Mode Gelap' : 'Nyalakan Mode Terang'}
            >
              {theme === 'light' ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={cn(
                  "relative p-2 text-gray-500 dark:text-zinc-400 hover:text-primary transition-all bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700",
                  isNotificationOpen && "ring-2 ring-primary/20 text-primary border-primary/20"
                )}
                title="Notifikasi"
              >
                <Bell className="size-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 font-bold">
                  3
                </span>
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Notifikasi</h4>
                        <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">3 Baru</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                              <Package className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Stok Menipis!</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Beras Premium sisa 5 kg lagi.</p>
                              <p className="text-[9px] text-gray-400 mt-2">10 menit yang lalu</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Transaksi Berhasil</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Penjualan baru sebesar Rp 150.000</p>
                              <p className="text-[9px] text-gray-400 mt-2">25 menit yang lalu</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <Clock className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Shift Berakhir</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">Shift Pagi telah berakhir pukul 15:00.</p>
                              <p className="text-[9px] text-gray-400 mt-2">1 jam yang lalu</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full py-3 text-[10px] font-bold text-primary hover:bg-primary-light transition-all text-center">
                        LIHAT SEMUA NOTIFIKASI
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-zinc-800">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{user?.businessName}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    user?.status === 'online' ? "bg-green-500" : "bg-gray-400"
                  )} />
                  <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {user?.status === 'online' ? t('online') : t('offline')}
                  </span>
                </div>
              </div>
              <img 
                src={user?.avatarUrl} 
                alt={user?.ownerName}
                className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-zinc-950">
          <Outlet />
        </div>
      </main>

      {/* Floating Chat Center */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 right-0 w-80 h-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col"
            >
              <div className="bg-primary p-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">{t('chat')}</h3>
                   <p className="text-[10px] opacity-80">Kami siap membantu UMKM Anda</p>
                </div>
                <button onClick={() => setIsChatOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 p-4 bg-gray-50 dark:bg-zinc-800 overflow-auto flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-3 rounded-2xl shadow-sm text-xs max-w-[85%] relative group",
                      msg.isBot 
                        ? "bg-white dark:bg-zinc-900 rounded-tl-none self-start text-gray-700 dark:text-zinc-300" 
                        : "bg-primary text-white rounded-tr-none self-end"
                    )}
                  >
                    {msg.text}
                    <p className={cn(
                      "text-[8px] mt-1 opacity-50",
                      msg.isBot ? "text-gray-400" : "text-white"
                    )}>
                      {msg.time}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative flex items-center gap-2"
                >
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-zinc-100 pr-12"
                  />
                  <button 
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="absolute right-1 p-2 bg-primary text-white rounded-full hover:opacity-90 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-110 transition-transform"
        >
          <MessageCircle className="size-6" />
        </button>
      </div>
    </div>
  );
}
