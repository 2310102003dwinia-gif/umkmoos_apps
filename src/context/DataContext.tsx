import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Employee, Attendance, Sale, ClerkingRecord } from '../types';
import { useAuth } from './AuthContext';

interface Category {
  id: string;
  name: string;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  employees: Employee[];
  attendance: Attendance[];
  sales: Sale[];
  clerkingRecords: ClerkingRecord[];
  appMode: 'professional' | 'trial';
  setAppMode: (mode: 'professional' | 'trial') => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addEmployee: (employee: Employee) => void;
  addAttendance: (attendance: Attendance) => void;
  addSale: (sale: Sale) => void;
  addClerkingRecord: (record: ClerkingRecord) => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to generate dynamic Seblak sales timestamps relative to current time
const generateSeblakSales = (): Sale[] => {
  const list: Sale[] = [];
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const formatWithLocale = (dateObj: Date, hourOffset = 0, minuteOffset = 0) => {
    const d = new Date(dateObj);
    // Be careful with direct hour modifications to avoid index error
    d.setHours(Math.max(0, Math.min(23, d.getHours() + hourOffset)));
    d.setMinutes(Math.max(0, Math.min(59, d.getMinutes() + minuteOffset)));
    return d.toLocaleString('id-ID');
  };

  // Transaction 1: Today, ~3 hours ago
  const tx1Id = 'TX_SEB_T1';
  const t1Time = formatWithLocale(today, -3, 0);
  list.push(
    { id: 'sal_seb_1_1', transactionId: tx1Id, productId: 'sp6', quantity: 2, unitPrice: 3000, totalPrice: 6000, transactionTime: t1Time, cashierId: 'Ahmad Rafli', paymentMethod: 'QRIS', status: 'completed' },
    { id: 'sal_seb_1_2', transactionId: tx1Id, productId: 'sp7', quantity: 1, unitPrice: 2000, totalPrice: 2000, transactionTime: t1Time, cashierId: 'Ahmad Rafli', paymentMethod: 'QRIS', status: 'completed' },
    { id: 'sal_seb_1_3', transactionId: tx1Id, productId: 'sp9', quantity: 1, unitPrice: 3000, totalPrice: 3000, transactionTime: t1Time, cashierId: 'Ahmad Rafli', paymentMethod: 'QRIS', status: 'completed' },
    { id: 'sal_seb_1_4', transactionId: tx1Id, productId: 'sp11', quantity: 1, unitPrice: 4000, totalPrice: 4000, transactionTime: t1Time, cashierId: 'Ahmad Rafli', paymentMethod: 'QRIS', status: 'completed' }
  );

  // Transaction 2: Today, ~1 hour ago
  const tx2Id = 'TX_SEB_T2';
  const t2Time = formatWithLocale(today, -1, -15);
  list.push(
    { id: 'sal_seb_2_1', transactionId: tx2Id, productId: 'sp1', quantity: 3, unitPrice: 1000, totalPrice: 3000, transactionTime: t2Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_2_2', transactionId: tx2Id, productId: 'sp3', quantity: 2, unitPrice: 2000, totalPrice: 4000, transactionTime: t2Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_2_3', transactionId: tx2Id, productId: 'sp11', quantity: 2, unitPrice: 4000, totalPrice: 8000, transactionTime: t2Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' }
  );

  // Transaction 3: Today, ~30 mins ago
  const tx3Id = 'TX_SEB_T3';
  const t3Time = formatWithLocale(today, 0, -30);
  list.push(
    { id: 'sal_seb_3_1', transactionId: tx3Id, productId: 'sp4', quantity: 2, unitPrice: 2000, totalPrice: 4000, transactionTime: t3Time, cashierId: 'Ahmad Rafli', paymentMethod: 'E-wallet', status: 'completed' },
    { id: 'sal_seb_3_2', transactionId: tx3Id, productId: 'sp5', quantity: 3, unitPrice: 1500, totalPrice: 4500, transactionTime: t3Time, cashierId: 'Ahmad Rafli', paymentMethod: 'E-wallet', status: 'completed' },
    { id: 'sal_seb_3_3', transactionId: tx3Id, productId: 'sp8', quantity: 2, unitPrice: 1200, totalPrice: 2400, transactionTime: t3Time, cashierId: 'Ahmad Rafli', paymentMethod: 'E-wallet', status: 'completed' }
  );

  // Transaction 4: Yesterday, ~12:00 PM
  const tx4Id = 'TX_SEB_T4';
  const t4Time = formatWithLocale(yesterday, -4, 30);
  list.push(
    { id: 'sal_seb_4_1', transactionId: tx4Id, productId: 'sp2', quantity: 4, unitPrice: 1000, totalPrice: 4000, transactionTime: t4Time, cashierId: 'Siti Aminah', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_4_2', transactionId: tx4Id, productId: 'sp10', quantity: 2, unitPrice: 1000, totalPrice: 2000, transactionTime: t4Time, cashierId: 'Siti Aminah', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_4_3', transactionId: tx4Id, productId: 'sp12', quantity: 2, unitPrice: 5000, totalPrice: 10000, transactionTime: t4Time, cashierId: 'Siti Aminah', paymentMethod: 'Cash', status: 'completed' }
  );

  // Transaction 5: Yesterday, ~4:30 PM
  const tx5Id = 'TX_SEB_T5';
  const t5Time = formatWithLocale(yesterday, 1, 0);
  list.push(
    { id: 'sal_seb_5_1', transactionId: tx5Id, productId: 'sp6', quantity: 4, unitPrice: 3000, totalPrice: 12000, transactionTime: t5Time, cashierId: 'Siti Aminah', paymentMethod: 'QRIS', status: 'completed' },
    { id: 'sal_seb_5_2', transactionId: tx5Id, productId: 'sp7', quantity: 2, unitPrice: 2000, totalPrice: 4000, transactionTime: t5Time, cashierId: 'Siti Aminah', paymentMethod: 'QRIS', status: 'completed' },
    { id: 'sal_seb_5_3', transactionId: tx5Id, productId: 'sp3', quantity: 3, unitPrice: 2000, totalPrice: 6000, transactionTime: t5Time, cashierId: 'Siti Aminah', paymentMethod: 'QRIS', status: 'completed' }
  );

  // Transaction 6: Two days ago, ~6:00 PM
  const tx6Id = 'TX_SEB_T6';
  const t6Time = formatWithLocale(twoDaysAgo, 3, 0);
  list.push(
    { id: 'sal_seb_6_1', transactionId: tx6Id, productId: 'sp1', quantity: 5, unitPrice: 1000, totalPrice: 5000, transactionTime: t6Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_6_2', transactionId: tx6Id, productId: 'sp9', quantity: 2, unitPrice: 3000, totalPrice: 6000, transactionTime: t6Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' },
    { id: 'sal_seb_6_3', transactionId: tx6Id, productId: 'sp11', quantity: 3, unitPrice: 4000, totalPrice: 12000, transactionTime: t6Time, cashierId: 'Ahmad Rafli', paymentMethod: 'Cash', status: 'completed' }
  );

  return list;
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Ensure that for professional mode (as well as trial mode) we isolate data clearly per registered email account.
  const userKey = user?.email ? user.email.toLowerCase().trim() : (user?.id || 'guest');

  const [appMode, setAppModeState] = useState<'professional' | 'trial'>(() => {
    // Dynamically retrieve stored mode for the current user email/id
    const saved = localStorage.getItem(`umkmoo_active_mode_${userKey}`);
    return (saved as 'professional' | 'trial') || 'professional';
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clerkingRecords, setClerkingRecords] = useState<ClerkingRecord[]>([]);

  // Update mode state whenever user logs in or logs out
  useEffect(() => {
    if (userKey && userKey !== 'guest') {
      const saved = localStorage.getItem(`umkmoo_active_mode_${userKey}`);
      setAppModeState((saved as 'professional' | 'trial') || 'professional');
    } else {
      setAppModeState('professional');
    }
  }, [userKey]);

  const setAppMode = (mode: 'professional' | 'trial') => {
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`umkmoo_active_mode_${userKey}`, mode);
    }
    setAppModeState(mode);
  };

  // Load user-specific data depending on active mode (Professional vs Trial)
  useEffect(() => {
    if (userKey && userKey !== 'guest') {
      const modeSuffix = appMode === 'trial' ? '_trial' : '';

      // 1. Categories
      let savedCategories = localStorage.getItem(`umkmoo_categories_${userKey}${modeSuffix}`);
      if (!savedCategories && user?.id) {
        // Fallback migration to support legacy profiles gracefully
        savedCategories = localStorage.getItem(`umkmoo_categories_${user.id}${modeSuffix}`);
      }
      let parsedCategories = savedCategories ? JSON.parse(savedCategories) : [];

      // 2. Products
      let savedProducts = localStorage.getItem(`umkmoo_products_${userKey}${modeSuffix}`);
      if (!savedProducts && user?.id) {
        // Fallback migration to support legacy profiles gracefully
        savedProducts = localStorage.getItem(`umkmoo_products_${user.id}${modeSuffix}`);
      }
      let parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];

      // 3. Employees
      let savedEmployees = localStorage.getItem(`umkmoo_employees_${userKey}${modeSuffix}`);
      if (!savedEmployees && user?.id) {
        // Fallback migration to support legacy profiles gracefully
        savedEmployees = localStorage.getItem(`umkmoo_employees_${user.id}${modeSuffix}`);
      }
      let parsedEmployees = savedEmployees ? JSON.parse(savedEmployees) : [];

      // 4. Sales
      let savedSales = localStorage.getItem(`umkmoo_sales_${userKey}${modeSuffix}`);
      if (!savedSales && user?.id) {
        // Fallback migration to support legacy profiles gracefully
        savedSales = localStorage.getItem(`umkmoo_sales_${user.id}${modeSuffix}`);
      }
      let parsedSales = savedSales ? JSON.parse(savedSales) : [];

      // Populating Trial Mode with custom Seblak Prasmanan dummy data if empty
      if (appMode === 'trial' && parsedProducts.length === 0 && parsedCategories.length === 0) {
        parsedCategories = [
          { id: 'scat1', name: 'Isian Seblak (Prasmanan)' },
          { id: 'scat2', name: 'Sayuran & Telur' },
          { id: 'scat3', name: 'Kuah & Level' },
          { id: 'scat4', name: 'Minuman' }
        ];

        const todayString = new Date().toLocaleDateString('id-ID');
        parsedProducts = [
          { id: 'sp1', code: 'SEB01', name: 'Kerupuk Aci (Warna-warni)', category: 'Isian Seblak (Prasmanan)', stock: 300, price: 1000, entryDate: todayString, isConsignment: false },
          { id: 'sp2', code: 'SEB02', name: 'Kerupuk Makaroni', category: 'Isian Seblak (Prasmanan)', stock: 250, price: 1000, entryDate: todayString, isConsignment: false },
          { id: 'sp3', code: 'SEB03', name: 'Bakso Sapi Premium', category: 'Isian Seblak (Prasmanan)', stock: 150, price: 2000, entryDate: todayString, isConsignment: false },
          { id: 'sp4', code: 'SEB04', name: 'Sosis Sapi Jumbo', category: 'Isian Seblak (Prasmanan)', stock: 120, price: 2000, entryDate: todayString, isConsignment: false },
          { id: 'sp5', code: 'SEB05', name: 'Chikuwa', category: 'Isian Seblak (Prasmanan)', stock: 180, price: 1500, entryDate: todayString, isConsignment: false },
          { id: 'sp6', code: 'SEB06', name: 'Dumpling Keju', category: 'Isian Seblak (Prasmanan)', stock: 100, price: 3000, entryDate: todayString, isConsignment: false },
          { id: 'sp7', code: 'SEB07', name: 'Mie Kuning Tulang', category: 'Isian Seblak (Prasmanan)', stock: 160, price: 2000, entryDate: todayString, isConsignment: false },
          { id: 'sp8', code: 'SEB08', name: 'Cuanki Lidah', category: 'Isian Seblak (Prasmanan)', stock: 200, price: 1200, entryDate: todayString, isConsignment: false },
          { id: 'sp9', code: 'SEB09', name: 'Telur Ayam Bulat', category: 'Sayuran & Telur', stock: 80, price: 3000, entryDate: todayString, isConsignment: false },
          { id: 'sp10', code: 'SEB10', name: 'Sawi Hijau Segar', category: 'Sayuran & Telur', stock: 150, price: 1000, entryDate: todayString, isConsignment: false },
          { id: 'sp11', code: 'DRK01', name: 'Es Teh Manis Jumbo', category: 'Minuman', stock: 200, price: 4000, entryDate: todayString, isConsignment: false },
          { id: 'sp12', code: 'DRK02', name: 'Es Jeruk Peras', category: 'Minuman', stock: 100, price: 5000, entryDate: todayString, isConsignment: false }
        ];

        parsedEmployees = [
          { id: 'e1_seb', employeeId: 'EMP001', name: 'Ahmad Rafli', role: 'Kasir', businessType: 'FnB', schedule: ['Monday', 'Tuesday', 'Wednesday'] },
          { id: 'e2_seb', employeeId: 'EMP002', name: 'Siti Aminah', role: 'Manajer Toko', businessType: 'FnB', schedule: ['Thursday', 'Friday', 'Saturday'] },
          { id: 'e3_seb', employeeId: 'EMP003', name: 'Mulyadi', role: 'Staf Dapur Seblak', businessType: 'FnB', schedule: ['Wednesday', 'Thursday', 'Friday'] }
        ];

        parsedSales = generateSeblakSales();

        // Save immediately to local storage under the new userKey
        localStorage.setItem(`umkmoo_categories_${userKey}${modeSuffix}`, JSON.stringify(parsedCategories));
        localStorage.setItem(`umkmoo_products_${userKey}${modeSuffix}`, JSON.stringify(parsedProducts));
        localStorage.setItem(`umkmoo_employees_${userKey}${modeSuffix}`, JSON.stringify(parsedEmployees));
        localStorage.setItem(`umkmoo_sales_${userKey}${modeSuffix}`, JSON.stringify(parsedSales));
      }

      setCategories(parsedCategories);
      setProducts(parsedProducts);
      setEmployees(parsedEmployees);
      setSales(parsedSales);

      // Attendance
      let savedAttendance = localStorage.getItem(`umkmoo_attendance_${userKey}${modeSuffix}`);
      if (!savedAttendance && user?.id) {
        savedAttendance = localStorage.getItem(`umkmoo_attendance_${user.id}${modeSuffix}`);
      }
      setAttendance(savedAttendance ? JSON.parse(savedAttendance) : []);

      // Clerking
      let savedClerking = localStorage.getItem(`umkmoo_clerking_${userKey}${modeSuffix}`);
      if (!savedClerking && user?.id) {
        savedClerking = localStorage.getItem(`umkmoo_clerking_${user.id}${modeSuffix}`);
      }
      setClerkingRecords(savedClerking ? JSON.parse(savedClerking) : []);
    } else {
      // Clean up states when no user logged in
      setCategories([]);
      setProducts([]);
      setEmployees([]);
      setAttendance([]);
      setSales([]);
      setClerkingRecords([]);
    }
  }, [userKey, appMode, user?.id]);

  const addProduct = (product: Product) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setProducts(prev => {
      const next = [product, ...prev];
      localStorage.setItem(`umkmoo_products_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const updateProduct = (product: Product) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setProducts(prev => {
      const next = prev.map(p => p.id === product.id ? product : p);
      localStorage.setItem(`umkmoo_products_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(`umkmoo_products_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const addCategory = (name: string) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    const newCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name
    };
    setCategories(prev => {
      const next = [...prev, newCategory];
      localStorage.setItem(`umkmoo_categories_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const deleteCategory = (id: string) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem(`umkmoo_categories_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const addEmployee = (employee: Employee) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setEmployees(prev => {
      const next = [employee, ...prev];
      localStorage.setItem(`umkmoo_employees_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const addAttendance = (record: Attendance) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setAttendance(prev => {
      const next = [record, ...prev];
      localStorage.setItem(`umkmoo_attendance_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const addSale = (sale: Sale) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setSales(prev => {
      const next = [sale, ...prev];
      localStorage.setItem(`umkmoo_sales_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
    // Also update product stock which needs to be saved
    setProducts(prev => {
      const next = prev.map(p => 
        p.id === sale.productId ? { ...p, stock: Math.max(0, p.stock - sale.quantity) } : p
      );
      localStorage.setItem(`umkmoo_products_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const addClerkingRecord = (record: ClerkingRecord) => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setClerkingRecords(prev => {
      const next = [record, ...prev];
      localStorage.setItem(`umkmoo_clerking_${userKey}${modeSuffix}`, JSON.stringify(next));
      return next;
    });
  };

  const clearAllData = () => {
    if (userKey === 'guest') return;
    const modeSuffix = appMode === 'trial' ? '_trial' : '';
    setProducts([]);
    setCategories([]);
    setEmployees([]);
    setAttendance([]);
    setSales([]);
    setClerkingRecords([]);
    localStorage.removeItem(`umkmoo_products_${userKey}${modeSuffix}`);
    localStorage.removeItem(`umkmoo_categories_${userKey}${modeSuffix}`);
    localStorage.removeItem(`umkmoo_employees_${userKey}${modeSuffix}`);
    localStorage.removeItem(`umkmoo_attendance_${userKey}${modeSuffix}`);
    localStorage.removeItem(`umkmoo_sales_${userKey}${modeSuffix}`);
    localStorage.removeItem(`umkmoo_clerking_${userKey}${modeSuffix}`);
  };

  return (
    <DataContext.Provider value={{ 
      products, 
      categories, 
      employees,
      attendance,
      sales,
      clerkingRecords,
      appMode,
      setAppMode,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addCategory, 
      deleteCategory,
      addEmployee,
      addAttendance,
      addSale,
      addClerkingRecord,
      clearAllData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
