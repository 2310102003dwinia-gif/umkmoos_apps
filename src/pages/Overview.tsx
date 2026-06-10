import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, cn } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight,
  Eye,
  Download,
  Printer,
  FileText,
  X,
  Wallet,
  Clock,
  History,
  User,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { Sale } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const data = [
  { name: 'Sen', sales: 4000, profit: 2400 },
  { name: 'Sel', sales: 3000, profit: 1398 },
  { name: 'Rab', sales: 2000, profit: 9800 },
  { name: 'Kam', sales: 2780, profit: 3908 },
  { name: 'Jum', sales: 1890, profit: 4800 },
  { name: 'Sab', sales: 2390, profit: 3800 },
  { name: 'Min', sales: 3490, profit: 4300 },
];

export default function Overview() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { products, attendance, sales, clerkingRecords, appMode, setAppMode } = useData();
  const { theme } = useTheme();
  const [greeting, setGreeting] = React.useState('');
  const [selectedTransaction, setSelectedTransaction] = React.useState<Sale[]>([]);
  const [showSaleDetail, setShowSaleDetail] = React.useState(false);
  const detailReceiptRef = React.useRef<HTMLDivElement>(null);

  // Group sales into transactions
  const transactionGroups = useMemo(() => {
    const groups: { [key: string]: Sale[] } = {};
    sales.forEach(sale => {
      // Fallback for legacy sales without transactionId
      const id = sale.transactionId || `${sale.transactionTime}-${sale.cashierId}`;
      if (!groups[id]) groups[id] = [];
      groups[id].push(sale);
    });
    return Object.values(groups).sort((a, b) => {
      // Sort by transaction time (latest first)
      const timeA = new Date(a[0].transactionTime.split(',').join('')).getTime() || 0;
      const timeB = new Date(b[0].transactionTime.split(',').join('')).getTime() || 0;
      return timeB - timeA;
    });
  }, [sales]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (ref.current) {
      try {
        const dataUrl = await toPng(ref.current, {
          backgroundColor: document.documentElement.classList.contains('dark') ? '#18181b' : '#ffffff',
          quality: 1.0,
          pixelRatio: 3,
        });
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Gagal menyimpan gambar:', error);
      }
    }
  };

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat pagi');
    else if (hour < 15) setGreeting('Selamat siang');
    else if (hour < 18) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');
  }, []);

  const lowStockCount = products.filter(p => p.stock < 10).length;
  const todayDate = new Date().toLocaleDateString('id-ID');
  const todayTransactions = transactionGroups.filter(t => t[0].transactionTime.split(',')[0].trim() === todayDate);
  const totalTodayIncome = todayTransactions.reduce((acc, t) => 
    acc + t.reduce((sum, item) => sum + item.totalPrice, 0), 0
  );
  
  const lastClerking = clerkingRecords.length > 0 ? clerkingRecords[0] : null;
  const totalDifference = clerkingRecords.reduce((acc, r) => acc + r.difference, 0);

  const stats = [
    { title: 'Pendapatan Hari Ini', value: totalTodayIncome, label: `${todayTransactions.length} Transaksi`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary-light' },
    { title: 'Stok Menipis', value: lowStockCount, label: 'Perlu Reorder', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Selisih Kas (Audit)', value: totalDifference, label: 'Total Selisih Akumulasi', icon: lastClerking?.status === 'KURANG' ? TrendingDown : TrendingUp, color: totalDifference >= 0 ? 'text-green-600' : 'text-red-600', bg: totalDifference >= 0 ? 'bg-green-100' : 'bg-red-100' },
    { title: 'Status Terakhir', value: lastClerking?.status || 'B/L Ada', label: lastClerking ? `Shift ${lastClerking.shift}` : 'Belum Tutup Kas', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Header with Professional / Trial Mode Control */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900/60 p-6 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {greeting}, {user?.ownerName}! 
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Mengelola <span className="font-semibold text-primary dark:text-primary-light">{user?.businessName}</span> • Mode Bisnis Aktif: 
            <span className={cn(
              "ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold leading-none inline-flex items-center gap-1",
              appMode === 'trial' 
                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" 
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            )}>
              {appMode === 'trial' ? 'Data Trial' : 'Profesional'}
            </span>
          </p>
        </div>

        {/* Rounded Segmented Mode Controller */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl md:self-center self-start">
          <button
            onClick={() => setAppMode('professional')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              appMode === 'professional'
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <ShieldCheck className="size-4 text-emerald-500" />
            Mode Profesional
          </button>
          <button
            onClick={() => setAppMode('trial')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              appMode === 'trial'
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Sparkles className="size-4" />
            Data Trial
          </button>
        </div>
      </div>

      {/* Mode Informational Banner */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={appMode}
        className={cn(
          "p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 shadow-sm",
          appMode === 'trial'
            ? "bg-amber-50/50 border-amber-200/40 text-amber-800 dark:bg-amber-950/10 dark:border-amber-900/30 dark:text-amber-300"
            : "bg-emerald-50/40 border-emerald-200/30 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/20 dark:text-emerald-300"
        )}
      >
        <div className={cn(
          "p-2.5 rounded-xl flex-shrink-0 mt-0.5",
          appMode === 'trial' 
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        )}>
          {appMode === 'trial' ? <Sparkles className="size-4" /> : <ShieldCheck className="size-4" />}
        </div>
        <div>
          <h4 className="text-sm font-bold">
            {appMode === 'trial' 
              ? 'Mode Demostrasi Aktif: Penjualan Seblak Prasmanan' 
              : 'Mode Profesional Aktif: Siap Digunakan'}
          </h4>
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            {appMode === 'trial'
              ? 'Telah memuat dummy data komplit meliputi menu prasmanan seblak kustom, staff kasir, dan grafik histori penjualan interaktif. Anda bebas menambah transaksi baru atau menguji fitur cetak struk tanpa mengotori rekam keuangan asli Anda.'
              : 'Seluruh rekam data yang Anda masukkan manual di mode ini (kategori, produk kasir, karyawan, dan pencatatan transaksi) akan tersimpan secara aman & permanen khusus untuk bisnis riil Anda.'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="size-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">{stat.title}</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
            </h3>
            {stat.label && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{stat.label}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h3 className="font-bold text-gray-900 dark:text-white">Riwayat Transaksi Terakhir</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{transactionGroups.length} Transaksi</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID / Kasir</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {transactionGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm italic">Belum ada transaksi terekam.</td>
                </tr>
              ) : (
                transactionGroups.slice(0, 10).map((group) => {
                  const firstItem = group[0];
                  const transactionTotal = group.reduce((sum, item) => sum + item.totalPrice, 0);
                  const itemCount = group.reduce((sum, item) => sum + item.quantity, 0);
                  const transactionId = firstItem.transactionId || firstItem.id.slice(0, 8).toUpperCase();
                  
                  return (
                    <tr key={transactionId} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{firstItem.transactionTime.split(',')[1]}</p>
                        <p className="text-[10px] text-gray-400">{firstItem.transactionTime.split(',')[0]}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-mono text-gray-400">#{transactionId}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="size-3 text-primary" />
                          <p className="text-[10px] font-bold text-gray-700 dark:text-zinc-300 capitalize">{firstItem.cashierId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-gray-500">
                              {group.length} Jenis
                           </div>
                           <p className="text-xs font-medium text-gray-600 dark:text-zinc-400">
                              {itemCount} Produk Total
                           </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-primary">{formatCurrency(transactionTotal)}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">{firstItem.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => { setSelectedTransaction(group); setShowSaleDetail(true); }}
                          className="p-2 bg-primary-light text-primary rounded-xl hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                          title="Lihat Struk"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showSaleDetail && selectedTransaction.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-gray-50 dark:bg-zinc-800 flex items-center justify-between border-b border-gray-100 dark:border-zinc-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Detail Transaksi</h3>
                </div>
                <button 
                  onClick={() => { setShowSaleDetail(false); setSelectedTransaction([]); }} 
                  className="p-2 bg-white dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm border border-gray-100 dark:border-zinc-700"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div ref={detailReceiptRef} className="p-8 font-mono text-xs text-gray-800 dark:text-zinc-300 space-y-4 print-receipt overflow-y-auto flex-1 bg-white dark:bg-zinc-900">
                <div className="text-center border-b border-dashed border-gray-300 dark:border-zinc-700 pb-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">{user?.businessName}</h2>
                  <p>{user?.address}</p>
                </div>
                
                <div className="flex justify-between">
                  <span>No. Trans:</span>
                  <span className="font-bold">#{ (selectedTransaction[0].transactionId || selectedTransaction[0].id.slice(0, 8)).toUpperCase() }</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span className="font-bold">{selectedTransaction[0].cashierId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span className="font-bold">{selectedTransaction[0].transactionTime}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 dark:border-zinc-700 py-4 space-y-4">
                  {selectedTransaction.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {product?.name || 'Produk'}
                          </p>
                          <p className="text-[10px] text-gray-600 dark:text-zinc-500">
                             {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex justify-between font-black text-lg text-gray-900 dark:text-white">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(selectedTransaction.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Metode Bayar:</span>
                    <span className="uppercase text-primary">{selectedTransaction[0].paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-dashed border-gray-300 dark:border-zinc-700 opacity-60">
                   <p>Dokumen Digital Sah</p>
                   <p className="text-[10px] mt-2 font-sans italic">Hadir khusus oleh umkmoo's AI System</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-2 no-print border-t border-gray-100 dark:border-zinc-700 flex-shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="flex-1 bg-gray-50 dark:bg-zinc-800 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Printer className="size-4" /> Cetak
                  </button>
                  <button 
                    onClick={() => handleSaveImage(detailReceiptRef, `Struk_${selectedTransaction[0].transactionId || selectedTransaction[0].id}`)}
                    className="flex-1 bg-gray-50 dark:bg-zinc-800 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Download className="size-4" /> Simpan
                  </button>
                </div>
                <button 
                  onClick={() => { setShowSaleDetail(false); setSelectedTransaction([]); }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Grafik Penjualan Harian</h2>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase">Hari Ini</div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales.slice().reverse().slice(0, 10).map(s => ({ name: s.transactionTime.split(',')[1].split('.')[0], sales: s.totalPrice }))}>
                <defs>
                   <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#f0f0f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: theme === 'dark' ? '#71717a' : '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: theme === 'dark' ? '#71717a' : '#999' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Clerking Terakhir</h2>
             <History className="size-4 text-gray-400" />
          </div>
          <div className="space-y-4 flex-1">
            {clerkingRecords.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Wallet className="size-12 text-gray-100 dark:text-zinc-800 mb-4" />
                <p className="text-sm text-gray-400 dark:text-zinc-500 font-bold">Belum Ada Tutup Kas.</p>
                <p className="text-[10px] text-gray-300 dark:text-zinc-600">Selesaikan shift Anda di menu Tutup Kas.</p>
              </div>
            ) : (
              clerkingRecords.slice(0, 3).map((record, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{record.date}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Shift {record.shift}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase",
                      record.status === 'SESUAI' ? "bg-green-100 text-green-600" : 
                      record.status === 'LEBIH' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                    )}>
                      {record.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] text-gray-400">Total Fisik</p>
                       <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(record.totalPhysicalCash)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-gray-400">Selisih</p>
                       <p className={cn(
                         "text-xs font-bold",
                         record.difference >= 0 ? "text-green-500" : "text-red-500"
                       )}>
                          {record.difference > 0 ? '+' : ''}{formatCurrency(record.difference)}
                       </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/clerking" className="mt-8 w-full py-4 bg-primary text-white text-center rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
             Tutup Kas Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
