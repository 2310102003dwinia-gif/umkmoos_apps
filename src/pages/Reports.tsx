import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { 
  FileBox, 
  Download, 
  Calendar, 
  Lock, 
  Eye, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowRight,
  ShieldCheck,
  X,
  Printer,
  FileText,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

export default function Reports() {
  const { t } = useLanguage();
  const { sales, products } = useData();
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<typeof sales>([]);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const detailReceiptRef = useRef<HTMLDivElement>(null);

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

  // Group sales into transactions
  const transactionGroups = useMemo(() => {
    const groups: { [key: string]: typeof sales } = {};
    sales.forEach(sale => {
      const id = sale.transactionId || `${sale.transactionTime}-${sale.cashierId}`;
      if (!groups[id]) groups[id] = [];
      groups[id].push(sale);
    });
    return Object.values(groups).sort((a, b) => {
      const timeA = new Date(a[0].transactionTime.split(',').join('')).getTime() || 0;
      const timeB = new Date(b[0].transactionTime.split(',').join('')).getTime() || 0;
      return timeB - timeA;
    });
  }, [sales]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'owner123') { // Simple demo password
      setIsLocked(false);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isLocked) {
    return (
      <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-[40px] shadow-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center mb-6 text-primary">
            <Lock className="size-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Laporan Keamanan</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Hanya pemilik usaha yang dapat mengakses laporan keuangan. Masukkan kata sandi pemilik Anda.
          </p>
          
          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <input 
                type="password" 
                placeholder="Kata sandi (coba: owner123)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border focus:outline-none focus:ring-2 transition-all dark:text-white ${
                  error ? 'border-red-300 ring-red-100' : 'border-gray-100 dark:border-zinc-700 ring-primary/10'
                }`}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 dark:text-zinc-600" />
            </div>
            {error && <p className="text-xs text-red-500 font-bold">Kata sandi salah. Silakan coba lagi.</p>}
            <button 
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
            >
              Buka Laporan
            </button>
          </form>
          
          <p className="mt-8 text-[11px] text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1.5 uppercase tracking-widest">
            <ShieldCheck className="size-4" /> Enkripsi Keamanan umkmoo's
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports')}</h1>
          <p className="text-gray-500 dark:text-zinc-400">Rekapitulasi lengkap penjualan, stok, dan absensi karyawan.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setIsLocked(true)}
            className="p-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
            title="Kunci Laporan"
          >
            <Lock className="size-5" />
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Download className="size-5" /> Ekspor PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Laporan Penjualan', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/10', desc: 'Detail transaksi harian & bulanan' },
          { title: 'Laporan Absensi', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/10', desc: 'Rekap kehadiran & keterlambatan' },
          { title: 'Laporan Stok', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/10', desc: 'Histori pergerakan barang' },
        ].map((report, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
            <div className={`${report.bg} ${report.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
              <report.icon className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">{report.desc}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
              Lihat Selengkapnya <ArrowRight className="size-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="size-5 text-primary" /> Histori Transaksi Terakhir
          </h3>
          <div className="space-y-4">
             {transactionGroups.length === 0 ? (
               <div className="p-12 text-center text-gray-400">
                 <FileBox className="size-12 mx-auto mb-4 opacity-10" />
                 <p className="text-sm font-bold tracking-wide">Belum ada transaksi hari ini.</p>
               </div>
             ) : (
               transactionGroups.slice(0, 5).map((group, i) => {
                 const firstItem = group[0];
                 const transactionTotal = group.reduce((sum, item) => sum + item.totalPrice, 0);
                 const itemCount = group.reduce((sum, item) => sum + item.quantity, 0);
                 const transactionId = firstItem.transactionId || firstItem.id.slice(0, 8).toUpperCase();
                 
                 return (
                   <div key={transactionId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl shadow-sm flex items-center justify-center font-bold text-[10px] text-gray-400 dark:text-zinc-500 uppercase flex-shrink-0">
                         {firstItem.paymentMethod.slice(0, 2)}
                       </div>
                       <div>
                         <p className="text-xs font-mono font-bold text-gray-400">#{transactionId}</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                           {group.length} Kategori ({itemCount} item)
                         </p>
                         <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wider">
                           {firstItem.transactionTime} • {firstItem.paymentMethod}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="text-right">
                         <p className="text-sm font-bold text-primary">{formatCurrency(transactionTotal)}</p>
                         <p className="text-[10px] text-gray-400 dark:text-zinc-500 tracking-widest">{itemCount} pcs</p>
                       </div>
                       <button 
                         onClick={() => { setSelectedTransaction(group); setShowSaleDetail(true); }}
                         className="p-2 bg-primary-light text-primary rounded-xl hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                         title="Lihat Detail"
                       >
                         <Eye className="size-4" />
                       </button>
                     </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>

        <div className="bg-primary p-8 rounded-[32px] text-white flex flex-col justify-between shadow-2xl shadow-primary/30">
          <div>
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="size-6" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Penjualan Kotor Hari Ini</h3>
            <p className="text-sm opacity-70 leading-relaxed font-normal">
              Total pendapatan kotor dari seluruh transaksi yang berhasil divalidasi oleh sistem Syariah umkmoo's.
            </p>
          </div>
          <div className="mt-12 flex items-baseline gap-2">
            <h4 className="text-4xl font-bold">
              {formatCurrency(sales.reduce((sum, s) => sum + s.totalPrice, 0))}
            </h4>
            <span className="text-xs opacity-60">Real-time update</span>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal for Reports */}
      <AnimatePresence>
        {showSaleDetail && selectedTransaction && selectedTransaction.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col text-left"
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
                  className="p-2 bg-white dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm border border-gray-100 dark:border-zinc-700"
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
                  <span className="font-bold">#{selectedTransaction[0]?.transactionId || selectedTransaction[0]?.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span className="font-bold">{selectedTransaction[0]?.cashierId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span className="font-bold">{selectedTransaction[0]?.transactionTime}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 dark:border-zinc-700 py-4 space-y-2">
                  {selectedTransaction.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900 dark:text-white shadow-none">
                          {products.find(p => p.id === item.productId)?.name || 'Produk'}
                        </p>
                        <p className="text-gray-600 dark:text-zinc-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(selectedTransaction.reduce((sum, s) => sum + s.totalPrice, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="font-bold">{selectedTransaction[0]?.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-dashed border-gray-300 dark:border-zinc-700 opacity-60">
                   <p>Dokumen Digital Sah</p>
                   <p className="text-[10px] mt-2">Diverifikasi Syariah oleh umkmoo's</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-2 no-print border-t border-gray-100 dark:border-zinc-700 flex-shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Printer className="size-4" /> Cetak
                  </button>
                  <button 
                    onClick={() => handleSaveImage(detailReceiptRef, `Struk_${selectedTransaction[0]?.transactionId || selectedTransaction[0]?.id}`)}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Save className="size-4" /> Simpan
                  </button>
                </div>
                <button 
                  onClick={() => { setShowSaleDetail(false); setSelectedTransaction([]); }}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
