import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { formatCurrency, cn } from '../lib/utils';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wifi, 
  Wallet, 
  Receipt as ReceiptIcon,
  X,
  Printer,
  ShieldCheck,
  AlertCircle,
  Package,
  ChevronRight,
  FileText,
  Save,
  Download,
  QrCode,
  Eye,
  Percent,
  Barcode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Sale } from '../types';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

// Mock Products moved to DataContext

export default function Cashier() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { products, categories: dataCategories, employees, attendance, sales, addSale } = useData();
  const [activeCashier, setActiveCashier] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale[] | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [cashierInput, setCashierInput] = useState('');
  const [cashierError, setCashierError] = useState('');

  // Group sales into transactions
  const transactionGroups = React.useMemo(() => {
    const groups: { [key: string]: Sale[] } = {};
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
  
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    const saved = localStorage.getItem('umkmoo_active_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  useEffect(() => {
    localStorage.setItem('umkmoo_active_cart', JSON.stringify(cart));
  }, [cart]);

  const [completedCart, setCompletedCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [completedSubtotal, setCompletedSubtotal] = useState(0);
  const [completedDiscount, setCompletedDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [discountType, setDiscountType] = useState<'rp' | '%'>('rp');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleBarcodeScanned = (code: string) => {
    const matchedProduct = products.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (matchedProduct) {
      if (matchedProduct.stock <= 0) {
        setScannerFeedback(`Stok habis untuk: "${matchedProduct.name}"!`);
        setTimeout(() => setScannerFeedback(null), 3000);
        return;
      }
      addToCart(matchedProduct);
      setScannerFeedback(`+1 ${matchedProduct.name} ke Keranjang`);
      setTimeout(() => setScannerFeedback(null), 3000);
    } else {
      setScannerFeedback(`Kode "${code}" tidak ditemukan dalam persediaan`);
      setTimeout(() => setScannerFeedback(null), 3500);
    }
  };
  const [validationResult, setValidationResult] = useState<{compliant: boolean, message: string, suggestions: string[]} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'E-wallet' | 'Transfer'>('Cash');

  const receiptRef = useRef<HTMLDivElement>(null);
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

  // Rule: Must match an employee with "present" or "late" status for today
  const handleCashierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = cashierInput.toUpperCase();
    const employee = employees.find(emp => emp.employeeId.toUpperCase() === id);
    const hasAttended = attendance.find(a => 
      a.employeeId === employee?.id && 
      a.date === new Date().toLocaleDateString() && 
      ['present', 'late'].includes(a.status)
    );

    if (employee && hasAttended) {
      setActiveCashier(employee.name);
      setCashierError('');
    } else if (!employee) {
      setCashierError('ID Karyawan tidak ditemukan.');
    } else {
      setCashierError('Karyawan belum melakukan absensi hari ini.');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const discountAmount = React.useMemo(() => {
    const val = parseFloat(discountInput) || 0;
    if (val <= 0) return 0;
    if (discountType === '%') {
      return Math.round((total * Math.min(100, val)) / 100);
    }
    return Math.min(total, val);
  }, [total, discountInput, discountType]);

  const netTotal = Math.max(0, total - discountAmount);

  if (!activeCashier) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-12 rounded-[40px] shadow-2xl border border-gray-100 dark:border-zinc-800 max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-primary-light text-primary rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="size-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Kasir</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8">Masukkan ID Karyawan Anda yang sudah melakukan absensi hari ini.</p>
          
          <form onSubmit={handleCashierLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ID Karyawan</label>
              <input 
                type="text" 
                placeholder="Contoh: EMP001"
                value={cashierInput}
                onChange={e => setCashierInput(e.target.value)}
                autoFocus
                className="w-full px-6 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold tracking-widest dark:text-white"
              />
            </div>
            
            {cashierError && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold px-1">
                <AlertCircle className="size-3" /> {cashierError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
            >
              Buka Menu Kasir <ChevronRight className="size-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const categories = ['Semua', ...dataCategories.map(c => c.name)];
  
  const filteredProducts = products.filter(p => 
    (category === 'Semua' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Calculations moved to top of component to respect Rules of Hooks

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'QRIS' && !showQRISModal) {
      setShowQRISModal(true);
      return;
    }

    setValidating(true);
    setValidationResult(null);

    // AI Validation - Sharia Check
    try {
      // Simulation of AI check
      const compliant = true; 
      const data = { compliant, message: "Validasi Syariah Berhasil", suggestions: [] };
      
      setValidationResult(data);
      if (data.compliant) {
        // Persist sales
        const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
        let remainingDiscount = discountAmount;
        cart.forEach((item, index) => {
          const itemFullPrice = item.product.price * item.quantity;
          let itemDiscount = 0;
          if (index === cart.length - 1) {
            itemDiscount = remainingDiscount;
          } else if (total > 0) {
            itemDiscount = Math.round((itemFullPrice / total) * discountAmount);
            remainingDiscount -= itemDiscount;
          }
          addSale({
            id: Math.random().toString(36).substr(2, 9),
            transactionId,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: Math.max(0, itemFullPrice - itemDiscount),
            transactionTime: new Date().toLocaleString('id-ID'),
            cashierId: activeCashier || 'SYSTEM',
            paymentMethod: paymentMethod,
            status: 'completed'
          });
        });
        setCompletedCart([...cart]);
        setCompletedSubtotal(total);
        setCompletedDiscount(discountAmount);
        setCompletedTotal(netTotal);
        setCart([]);
        setDiscountInput('');
        setShowReceipt(true);
      }
    } catch (err) {
      console.error(err);
      setCompletedCart([...cart]);
      setCompletedSubtotal(total);
      setCompletedDiscount(discountAmount);
      setCompletedTotal(netTotal);
      setCart([]);
      setDiscountInput('');
      setShowReceipt(true);
    } finally {
      setValidating(false);
    }
  };

  const finalizeSale = () => {
    // Persist sales
    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
    let remainingDiscount = discountAmount;
    cart.forEach((item, index) => {
      const itemFullPrice = item.product.price * item.quantity;
      let itemDiscount = 0;
      if (index === cart.length - 1) {
        itemDiscount = remainingDiscount;
      } else if (total > 0) {
        itemDiscount = Math.round((itemFullPrice / total) * discountAmount);
        remainingDiscount -= itemDiscount;
      }
      addSale({
        id: Math.random().toString(36).substr(2, 9),
        transactionId,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: Math.max(0, itemFullPrice - itemDiscount),
        transactionTime: new Date().toLocaleString('id-ID'),
        cashierId: activeCashier || 'SYSTEM',
        paymentMethod: paymentMethod,
        status: 'completed'
      });
    });
    setCompletedCart([...cart]);
    setCompletedSubtotal(total);
    setCompletedDiscount(discountAmount);
    setCompletedTotal(netTotal);
    setCart([]);
    setDiscountInput('');
    setShowReceipt(true);
    setShowQRISModal(false);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Product List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari produk berdasarkan nama atau kode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-32 py-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-zinc-500 font-medium"
            />
            <button
              onClick={() => setShowScannerModal(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-light hover:bg-primary/10 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-primary dark:text-primary-light text-[11px] font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
              title="Pindai Barcode (Kamera/Simulator)"
            >
              <Barcode className="size-4" /> Scan Barcode
            </button>
          </div>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  category === cat 
                    ? "bg-primary text-white" 
                    : "bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                )}
              >
                {cat}
              </button>
            ))}
            <div className="h-12 w-px bg-gray-200 dark:bg-zinc-800 mx-1" />
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Kasir Aktif</p>
                <p className="text-xs font-bold text-primary truncate max-w-[100px]">{activeCashier}</p>
              </div>
              <button 
                onClick={() => {
                  setActiveCashier(null);
                  setCart([]);
                  setCashierInput('');
                }}
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                title="Keluar dari Sesi Kasir"
              >
                <X className="size-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex flex-col gap-6 pr-2">
          {/* Barcode scanning feedback banner */}
          <AnimatePresence>
            {scannerFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className={cn(
                  "px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm border",
                  scannerFeedback.includes("tidak ditemukan") || scannerFeedback.includes("habis")
                    ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30"
                    : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <Barcode className="size-4 animate-pulse text-current" />
                  <span>{scannerFeedback}</span>
                </div>
                <button 
                  onClick={() => setScannerFeedback(null)} 
                  className="p-1 rounded-md text-current/60 hover:text-current hover:bg-current/5 transition-all"
                >
                  <X className="size-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                onClick={() => addToCart(product)}
                className={cn(
                  "bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all cursor-pointer group",
                  product.stock <= 0 ? "opacity-50 grayscale" : "hover:border-primary"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-2xl group-hover:bg-primary-light group-hover:text-primary transition-colors">
                    <Package className="size-6 text-gray-400 group-hover:text-primary" />
                  </div>
                  {product.isConsignment && (
                    <span className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Titipan</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1">{product.code}</p>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 truncate">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Stok: <span className={cn("font-bold", product.stock < 5 ? "text-red-500" : "text-gray-900 dark:text-white")}>{product.stock}</span></p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                  </div>
                  <button className="bg-primary-light text-primary p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="size-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Transaction History Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="size-5 text-primary" />
                <h3 className="font-bold text-gray-900 dark:text-white">Riwayat Transaksi Terakhir</h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{transactionGroups.length} Transaksi Terdaftar</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Transaksi / Kasir</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metode</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                  {transactionGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada transaksi terekam harian ini.</td>
                    </tr>
                  ) : (
                    transactionGroups.slice(0, 10).map((group) => {
                      const firstItem = group[0];
                      const transactionTotal = group.reduce((sum, item) => sum + item.totalPrice, 0);
                      const itemCount = group.reduce((sum, item) => sum + item.quantity, 0);
                      const transactionId = firstItem.transactionId || firstItem.id.slice(0, 8).toUpperCase();
                      
                      return (
                        <tr 
                          key={transactionId} 
                          className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                          onClick={() => { setSelectedSale(group); setShowSaleDetail(true); }}
                        >
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{firstItem.transactionTime.split(',')[1] || firstItem.transactionTime}</p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500">{firstItem.transactionTime.split(',')[0] || ''}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">#{transactionId}</p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Kasir: {firstItem.cashierId}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-zinc-400">
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white font-bold">{group.length} Kategori</span>
                              <span className="text-[10px] text-gray-400 font-medium">({itemCount} pcs)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">{firstItem.paymentMethod}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">{formatCurrency(transactionTotal)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Eye icon to view details */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedSale(group); setShowSaleDetail(true); }}
                                className="p-2 text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedSale(group); setShowSaleDetail(true); setTimeout(() => handlePrint(), 100); }}
                                className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary-light rounded-lg"
                                title="Cetak Struk"
                              >
                                <Printer className="size-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedSale(group); setShowSaleDetail(true); }}
                                className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary-light rounded-lg"
                                title="Lihat & Simpan Struk"
                              >
                                <Download className="size-4" />
                              </button>
                              <ChevronRight className="size-4 text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cart & Summary */}
      <div className="w-96 flex flex-col gap-6">
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 bg-primary text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="size-5" /> Keranjang Belanja
            </h2>
            <p className="text-xs opacity-70 mt-1">{cart.length} item dipilih</p>
          </div>
          
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <ShoppingCart className="size-16 mb-4 dark:text-white" />
                <p className="text-sm font-bold dark:text-white">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-normal line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-primary font-bold">{formatCurrency(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-xl px-2">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-primary dark:text-zinc-500"><Minus className="size-4" /></button>
                    <span className="text-sm font-bold w-4 text-center dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-primary dark:text-zinc-500"><Plus className="size-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="size-4" /></button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400 font-medium">Subtotal</span>
              <span className="font-bold dark:text-white">{formatCurrency(total)}</span>
            </div>

            {/* Manual Discount Feature */}
            <div className="border-t border-dashed border-gray-100 dark:border-zinc-800 pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
                  <Percent className="size-4 text-primary" /> Diskon Manual
                </span>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => setDiscountType('rp')}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
                      discountType === 'rp' 
                        ? "bg-white dark:bg-zinc-700 shadow-sm text-primary font-bold" 
                        : "text-gray-400 dark:text-zinc-500"
                    )}
                  >
                    Rp
                  </button>
                  <button
                    onClick={() => setDiscountType('%')}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
                      discountType === '%' 
                        ? "bg-white dark:bg-zinc-700 shadow-sm text-primary font-bold" 
                        : "text-gray-400 dark:text-zinc-500"
                    )}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder={discountType === 'rp' ? "Masukan nominal (contoh: 10000)" : "Masukan persen (contoh: 10)"}
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-zinc-800 focus:outline-none"
                  min="0"
                />
                {discountAmount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                    - {formatCurrency(discountAmount)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Pajak (0%)</span>
              <span className="font-bold dark:text-white">{formatCurrency(0)}</span>
            </div>
            
            <div className="flex justify-between text-xl font-bold bg-primary-light p-4 rounded-2xl">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-primary">{formatCurrency(netTotal)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Cash', icon: CreditCard },
                { id: 'QRIS', icon: Wifi },
                { id: 'E-wallet', icon: Wallet },
                { id: 'Transfer', icon: ReceiptIcon },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all",
                    paymentMethod === method.id 
                      ? "bg-primary text-white border-primary" 
                      : "border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  )}
                >
                  <method.icon className="size-4" />
                  {method.id}
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || validating}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {validating ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <ShieldCheck className="size-6" />
                  </motion.div>
                  Validasi AI...
                </>
              ) : (
                <>
                  <CreditCard className="size-6" /> Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QRIS Modal */}
      <AnimatePresence>
        {showQRISModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
                    <QrCode className="size-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 dark:text-white">Pembayaran QRIS</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.businessName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQRISModal(false)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-100 mb-6 flex flex-col items-center">
                <div className="w-full aspect-square relative flex items-center justify-center">
                   <QRCodeSVG 
                    value={`00020101021126670014ID.CO.QRIS.WWW0215ID10202111197770303UMI51440014ID.CO.QRIS.WWW0215ID10202111197770303UMI52045999530336054${total.toString().padStart(5, '0')}5802ID5901${user?.businessName?.replace(/\s/g, '').slice(0, 15) || 'UMKM'}6006Jakarta61051234563048590`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">SCAN QR UNTUK MEMBAYAR</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={finalizeSale}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Konfirmasi Pembayaran
                </button>
                <button 
                  onClick={() => setShowQRISModal(false)}
                  className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-relaxed italic">
                  "Pastikan nominal sesuai dan pembayaran telah berhasil di aplikasi m-banking anda."
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Validation Modal */}
      <AnimatePresence>
        {validationResult && !validationResult.compliant && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-50 relative"
            >
              <button 
                onClick={() => setValidationResult(null)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-colors"
              >
                <X className="size-6" />
              </button>
              <div className="flex items-center gap-4 text-red-600 mb-6">
                <AlertCircle className="size-12" />
                <div>
                  <h3 className="text-xl font-bold">Peringatan Syariah</h3>
                  <p className="text-sm opacity-80">Validasi AI UMKMoo's</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 font-medium">
                {validationResult.message}
              </p>
              <div className="bg-red-50 p-4 rounded-2xl mb-8">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2">Saran Perbaikan:</h4>
                <ul className="space-y-2">
                  {validationResult.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-red-600 flex gap-2">
                      <span className="font-bold">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => setValidationResult(null)}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                Mengerti, Batalkan Transaksi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-gray-50 dark:bg-zinc-800 flex items-center justify-between border-b border-gray-100 dark:border-zinc-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{t('receipt')}</h3>
                </div>
                <button 
                  onClick={() => { setShowReceipt(false); setCompletedCart([]); }} 
                  className="p-2 bg-white dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm border border-gray-100 dark:border-zinc-700"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div ref={receiptRef} className="p-8 font-mono text-xs text-gray-800 dark:text-zinc-300 space-y-4 print-receipt overflow-y-auto flex-1 bg-white dark:bg-zinc-900">
                <div className="text-center border-b border-dashed border-gray-300 dark:border-zinc-700 pb-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">{user?.businessName}</h2>
                  <p>{user?.address}</p>
                  <p>Tlp: 0812-3456-789</p>
                </div>
                
                <div className="flex justify-between">
                  <span>No. Trans:</span>
                  <span className="font-bold">#TRX-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span className="font-bold">{activeCashier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span className="font-bold">{new Date().toLocaleString('id-ID')}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 dark:border-zinc-700 py-4 space-y-2">
                  {completedCart.map(item => (
                    <div key={item.product.id} className="flex justify-between">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900 dark:text-white">{item.product.name}</p>
                        <p className="text-gray-600 dark:text-zinc-500">{item.quantity} x {formatCurrency(item.product.price)}</p>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 text-sm border-b border-dashed border-gray-300 dark:border-zinc-700 pb-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-zinc-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(completedSubtotal)}</span>
                  </div>
                  {completedDiscount > 0 && (
                    <div className="flex justify-between text-xs text-red-500 font-bold">
                      <span>Diskon:</span>
                      <span>-{formatCurrency(completedDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(completedTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="font-bold">{paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-dashed border-gray-300 dark:border-zinc-700 opacity-60">
                   <p>Terima Kasih Telah Berbelanja</p>
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
                    onClick={() => handleSaveImage(receiptRef, `Struk_${Date.now()}`)}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Save className="size-4" /> Simpan
                  </button>
                </div>
                <button 
                  onClick={() => { setShowReceipt(false); setCompletedCart([]); }}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {showSaleDetail && selectedSale && selectedSale.length > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-gray-50 dark:bg-zinc-800 flex items-center justify-between border-b border-gray-100 dark:border-zinc-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Detail Transaksi</h3>
                </div>
                <button 
                  onClick={() => { setShowSaleDetail(false); setSelectedSale(null); }} 
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
                  <span className="font-bold">#{selectedSale[0]?.transactionId || selectedSale[0]?.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span className="font-bold">{selectedSale[0]?.cashierId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span className="font-bold">{selectedSale[0]?.transactionTime}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 dark:border-zinc-700 py-4 space-y-2">
                  {selectedSale.map(item => (
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
                    <span>{formatCurrency(selectedSale.reduce((sum, s) => sum + s.totalPrice, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="font-bold">{selectedSale[0]?.paymentMethod}</span>
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
                    onClick={() => handleSaveImage(detailReceiptRef, `Struk_${selectedSale[0]?.transactionId || selectedSale[0]?.id}`)}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all dark:text-white"
                  >
                    <Save className="size-4" /> Simpan
                  </button>
                </div>
                <button 
                  onClick={() => { setShowSaleDetail(false); setSelectedSale(null); }}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScannerModal && (
          <BarcodeScannerModal
            isOpen={showScannerModal}
            onClose={() => setShowScannerModal(false)}
            onScanSuccess={handleBarcodeScanned}
            products={products}
            title="Scan Barcode Kasir"
            placeholder="Ketik atau pindai kode barcode/QR..."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
