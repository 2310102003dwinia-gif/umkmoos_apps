import React, { useEffect, useState } from 'react';
import { 
  X, 
  Camera, 
  Keyboard, 
  AlertCircle, 
  Volume2, 
  Sparkles, 
  HelpCircle,
  Barcode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  products: Product[];
  title?: string;
  placeholder?: string;
}

// Browser Audio Synthesizer Beep for tactile scan feedback
const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime); // Crisp Scanner Beep
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime); // Sane volume
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.warn("Audio Context beep was blocked by browser autoplay policy or unsupported", e);
  }
};

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  products = [],
  title = "Pindai Barcode / QR",
  placeholder = "Masukkan kode barang..."
}: BarcodeScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'simulator'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [simulationCategoryFilter, setSimulationCategoryFilter] = useState<string>('Semua');

  // Scanner status
  const [isScanning, setIsScanning] = useState(false);

  // List categories for simulator
  const simCategories = ['Semua', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

  // Filter products for simulator list
  const filteredSimProducts = products.filter(p => {
    if (simulationCategoryFilter === 'Semua') return true;
    return p.category === simulationCategoryFilter;
  });

  // Handle manual input keypress
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    
    playBeep();
    onScanSuccess(manualInput.trim());
    setManualInput('');
    setInfoMessage(`Berhasil mensimulasikan scan kode: "${manualInput}"`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  // Handle simulated item click
  const handleSimulateItemClick = (code: string) => {
    playBeep();
    onScanSuccess(code);
    setInfoMessage(`Berhasil memindai barang dengan kode: "${code}"`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  useEffect(() => {
    let html5Qrcode: any = null;
    const elementId = "html5-barcode-reader";
    let isMounted = true;

    if (isOpen && activeTab === 'camera') {
      setIsScanning(true);
      setCameraError(null);

      // Timeout to ensure the DOM element is rendered and ready
      const timer = setTimeout(() => {
        if (!isMounted) return;

        import('html5-qrcode')
          .then((ScannerModule) => {
            if (!isMounted) return;
            const Html5QrcodeClass = ScannerModule.Html5Qrcode || (ScannerModule as any).default?.Html5Qrcode;
            if (!Html5QrcodeClass) {
              setCameraError("Gagal memuat modul kamera scanner.");
              setIsScanning(false);
              return;
            }

            try {
              html5Qrcode = new Html5QrcodeClass(elementId);
              html5Qrcode.start(
                { facingMode: "environment" },
                {
                  fps: 15,
                  qrbox: (width: number, height: number) => {
                    const boxWidth = Math.min(width * 0.85, 320);
                    const boxHeight = Math.min(height * 0.35, 110);
                    return {
                      x: Math.round((width - boxWidth) / 2),
                      y: Math.round((height - boxHeight) / 2),
                      width: boxWidth,
                      height: boxHeight
                    };
                  }
                },
                (decodedText: string) => {
                  playBeep();
                  onScanSuccess(decodedText);
                  setInfoMessage(`Berhasil memindai: "${decodedText}"`);
                  setTimeout(() => setInfoMessage(null), 3000);
                },
                () => {}
              ).catch((err: any) => {
                console.error("Failed to start scanner:", err);
                if (isMounted) {
                  setCameraError("Akses kamera tidak diizinkan atau kamera tidak ditemukan. Silakan berikan izin webcam Anda atau gunakan tab Simulator di sebelah kanan.");
                  setIsScanning(false);
                }
              });
            } catch (e: any) {
              console.error("Camera construct error:", e);
              if (isMounted) {
                setCameraError("Inisialisasi kamera gagal.");
                setIsScanning(false);
              }
            }
          })
          .catch((err) => {
            console.error("Dynamically importing html5-qrcode failed:", err);
            if (isMounted) {
              setCameraError("Pustaka scanner gagal dimuat.");
              setIsScanning(false);
            }
          });
      }, 400);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5Qrcode) {
          try {
            if (html5Qrcode.isScanning) {
              html5Qrcode.stop()
                .then(() => setIsScanning(false))
                .catch((err: any) => console.error("Error stopping scanner elements:", err));
            }
          } catch (error) {
            console.error("Error during scanner disposal:", error);
          }
        }
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/50 backdrop-blur-md" 
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }} 
        className="relative bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-light dark:bg-primary-light/10 p-2 rounded-xl text-primary font-bold">
              <Barcode className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Metode Scan UMKMoo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-gray-50 dark:bg-zinc-800/40 p-1 mx-6 mt-4 rounded-xl border border-gray-100 dark:border-zinc-800/60">
          <button
            onClick={() => setActiveTab('camera')}
            className={cn(
              "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'camera'
                ? "bg-white dark:bg-zinc-800 text-primary dark:text-white shadow-sm font-extrabold"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Camera className="size-4" />
            Pindai Kamera
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={cn(
              "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'simulator'
                ? "bg-white dark:bg-zinc-800 text-primary dark:text-white shadow-sm font-extrabold"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Keyboard className="size-4" />
            Simulator & Manual
          </button>
        </div>

        {/* Toast Notification for Scan Matches inside Dialog */}
        <AnimatePresence>
          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2"
            >
              <Volume2 className="size-4 animate-bounce" /> {infoMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px] flex flex-col justify-center">
          {activeTab === 'camera' ? (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="relative flex-1 min-h-[220px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Real Html5 Scanner view target */}
                <div id="html5-barcode-reader" className="w-full h-full object-cover [&>video]:object-cover" />

                {/* Styled Laser Beam Overlay */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 dark:bg-red-400 shadow-[0_0_8px_#ef4444] animate-pulse z-10 pointers-events-none" />
                )}

                {/* Target Guides */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-0 border-2 border-dashed border-white/25 m-6 rounded-lg pointer-events-none z-10 flex flex-col justify-between items-center text-[10px] text-white/50 font-bold p-3">
                    <div className="flex justify-between w-full">
                      <div className="border-t-2 border-l-2 border-white size-3 rounded-tl-sm" />
                      <div className="border-t-2 border-r-2 border-white size-3 rounded-tr-sm" />
                    </div>
                    <span className="bg-black/55 px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase">Posisikan Barcode di Tengah Box</span>
                    <div className="flex justify-between w-full">
                      <div className="border-b-2 border-l-2 border-white size-3 rounded-bl-sm" />
                      <div className="border-b-2 border-r-2 border-white size-3 rounded-br-sm" />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {cameraError && (
                  <div className="absolute inset-0 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                    <div className="size-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                      <AlertCircle className="size-6" />
                    </div>
                    <p className="text-xs text-zinc-300 font-semibold max-w-sm leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('simulator')}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-opacity-95 transition-all"
                    >
                      Beralih ke Simulator
                    </button>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 leading-relaxed bg-gray-50 dark:bg-zinc-800/20 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/40">
                  <Sparkles className="size-3.5 text-primary" />
                  Mendukung pemindaian barcode fisik secara langsung menggunakan kamera. Gunakan pencahayaan yang cukup.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Ketikan Manual Kode Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="px-5 bg-primary text-white font-bold rounded-2xl text-xs hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-primary/10"
                  >
                    Simulasi Scan
                  </button>
                </div>
              </form>

              {/* Simulation Quick Clicks */}
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Klik Barang untuk Simulasi Scan</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-gray-400 mr-2">Filter:</span>
                    <select
                      value={simulationCategoryFilter}
                      onChange={(e) => setSimulationCategoryFilter(e.target.value)}
                      className="text-[10px] bg-gray-50 dark:bg-zinc-800 border-none font-bold text-zinc-600 dark:text-zinc-300 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {simCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl flex-1 bg-gray-50/50 dark:bg-zinc-950/20 max-h-[180px] overflow-y-auto p-2 space-y-1.5">
                  {filteredSimProducts.length > 0 ? (
                    filteredSimProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSimulateItemClick(p.code)}
                        className="w-full text-left bg-white dark:bg-zinc-900 hover:bg-primary-light/40 dark:hover:bg-primary/10 p-3 rounded-xl flex items-center justify-between text-xs transition-all border border-gray-100 dark:border-zinc-800/80 shadow-sm hover:border-primary/25 cursor-pointer group"
                      >
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">{p.code}</span>
                            <span className="text-[9px] text-gray-400">{p.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Stok: <span className={cn("font-bold", p.stock < 10 ? "text-red-500" : "text-emerald-500")}>{p.stock}</span></p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      {products.length === 0 
                        ? 'Belum ada data barang. Silakan tambahkan barang di tab Persediaan.' 
                        : 'Barang dengan kategori terpilih tidak tersedia.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-zinc-850 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
          <span>Sistem Pemindai UMKMoo</span>
          <span className="flex items-center gap-1">
            <Volume2 className="size-3 flex-shrink-0" /> Sound Scan Aktif
          </span>
        </div>
      </motion.div>
    </div>
  );
}
