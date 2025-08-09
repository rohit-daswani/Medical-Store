export interface Medicine {
  id: string;
  name: string;
  expiryDate: string;
  batchNo: string;
  supplier: string;
  isScheduleH: boolean;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  category: string;
  manufacturer: string;
}

export interface TransactionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  batchNo: string;
  expiryDate: string;
}

export interface Transaction {
  id: string;
  type: 'sell' | 'purchase';
  items: TransactionItem[];
  totalAmount: number;
  date: string;
  customerName?: string;
  customerPhone?: string;
  prescriptionFiles?: string[];
  gstAmount: number;
  invoiceNumber: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface InventoryItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  isLowStock: boolean;
  daysToExpiry: number;
}

export interface TaxData {
  totalSales: number;
  totalPurchases: number;
  gstCollected: number;
  gstPaid: number;
  netProfit: number;
  transactions: Transaction[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ExpiringMedicine {
  id: string;
  name: string;
  expiryDate: string;
  batchNo: string;
  supplier: string;
  quantity: number;
  daysToExpiry: number;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  lowStockCount: number;
  expiringCount: number;
  todayTransactions: number;
  monthlyRevenue: number;
}
