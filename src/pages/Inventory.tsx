import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { formatCurrency, cn } from '../lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpDown, 
  Package, 
  AlertTriangle,
  History,
  X,
  Trash2,
  Tags,
  LayoutGrid,
  Edit2,
  Barcode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import BarcodeSVG from '../components/BarcodeSVG';

export default function Inventory() {
  const { t } = useLanguage();
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useData();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: '',
    stock: 0,
    price: 0,
    isConsignment: false
  });

  // Set default category when categories change or modal opens
  React.useEffect(() => {
    if (categories.length > 0 && !newProduct.category) {
      setNewProduct(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, showAddModal]);

  const handleBarcodeScanned = (code: string) => {
    setNewProduct(prev => ({ ...prev, code }));
    setShowScannerModal(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check for duplicate code (case insensitive)
    const isCodeDuplicate = products.some(p => 
      p.code.toLowerCase() === (newProduct.code || '').toLowerCase() && 
      (!editingProduct || p.id !== editingProduct.id)
    );

    if (isCodeDuplicate) {
      setError(`Kode "${newProduct.code}" sudah digunakan oleh barang lain.`);
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...newProduct as Product,
      });
      setEditingProduct(null);
    } else {
      const product: Product = {
        ...newProduct as Product,
        id: Math.random().toString(36).substr(2, 9),
        entryDate: new Date().toLocaleDateString()
      };
      addProduct(product);
    }
    setShowAddModal(false);
    setNewProduct({ name: '', code: '', category: categories[0]?.name || '', stock: 0, price: 0, isConsignment: false });
  };

  const startEdit = (product: Product) => {
    setError(null);
    setEditingProduct(product);
    setNewProduct(product);
    setShowAddModal(true);
  };

  const [newCatName, setNewCatName] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
      setShowCategoryModal(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inventory')}</h1>
          <p className="text-gray-500 dark:text-zinc-400">Pantau stok barang dan kelola kategori usaha Anda.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setActiveTab('categories')}
            className="bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 transition-all shadow-sm"
          >
            <Tags className="size-5" /> Kelola Kategori
          </button>
          <button 
            onClick={() => { setError(null); setShowAddModal(true); }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="size-5" /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'products' ? "bg-white dark:bg-zinc-900 text-primary shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white"
          )}
        >
          <Package className="size-4" /> Daftar Barang
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
            activeTab === 'categories' ? "bg-white dark:bg-zinc-900 text-primary shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white"
          )}
        >
          <LayoutGrid className="size-4" /> Kategori
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Barang', count: products.length, icon: Package, color: 'text-blue-600' },
              { label: 'Hampir Habis', count: products.filter(p => p.stock < 10).length, icon: AlertTriangle, color: 'text-amber-600' },
              { label: 'Barang Titipan', count: products.filter(p => p.isConsignment).length, icon: History, color: 'text-primary' },
              { label: 'Total Kategori', count: categories.length, icon: Tags, color: 'text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className={`${stat.color} bg-current/10 w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Product Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
                 <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="Cari nama barang atau kode..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary dark:text-white dark:placeholder-zinc-500" 
                  />
                 </div>
                 {categoryFilter && (
                   <div className="flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-xl text-xs font-bold">
                     <span>Hanya Kategori: {categoryFilter}</span>
                     <button onClick={() => setCategoryFilter(null)} className="hover:text-red-500 transition-colors">
                       <X className="size-3" />
                     </button>
                   </div>
                 )}
               </div>
               <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 dark:border-zinc-700 rounded-xl text-sm font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800">
                 <Filter className="size-4" /> Filter
               </button>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-gray-50/50 dark:bg-zinc-800/50">
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Informasi Barang</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Kategori</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center">Stok</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Harga Satuan</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Tgl Masuk</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-primary-light transition-colors">
                              <Package className={cn("size-5", product.stock < 10 ? "text-red-500" : "text-gray-400 group-hover:text-primary")} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{product.name}</p>
                              <button
                                onClick={() => setSelectedBarcodeProduct(product)}
                                className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 hover:border-primary/25 hover:bg-primary-light/30 dark:hover:bg-primary/10 text-[9px] font-mono font-bold text-gray-500 hover:text-primary dark:text-zinc-400 transition-all cursor-pointer shadow-sm active:scale-95"
                                title="Klik untuk tampilkan barcode dan cetak label"
                              >
                                <Barcode className="size-3 text-primary" />
                                {product.code}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full">{product.category}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={cn("text-sm font-bold", product.stock < 10 ? "text-red-500" : "text-gray-900 dark:text-white")}>{product.stock}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                          {product.isConsignment && <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">Mudharabah</p>}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-gray-500 dark:text-zinc-400">{product.entryDate}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => startEdit(product)}
                              className="p-2 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => {
                setCategoryFilter(cat.name);
                setActiveTab('products');
              }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary-light hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
                  <LayoutGrid className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{products.filter(p => p.category === cat.name).length} Produk</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat.id);
                }}
                className="p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="p-6 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-600 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all"
          >
            <Plus className="size-8" />
            <span className="font-bold text-sm">Tambah Kategori Baru</span>
          </button>
        </div>
        </>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[40px] shadow-2xl p-10 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold dark:text-white">{editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingProduct(null); setError(null); }}><X className="size-6 text-gray-300 hover:text-gray-900 dark:hover:text-white" /></button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-sm text-red-600 font-bold">
                  <AlertTriangle className="size-5" />
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Nama Barang</label>
                    <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Kode Barang</label>
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        value={newProduct.code} 
                        onChange={e => { setError(null); setNewProduct({...newProduct, code: e.target.value}); }} 
                        className="w-full pl-5 pr-12 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none dark:text-white font-mono" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowScannerModal(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl text-primary transition-all cursor-pointer flex items-center justify-center"
                        title="Pindai Barcode / QR dengan Kamera / Simulator"
                      >
                        <Barcode className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Kategori</label>
                  {categories.length > 0 ? (
                    <select 
                      value={newProduct.category} 
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none font-bold text-sm dark:text-white"
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-[10px] font-bold text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="size-4" /> Tambahkan kategori terlebih dahulu di tab Kategori.
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Stok Awal</label>
                    <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full px-5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Harga Jual</label>
                    <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full px-5 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none dark:text-white" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-primary-light rounded-2xl border border-primary/10">
                   <input type="checkbox" checked={newProduct.isConsignment} onChange={e => setNewProduct({...newProduct, isConsignment: e.target.checked})} className="size-5 accent-primary" />
                   <div>
                     <p className="text-sm font-bold text-primary">Gunakan Akad Konsinyasi (Syariah)</p>
                     <p className="text-[10px] text-primary/60 dark:text-primary/90">Gunakan ini untuk barang titipan guna bagi hasil yang adil.</p>
                   </div>
                </label>
                <button 
                  type="submit" 
                  disabled={categories.length === 0}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Simpan Barang
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal for Inventory */}
      <AnimatePresence>
        {showScannerModal && (
          <BarcodeScannerModal
            isOpen={showScannerModal}
            onClose={() => setShowScannerModal(false)}
            onScanSuccess={handleBarcodeScanned}
            products={products}
            title="Pindai Barcode Barang Baru"
            placeholder="Ketik atau pindai kode produk..."
          />
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[40px] shadow-2xl p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold dark:text-white">Buat Kategori Baru</h3>
                <button onClick={() => setShowCategoryModal(false)}><X className="size-6 text-gray-300 hover:text-gray-900 dark:hover:text-white" /></button>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Nama Kategori</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Contoh: Snack, Layanan, Paket"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold dark:text-white" 
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all">
                  <LayoutGrid className="size-5" /> Tambah Kategori
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Sticker Viewer Modal */}
      <AnimatePresence>
        {selectedBarcodeProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedBarcodeProduct(null)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] shadow-2xl p-8 overflow-hidden border border-gray-100 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Barcode className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider">Cetak Label Barcode</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Konektivitas Instan UMKMoo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBarcodeProduct(null)}
                  className="p-1 px-2.5 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-xl font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Printable Sticker Box */}
              <div className="p-6 bg-gray-50/50 dark:bg-zinc-950/40 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center space-y-4 shadow-inner">
                <div id="printable-barcode-sticker" className="bg-white p-6 rounded-xl border border-gray-200 dark:border-zinc-805 flex flex-col items-center justify-center text-center max-w-[280px] w-full shadow-sm text-zinc-900">
                  <p className="text-xs font-bold uppercase text-gray-900 tracking-wide mb-1 break-words max-w-full">
                    {selectedBarcodeProduct.name}
                  </p>
                  <p className="text-[10px] font-bold text-primary tracking-wide mb-4">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedBarcodeProduct.price)}
                  </p>
                  
                  {/* Generated Code 39 Barcode SVG */}
                  <BarcodeSVG value={selectedBarcodeProduct.code} height={75} />
                  
                  {selectedBarcodeProduct.isConsignment && (
                    <div className="mt-2 text-[8px] font-bold text-emerald-600 border border-emerald-500/25 px-2 py-0.5 rounded-full bg-emerald-500/5 tracking-wider uppercase">
                      Mudharabah (Konsinyasi)
                    </div>
                  )}
                </div>
              </div>

              {/* Tips / Connection with Kasir */}
              <div className="mt-5 space-y-2 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-semibold">
                <p className="font-bold flex items-center gap-1.5 leading-none">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Kasir Terintegrasi:
                </p>
                <p>
                  Kode barcode <span className="font-mono font-extrabold bg-emerald-500/15 px-1 py-0.5 rounded text-primary">{selectedBarcodeProduct.code}</span> ini dapat dipindai pada menu Kasir menggunakan kamera ponsel atau simulator barcode untuk langsung menambahkan produk ini ke keranjang belanja pelanggan secara otomatis.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const stickerHtml = document.getElementById("printable-barcode-sticker")?.innerHTML;
                    if (stickerHtml) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Cetak Barcode - ${selectedBarcodeProduct.name}</title>
                              <style>
                                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                                .sticker { border: 1px solid #ccc; padding: 30px; text-align: center; border-radius: 12px; width: 280px; }
                                .text-xs { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
                                .text-price { font-size: 13px; font-weight: bold; color: rgb(75, 107, 240); margin-bottom: 12px; }
                                .barcode { display: flex; flex-direction: column; align-items: center; }
                                @media print {
                                  body { height: auto; }
                                  .sticker { border: none; }
                                }
                              </style>
                            </head>
                            <body onload="window.print();window.close()">
                              <div class="sticker">
                                ${stickerHtml}
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }
                  }}
                  className="px-4 py-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-100 dark:border-zinc-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Cetak Label
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBarcodeProduct(null);
                  }}
                  className="px-4 py-3 bg-primary text-white hover:opacity-95 rounded-2xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
