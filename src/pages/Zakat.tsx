import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../lib/utils';
import { 
  Coins, 
  Scale, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  History,
  TrendingDown,
  Info,
  Package,
  Check,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

// Standards for Zakat (85g Gold Nisab)
const GOLD_PRICE_PER_GRAM = 1350000; // Harga emas per gram
const NISAB_GOLD_GRAMS = 85;
const NISAB_VALUE = GOLD_PRICE_PER_GRAM * NISAB_GOLD_GRAMS;

interface ZakatPayment {
  id: string;
  date: string;
  amount: number;
  mosqueName: string;
  approvedByOwner: boolean;
  approvedByAccountant: boolean;
  status: 'PENDING_APPROVAL' | 'SUCCESS';
}

export default function Zakat() {
  const { t } = useLanguage();
  const { products } = useData();
  
  // States untuk Aset
  const [cashBalance, setCashBalance] = useState(55000000); // Default agar mendekati nisab untuk demo
  const [receivables, setReceivables] = useState(12000000); 
  const [otherAssets, setOtherAssets] = useState(5000000);
  const [debt, setDebt] = useState(2000000);
  const [haulStatus, setHaulStatus] = useState<number>(365); // Default 1 tahun untuk demo
  
  // Mosque list (Masjid Terverifikasi sesuai Syariah & Compliance)
  const verifiedMosques = [
    { id: 'm1', name: 'Masjid Agung Al-Azhar', address: 'Jakarta Selatan' },
    { id: 'm2', name: 'Masjid Istiqlal', address: 'Jakarta Pusat' },
    { id: 'm3', name: 'Masjid Raya Bandung', address: 'Bandung' },
    { id: 'm4', name: 'Masjid Jogokariyan', address: 'Yogyakarta' }
  ];
  
  const [selectedMosque, setSelectedMosque] = useState(verifiedMosques[0].id);
  const [zakatHistory, setZakatHistory] = useState<ZakatPayment[]>([
    {
      id: 'ZKT-001',
      date: '2025-12-10',
      amount: 1850000,
      mosqueName: 'Masjid Istiqlal',
      approvedByOwner: true,
      approvedByAccountant: true,
      status: 'SUCCESS'
    }
  ]);

  // Inventory Value (Asset in trade)
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  
  // Total Asset untuk perhitungan Zakat
  const totalWealth = (cashBalance + receivables + inventoryValue + otherAssets) - debt;
  
  const isEligibleForZakat = totalWealth >= NISAB_VALUE && haulStatus >= 354; // Tahun Hijriah ~354 hari
  const zakatAmount = isEligibleForZakat ? totalWealth * 0.025 : 0;

  // Handler bayar/ajukan zakat (Four Eyes Rule)
  const handlePayZakat = () => {
    if (zakatAmount <= 0) return;
    
    const targetMosque = verifiedMosques.find(m => m.id === selectedMosque);
    const newZakat: ZakatPayment = {
      id: `ZKT-00${zakatHistory.length + 2}`,
      date: new Date().toISOString().split('T')[0],
      amount: zakatAmount,
      mosqueName: targetMosque ? targetMosque.name : 'Masjid Pilihan',
      approvedByOwner: true, // Pembuat/Pengaju pertama (Pemilik Usaha)
      approvedByAccountant: false, // Perlu persetujuan Akuntan (Four Eyes Rule)
      status: 'PENDING_APPROVAL'
    };

    setZakatHistory(prev => [newZakat, ...prev]);
  };

  const handleApproveZakat = (id: string, role: 'owner' | 'accountant') => {
    setZakatHistory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item };
        if (role === 'owner') updated.approvedByOwner = true;
        if (role === 'accountant') updated.approvedByAccountant = true;
        
        if (updated.approvedByOwner && updated.approvedByAccountant) {
          updated.status = 'SUCCESS';
        }
        return updated;
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">Auto Zakat Maal</h1>
          <p className="text-gray-500 dark:text-zinc-400">Hitung kewajiban zakat secara otomatis berdasarkan syariat Islam & patuhi Four Eyes Rule.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/30 text-[#006400] rounded-full flex items-center justify-center">
            <Scale className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase leading-none mb-1">Nisab Hari Ini (85g Emas)</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(NISAB_VALUE)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Kewajiban Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: isEligibleForZakat ? '#006400' : undefined }}
            className={`p-8 rounded-[40px] shadow-2xl relative overflow-hidden transition-all ${
              isEligibleForZakat 
                ? 'text-white shadow-emerald-900/20' 
                : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800'
            }`}
          >
            <div className={`absolute top-0 right-0 p-12 opacity-10 ${isEligibleForZakat ? 'text-white' : 'text-[#006400]'}`}>
              {isEligibleForZakat ? <Coins className="size-32" /> : <Calculator className="size-32" />}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none ${
                    isEligibleForZakat ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/20 text-[#006400]'
                }`}>
                  Status Kewajiban
                </span>
                <h2 className="text-3xl font-bold mt-4">
                  {isEligibleForZakat ? 'Wajib Zakat Maal' : 'Belum Mencapai Nisab/Haul'}
                </h2>
                <p className={`mt-2 text-sm opacity-80 max-w-md ${isEligibleForZakat ? 'text-emerald-100' : 'text-gray-500 dark:text-zinc-400'}`}>
                  {isEligibleForZakat 
                    ? 'Harta Anda telah melampaui nisab dan telah dimiliki selama satu haul. Silakan salurkan zakat Anda ke Masjid pilihan di bawah.'
                    : 'Harta Anda saat ini belum memenuhi syarat wajib zakat maal. Teruslah berdagang dengan jujur dan amanah.'}
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <p className="text-xs opacity-60 uppercase font-bold tracking-widest mb-2">Total Zakat Yang Harus Dikeluarkan</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-bold">{formatCurrency(zakatAmount)}</h3>
                    {isEligibleForZakat && <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">2.5%</span>}
                  </div>
                </div>

                {isEligibleForZakat && (
                  <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/20 flex flex-col gap-3 max-w-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Pilih Masjid Terverifikasi</label>
                      <select 
                        value={selectedMosque} 
                        onChange={(e) => setSelectedMosque(e.target.value)}
                        className="bg-[#006400] text-white text-xs rounded-xl border border-white/30 p-2 focus:outline-none focus:ring-1 focus:ring-white"
                      >
                        {verifiedMosques.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handlePayZakat}
                      className="bg-white text-[#006400] hover:bg-[#A8D08D] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Ajukan Zakat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Persetujuan Zakat yang Tertunda (Four Eyes Rule) */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <UserCheck className="size-5 text-[#006400]" /> Menunggu Persetujuan (Four Eyes Rule)
            </h3>
            <div className="space-y-4">
              {zakatHistory.filter(z => z.status === 'PENDING_APPROVAL').length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-zinc-400">Tidak ada pengajuan zakat yang memerlukan persetujuan saat ini.</p>
              ) : (
                zakatHistory.filter(z => z.status === 'PENDING_APPROVAL').map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400">{item.id} • {item.date}</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.mosqueName}</p>
                      <p className="text-xs text-[#006400] font-bold mt-1">{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Persetujuan Owner */}
                      <button
                        onClick={() => handleApproveZakat(item.id, 'owner')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                          item.approvedByOwner 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 hover:bg-[#A8D08D]/20 hover:text-[#006400]'
                        }`}
                      >
                        {item.approvedByOwner && <Check className="size-3" />}
                        Owner {item.approvedByOwner ? 'Approved' : 'Approve'}
                      </button>
                      
                      {/* Persetujuan Accountant */}
                      <button
                        onClick={() => handleApproveZakat(item.id, 'accountant')}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                          item.approvedByAccountant 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 hover:bg-[#A8D08D]/20 hover:text-[#006400]'
                        }`}
                      >
                        {item.approvedByAccountant && <Check className="size-3" />}
                        Akuntan {item.approvedByAccountant ? 'Approved' : 'Approve'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Inventory Breakdown Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="size-5 text-[#006400]" /> Detail Harta Perniagaan (Stok Barang)
              </h3>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-[#006400] px-3 py-1 rounded-full font-bold uppercase">
                {products.length} Jenis Barang
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-zinc-850 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Nama Barang</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center">Jumlah Stok</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-right">Nilai Aset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        <Package className="size-12 mx-auto mb-4 opacity-10 text-[#006400]" />
                        <p className="text-sm font-bold">Belum ada barang di inventori.</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wider">{p.code} • {p.category}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-650 dark:text-zinc-400">{p.stock} unit</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-[#006400]">{formatCurrency(p.price * p.stock)}</p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500">{formatCurrency(p.price)} / unit</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border-t border-amber-150 dark:border-amber-900/20">
               <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed italic">
                 * Nilai aset perniagaan dihitung berdasarkan harga pasar (harga jual) saat ini sesuai dengan pendapat mayoritas ulama untuk perhitungan zakat perdagangan.
               </p>
            </div>
          </div>

          {/* Detailed Assets Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="size-5 text-[#006400]" /> Perincian Harta Kekayaan
              </h3>
              <span className="text-[10px] bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 px-3 py-1 rounded-full font-bold uppercase">Update Real-time</span>
            </div>
            <div className="divide-y divide-gray-105 dark:divide-zinc-800">
               {[
                 { label: 'Uang Tunai / Tabungan', value: cashBalance, setter: setCashBalance, icon: Coins, color: 'text-green-600' },
                 { label: 'Persediaan Barang Dagang', value: inventoryValue, icon: Package, color: 'text-amber-600', readonly: true },
                 { label: 'Piutang Berjalan', value: receivables, setter: setReceivables, icon: History, color: 'text-blue-600' },
                 { label: 'Aset Lainnya (Emas, Surat Berharga)', value: otherAssets, setter: setOtherAssets, icon: Scale, color: 'text-purple-600' },
                 { label: 'Hutang Jatuh Tempo', value: debt, setter: setDebt, icon: TrendingDown, color: 'text-red-600', isDebt: true },
               ].map((item, i) => (
                 <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 ${item.color} bg-current/10 rounded-xl flex items-center justify-center`}>
                       <item.icon className="size-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                       <p className="text-[10px] text-gray-400 dark:text-zinc-500">{item.readonly ? 'Dihitung otomatis dari stok' : 'Input manual'}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     {item.readonly ? (
                       <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                     ) : (
                       <div className="relative">
                         <input 
                           type="number" 
                           value={item.value} 
                           onChange={e => item.setter?.(Number(e.target.value))}
                           className="text-right font-bold text-gray-900 dark:text-white border-none bg-transparent focus:ring-0 p-0 w-32 focus:outline-none"
                         />
                         <div className="h-px bg-gray-200 dark:bg-zinc-800 mt-1" />
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>
            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 text-[#006400] flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white">Total Kekayaan Bersih (Nami)</span>
              <span className="text-xl font-bold text-[#006400]">{formatCurrency(totalWealth)}</span>
            </div>
          </div>

          {/* Riwayat Pembayaran Zakat Terverifikasi */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <History className="size-5 text-[#006400]" /> Riwayat Penyaluran Zakat
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {zakatHistory.filter(z => z.status === 'SUCCESS').map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400">{item.id} • {item.date}</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.mosqueName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#006400]">{formatCurrency(item.amount)}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase mt-0.5">
                      <CheckCircle2 className="size-3" /> Sukses Disalurkan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Haul Tracker */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="size-5 text-[#006400]" /> Haul Tracker
            </h3>
            <div className="relative w-full aspect-square flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="50%" cy="50%" r="45%" stroke="#f3f4f6" className="stroke-gray-100 dark:stroke-zinc-800" strokeWidth="8" fill="none" />
                 <circle 
                   cx="50%" cy="50%" r="45%" 
                   stroke="currentColor" className="text-[#006400]" strokeWidth="8" fill="none" 
                   strokeDasharray="283" 
                   strokeDashoffset={283 - (283 * Math.min(haulStatus, 354) / 354)}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <p className="text-3xl font-bold text-gray-900 dark:text-white">{haulStatus}</p>
                 <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Hari Dimiliki</p>
               </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Input Tanggal Mulai Nisab</p>
                <input 
                  type="date" 
                  defaultValue="2025-06-10"
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-[#006400] focus:ring-0 focus:outline-none"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const start = new Date(e.target.value);
                    const diff = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    setHaulStatus(diff > 0 ? diff : 0);
                  }}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <Info className="size-5 text-blue-600 dark:text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-tight">
                  <span className="font-bold uppercase">Info:</span> Satu haul setara dengan 1 tahun hijriah (~354 hari).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[40px] border border-amber-100 dark:border-amber-900/20">
             <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
               <AlertCircle className="size-6" />
               <h4 className="font-bold">Ketentuan Zakat Maal</h4>
             </div>
             <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed opacity-85 font-medium">
               "Dan orang-orang yang menyimpan emas dan perak dan tidak menafkahkannya pada jalan Allah, maka beritahukanlah kepada mereka, (bahwa mereka akan mendapat) siksa yang pedih." (QS At-Taubah: 34)
             </p>
             <button className="w-full mt-6 bg-amber-600 dark:bg-amber-700 hover:bg-[#A8D08D] text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
               Pelajari Adab Berzakat <ArrowRight className="size-3" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
