export interface UserAccount {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: 'retail' | 'fnb' | 'health' | 'service';
  address: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  // Supabase fields
  businessId?: string;  // UUID dari tabel public.businesses
  role?: 'admin' | 'kasir' | 'akuntan' | 'logistik';
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  entryDate: string;
  isConsignment: boolean; // Produk titipan
}

export interface Sale {
  id: string;
  transactionId: string; // New field for grouping multiple items in one transaction
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  transactionTime: string;
  cashierId: string;
  paymentMethod: 'Cash' | 'QRIS' | 'E-wallet' | 'Transfer';
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Employee {
  id: string;
  employeeId: string; // Public ID like EMP001
  name: string;
  role: string;
  businessType: string;
  schedule: string[];
}

export interface Attendance {
  id: string;
  employeeId: string; // Refers to Employee.id
  date: string;
  clockIn: string; // Changed from checkIn to clockIn
  clockOut?: string;
  status: 'present' | 'sick' | 'alpha' | 'late';
  medicalProofUrl?: string; // For SKD photo
}

export interface CashDenomination {
  k100: number; // Rp100.000
  k50: number;  // Rp50.000
  k20: number;  // Rp20.000
  k10: number;  // Rp10.000
  k5: number;   // Rp5.000
  k2: number;   // Rp2.000
  k1: number;   // Rp1.000
  coins: number;
}

export interface ClerkingRecord {
  id: string;
  date: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  cashierName: string;
  initialCapital: number;
  cashIncome: number;
  qrisIncome: number;
  cardIncome: number;
  pettyCashExpense: number;
  systemTotal: number; // Total physical cash that SHOULD be there (Initial + CashIncome - Expense)
  physicalCashDenominations: CashDenomination;
  totalPhysicalCash: number;
  difference: number;
  status: 'SESUAI' | 'LEBIH' | 'KURANG';
  notes?: string;
  isLocked: boolean;
  createdAt: string;
}
