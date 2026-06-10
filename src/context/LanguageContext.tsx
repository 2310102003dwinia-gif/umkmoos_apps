import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    dashboard: 'Dasbor',
    cashier: 'Kasir',
    inventory: 'Stok Barang',
    employees: 'Karyawan',
    reports: 'Laporan',
    settings: 'Pengaturan',
    overview: 'Ringkasan',
    sales: 'Penjualan',
    profit: 'Keuntungan',
    stock: 'Stok',
    add_stock: 'Tambah Stok',
    search: 'Cari...',
    checkout: 'Bayar',
    receipt: 'Struk',
    sharia_accounting: 'Akuntansi Syariah',
    zakat: 'Zakat Maal',
    chat: 'Pusat Bantuan',
    online: 'Online',
    offline: 'Offline',
  },
  en: {
    dashboard: 'Dashboard',
    cashier: 'Cashier',
    inventory: 'Inventory',
    employees: 'Employees',
    reports: 'Reports',
    settings: 'Settings',
    overview: 'Overview',
    sales: 'Sales',
    profit: 'Profit',
    stock: 'Stock',
    add_stock: 'Add Stock',
    search: 'Search...',
    checkout: 'Checkout',
    receipt: 'Receipt',
    sharia_accounting: 'Sharia Accounting',
    zakat: 'Zakat Maal',
    chat: 'Chat Center',
    online: 'Online',
    offline: 'Offline',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['id']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
