import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  Wallet, 
  ArrowRight, 
  Save, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Briefcase,
  FileText,
  Download,
  Printer,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MinusCircle,
  PlusCircle,
  Banknote,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClerkingRecord, CashDenomination } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export default function Clerking() {
  const { user } = useAuth();
  const { sales, clerkingRecords, addClerkingRecord } = useData();
  const { t } = useLanguage();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'Pagi' | 'Siang' | 'Malam'>('Pagi');
  const [cashierName, setCashierName] = useState(user?.ownerName || '');
  const [initialCapital, setInitialCapital] = useState(500000);
  const [pettyCashExpense, setPettyCashExpense] = useState(0);
  const [notes, setNotes] = useState('');

  const [denominations, setDenominations] = useState<CashDenomination>({
    k100: 0, k50: 0, k20: 0, k10: 0, k5: 0, k2: 0, k1: 0, coins: 0
  });

  // Calculate system income for the selected date
  const systemIncome = useMemo(() => {
    const todaySales = sales.filter(sale => {
      const saleDate = sale.transactionTime.split(',')[0].trim();
      const [d, m, y] = saleDate.split('/');
      const isoSaleDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      return isoSaleDate === date;
    });

    const cash = todaySales.filter(s => s.paymentMethod === 'Cash').reduce((acc, s) => acc + s.totalPrice, 0);
    const qris = todaySales.filter(s => s.paymentMethod === 'QRIS').reduce((acc, s) => acc + s.totalPrice, 0);
    const card = todaySales.filter(s => s.paymentMethod === 'Transfer').reduce((acc, s) => acc + s.totalPrice, 0);
    
    return { cash, qris, card, total: cash + qris + card };
  }, [sales, date]);

  const totalPhysicalCash = useMemo(() => {
    return (denominations.k100 * 100000) +
           (denominations.k50 * 50000) +
           (denominations.k20 * 20000) +
           (denominations.k10 * 10000) +
           (denominations.k5 * 5000) +
           (denominations.k2 * 2000) +
           (denominations.k1 * 1000) +
           denominations.coins;
  }, [denominations]);

  const totalExpected = initialCapital + systemIncome.cash - pettyCashExpense;
  const difference = totalPhysicalCash - totalExpected;

  const status = useMemo(() => {
    if (Math.abs(difference) < 1) return 'SESUAI';
    return difference > 0 ? 'LEBIH' : 'KURANG';
  }, [difference]);

  const handleDenomChange = (key: keyof CashDenomination, value: string) => {
    const num = parseInt(value) || 0;
    setDenominations(prev => ({ ...prev, [key]: num }));
  };

  const handleSave = () => {
    if (!cashierName) {
        alert("Silakan masukkan nama kasir.");
        return;
    }

    const newRecord: ClerkingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      shift,
      cashierName,
      initialCapital,
      cashIncome: systemIncome.cash,
      qrisIncome: systemIncome.qris,
      cardIncome: systemIncome.card,
      pettyCashExpense,
      systemTotal: totalExpected,
      physicalCashDenominations: denominations,
      totalPhysicalCash,
      difference,
      status,
      notes,
      isLocked: true,
      createdAt: new Date().toISOString()
    };

    addClerkingRecord(newRecord);
    alert("Data Penutupan Kas (Clerking) Berhasil Disimpan!");
    
    // Reset form after a short delay
    setTimeout(() => {
      setDenominations({ k100: 0, k50: 0, k20: 0, k10: 0, k5: 0, k2: 0, k1: 0, coins: 0 });
      setPettyCashExpense(0);
      setNotes('');
    }, 500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Perhitungan Pendapatan Harian
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-medium">Sistem Penutupan Kas (Clerking) Modern</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <Clock className="size-4" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Shift Aktif</p>
                <div className="flex items-center gap-2">
                   <select 
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="text-xs font-bold bg-transparent border-none p-0 focus:ring-0 dark:text-white cursor-pointer"
                   >
                     <option value="Pagi">Pagi (07:00 - 15:00)</option>
                     <option value="Siang">Siang (15:00 - 23:00)</option>
                     <option value="Malam">Malam (23:00 - 07:00)</option>
                   </select>
                </div>
             </div>
          </div>
          <button className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm text-gray-400 hover:text-primary transition-all">
            <History className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Denominations */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Form Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center">
                   <Wallet className="size-5" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white">Form Input Clerking</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Informasi Dasar & Pendapatan Sistem</p>
                </div>
             </div>
             
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal</label>
                         <input 
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Kasir</label>
                         <input 
                          type="text"
                          value={cashierName}
                          onChange={(e) => setCashierName(e.target.value)}
                          placeholder="Nama Lengkap"
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                         />
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Modal Awal Kas (Rp)</label>
                      <input 
                        type="number"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-lg font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pengeluaran Kas Kecil (Rp)</label>
                      <input 
                        type="number"
                        value={pettyCashExpense}
                        onChange={(e) => setPettyCashExpense(parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catatan</label>
                      <textarea 
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Keterangan selisih atau pengeluaran..."
                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      ></textarea>
                   </div>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-[24px] border border-dashed border-gray-200 dark:border-zinc-700 space-y-4">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ringkasan Sistem Otomatis</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                         <span className="text-xs text-gray-500">Pendapatan Tunai</span>
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(systemIncome.cash)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                         <span className="text-xs text-gray-500">Pendapatan QRIS</span>
                         <span className="text-sm font-bold text-primary">{formatCurrency(systemIncome.qris)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                         <span className="text-xs text-gray-500">Pendapatan Transfer/Kartu</span>
                         <span className="text-sm font-bold text-blue-500">{formatCurrency(systemIncome.card)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20 mt-4">
                         <span className="font-bold text-primary">TOTAL SEHARUSNYA</span>
                         <div className="text-right">
                            <p className="text-xs text-gray-500 leading-none mb-1">(Modal + Tunai - Keluar)</p>
                            <p className="text-lg font-black text-primary">{formatCurrency(totalExpected)}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Physical Cash Counting (Denominations) */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                      <Banknote className="size-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Perhitungan Uang Fisik</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Input Jumlah Lembar per Pecahan</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Fisik</p>
                   <p className="text-xl font-black text-[#1B4332] dark:text-green-400">{formatCurrency(totalPhysicalCash)}</p>
                </div>
             </div>

             <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {/* Denom Inputs */}
                   {[
                     { label: '100.000', key: 'k100', color: 'bg-red-500' },
                     { label: '50.000', key: 'k50', color: 'bg-blue-600' },
                     { label: '20.000', key: 'k20', color: 'bg-green-600' },
                     { label: '10.000', key: 'k10', color: 'bg-purple-600' },
                     { label: '5.000', key: 'k5', color: 'bg-yellow-600' },
                     { label: '2.000', key: 'k2', color: 'bg-gray-400' },
                     { label: '1.000', key: 'k1', color: 'bg-gray-500' },
                     { label: 'Koin', key: 'coins', icon: Coins, color: 'bg-yellow-500' },
                   ].map((d) => (
                     <div key={d.key} className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-2 mb-3">
                           <div className={cn("w-1.5 h-6 rounded-full", d.color)} />
                           <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Rp {d.label}</span>
                        </div>
                        <div className="relative">
                           <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={denominations[d.key as keyof CashDenomination] || ''}
                            onChange={(e) => handleDenomChange(d.key as keyof CashDenomination, e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                           />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.key === 'coins' ? 'Rp' : 'Lbr'}</span>
                        </div>
                        <p className="mt-2 text-right text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           = {formatCurrency(
                             d.key === 'coins' 
                               ? denominations[d.key as keyof CashDenomination] 
                               : denominations[d.key as keyof CashDenomination] * parseInt(d.label.replace('.', ''))
                           )}
                        </p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Results & Status */}
        <div className="lg:col-span-4 space-y-8">
           {/* Results Card */}
           <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden sticky top-24">
              <div className="p-8 bg-[#1B4332] text-white">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Status Clerking</p>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg",
                      status === 'SESUAI' ? "bg-green-500 text-white" : 
                      status === 'LEBIH' ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {status}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <p className="text-xs opacity-70 mb-1">Total Fisik</p>
                       <p className="text-3xl font-black">{formatCurrency(totalPhysicalCash)}</p>
                    </div>
                    
                    <div className="h-px bg-white/20 w-full" />

                    <div>
                       <p className="text-xs opacity-70 mb-1">Selisih Kas</p>
                       <div className="flex items-center gap-3">
                          <p className={cn(
                            "text-2xl font-black",
                            difference === 0 ? "text-white" : 
                            difference > 0 ? "text-blue-300" : "text-red-300"
                          )}>
                             {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                          </p>
                          {difference !== 0 && (
                             <div className={cn(
                               "p-1.5 rounded-lg bg-white/10",
                               difference > 0 ? "text-blue-300" : "text-red-300"
                             )}>
                                {difference > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 space-y-4">
                 <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl text-[11px] leading-relaxed italic text-gray-500 dark:text-zinc-400">
                    "PASTIKAN SEMUA UANG FISIK TELAH DIHITUNG DENGAN TELITI. DATA YANG TELAH DISIMPAN (TUTUP KAS) AKAN TERKUNCI UNTUK AUDIT."
                 </div>

                 <button 
                  onClick={handleSave}
                  className="w-full bg-[#1B4332] text-white py-5 rounded-2xl font-bold shadow-xl shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                 >
                    <Save className="size-5 group-hover:animate-bounce" />
                    SIMPAN & TUTUP KAS
                 </button>

                 <div className="flex gap-2">
                    <button className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                       <Printer size={14} /> Cetak
                    </button>
                    <button className="flex-1 py-3 px-4 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                       <Download size={14} /> PDF/Excel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 flex items-center justify-center">
                <History className="size-5" />
             </div>
             <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Riwayat Clerking Harian</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Audit Penutupan Kas Terakhir</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <input type="date" className="bg-white dark:bg-zinc-800 text-xs font-bold border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1" />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{clerkingRecords.length} LAPORAN</span>
          </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal / Shift</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Kasir</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Modal Awal</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Fisik</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Selisih</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-center"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                 {clerkingRecords.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="px-8 py-12 text-center text-gray-400 text-sm italic">Belum ada riwayat penutupan kas.</td>
                   </tr>
                 ) : (
                   clerkingRecords.map((record) => (
                      <tr key={record.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                         <td className="px-8 py-5">
                            <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{record.date}</p>
                            <div className="flex items-center gap-1 mt-1">
                               <Clock className="size-3 text-gray-400" />
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{record.shift}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">{record.cashierName}</p>
                         </td>
                         <td className="px-8 py-5 text-right font-bold text-xs text-gray-500">
                            {formatCurrency(record.initialCapital)}
                         </td>
                         <td className="px-8 py-5 text-right font-black text-xs text-gray-900 dark:text-white">
                            {formatCurrency(record.totalPhysicalCash)}
                         </td>
                         <td className="px-8 py-5 text-right">
                            <p className={cn(
                              "text-xs font-bold",
                              record.difference === 0 ? "text-gray-400" : 
                              record.difference > 0 ? "text-blue-500" : "text-red-500"
                            )}>
                               {record.difference > 0 ? '+' : ''}{formatCurrency(record.difference)}
                            </p>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                              record.status === 'SESUAI' ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" : 
                              record.status === 'LEBIH' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                            )}>
                               {record.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-center">
                            <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                               <ChevronRight className="size-5" />
                            </button>
                         </td>
                      </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
