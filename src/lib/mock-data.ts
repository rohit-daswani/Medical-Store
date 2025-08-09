import { Medicine, Transaction, InventoryItem } from '@/types';

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    expiryDate: '2025-12-31',
    batchNo: 'PCM001',
    supplier: 'Cipla Ltd',
    isScheduleH: false,
    price: 25.50,
    stockQuantity: 150,
    minStockLevel: 20,
    category: 'Analgesic',
    manufacturer: 'Cipla Ltd'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    expiryDate: '2025-06-15',
    batchNo: 'AMX002',
    supplier: 'Sun Pharma',
    isScheduleH: true,
    price: 45.00,
    stockQuantity: 8,
    minStockLevel: 15,
    category: 'Antibiotic',
    manufacturer: 'Sun Pharma'
  },
  {
    id: '3',
    name: 'Cetirizine 10mg',
    expiryDate: '2025-03-20',
    batchNo: 'CTZ003',
    supplier: 'Dr. Reddy\'s',
    isScheduleH: false,
    price: 18.75,
    stockQuantity: 75,
    minStockLevel: 25,
    category: 'Antihistamine',
    manufacturer: 'Dr. Reddy\'s'
  },
  {
    id: '4',
    name: 'Azithromycin 500mg',
    expiryDate: '2025-01-10',
    batchNo: 'AZT004',
    supplier: 'Lupin Ltd',
    isScheduleH: true,
    price: 85.00,
    stockQuantity: 12,
    minStockLevel: 10,
    category: 'Antibiotic',
    manufacturer: 'Lupin Ltd'
  },
  {
    id: '5',
    name: 'Omeprazole 20mg',
    expiryDate: '2025-08-30',
    batchNo: 'OMP005',
    supplier: 'Ranbaxy',
    isScheduleH: false,
    price: 32.25,
    stockQuantity: 95,
    minStockLevel: 30,
    category: 'Proton Pump Inhibitor',
    manufacturer: 'Ranbaxy'
  },
  {
    id: '6',
    name: 'Metformin 500mg',
    expiryDate: '2025-11-25',
    batchNo: 'MET006',
    supplier: 'Glenmark',
    isScheduleH: false,
    price: 28.50,
    stockQuantity: 120,
    minStockLevel: 40,
    category: 'Antidiabetic',
    manufacturer: 'Glenmark'
  },
  {
    id: '7',
    name: 'Diclofenac 50mg',
    expiryDate: '2025-02-14',
    batchNo: 'DCF007',
    supplier: 'Torrent Pharma',
    isScheduleH: true,
    price: 22.00,
    stockQuantity: 5,
    minStockLevel: 20,
    category: 'NSAID',
    manufacturer: 'Torrent Pharma'
  },
  {
    id: '8',
    name: 'Vitamin D3 60000 IU',
    expiryDate: '2025-09-18',
    batchNo: 'VTD008',
    supplier: 'Abbott',
    isScheduleH: false,
    price: 65.00,
    stockQuantity: 45,
    minStockLevel: 15,
    category: 'Vitamin',
    manufacturer: 'Abbott'
  },
  {
    id: '9',
    name: 'Tramadol 50mg',
    expiryDate: '2025-04-22',
    batchNo: 'TRM009',
    supplier: 'Cadila Healthcare',
    isScheduleH: true,
    price: 42.75,
    stockQuantity: 18,
    minStockLevel: 12,
    category: 'Analgesic',
    manufacturer: 'Cadila Healthcare'
  },
  {
    id: '10',
    name: 'Aspirin 75mg',
    expiryDate: '2025-07-08',
    batchNo: 'ASP010',
    supplier: 'Bayer',
    isScheduleH: false,
    price: 15.25,
    stockQuantity: 200,
    minStockLevel: 50,
    category: 'Antiplatelet',
    manufacturer: 'Bayer'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'sell',
    items: [
      {
        medicineId: '1',
        medicineName: 'Paracetamol 500mg',
        quantity: 2,
        price: 25.50,
        batchNo: 'PCM001',
        expiryDate: '2025-12-31'
      }
    ],
    totalAmount: 51.00,
    date: '2024-12-20T10:30:00Z',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91-9876543210',
    gstAmount: 9.18,
    invoiceNumber: 'INV001',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN002',
    type: 'purchase',
    items: [
      {
        medicineId: '2',
        medicineName: 'Amoxicillin 250mg',
        quantity: 50,
        price: 35.00,
        batchNo: 'AMX002',
        expiryDate: '2025-06-15'
      }
    ],
    totalAmount: 1750.00,
    date: '2024-12-19T14:15:00Z',
    gstAmount: 315.00,
    invoiceNumber: 'PUR001',
    paymentMethod: 'card'
  }
];

// Helper functions for data management
export class DataStore {
  private static medicines: Medicine[] = [...mockMedicines];
  private static transactions: Transaction[] = [...mockTransactions];

  static getMedicines(): Medicine[] {
    return this.medicines;
  }

  static getMedicineById(id: string): Medicine | undefined {
    return this.medicines.find(med => med.id === id);
  }

  static searchMedicines(query: string): Medicine[] {
    if (!query) return this.medicines;
    
    const lowercaseQuery = query.toLowerCase();
    return this.medicines.filter(med => 
      med.name.toLowerCase().includes(lowercaseQuery) ||
      med.manufacturer.toLowerCase().includes(lowercaseQuery) ||
      med.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getInventory(): InventoryItem[] {
    return this.medicines.map(medicine => ({
      medicineId: medicine.id,
      medicine,
      quantity: medicine.stockQuantity,
      isLowStock: medicine.stockQuantity <= medicine.minStockLevel,
      daysToExpiry: this.calculateDaysToExpiry(medicine.expiryDate)
    }));
  }

  static getExpiringMedicines(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.medicines
      .filter(med => {
        const expiryDate = new Date(med.expiryDate);
        return expiryDate <= cutoffDate && expiryDate > new Date();
      })
      .map(med => ({
        id: med.id,
        name: med.name,
        expiryDate: med.expiryDate,
        batchNo: med.batchNo,
        supplier: med.supplier,
        quantity: med.stockQuantity,
        daysToExpiry: this.calculateDaysToExpiry(med.expiryDate)
      }));
  }

  static addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: `TXN${String(this.transactions.length + 1).padStart(3, '0')}`
    };
    
    this.transactions.push(newTransaction);
    
    // Update inventory based on transaction
    if (transaction.type === 'sell') {
      transaction.items.forEach(item => {
        const medicine = this.medicines.find(med => med.id === item.medicineId);
        if (medicine) {
          medicine.stockQuantity -= item.quantity;
        }
      });
    } else if (transaction.type === 'purchase') {
      transaction.items.forEach(item => {
        const medicine = this.medicines.find(med => med.id === item.medicineId);
        if (medicine) {
          medicine.stockQuantity += item.quantity;
        }
      });
    }
    
    return newTransaction;
  }

  static getTransactions(type?: 'sell' | 'purchase'): Transaction[] {
    if (type) {
      return this.transactions.filter(txn => txn.type === type);
    }
    return this.transactions;
  }

  static getTransactionsByDateRange(startDate: string, endDate: string): Transaction[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= start && txnDate <= end;
    });
  }

  private static calculateDaysToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const monthlyTransactions = this.transactions.filter(txn => 
      new Date(txn.date) >= startOfMonth
    );

    const todayTransactions = this.transactions.filter(txn => 
      new Date(txn.date) >= startOfDay
    );

    const totalSales = monthlyTransactions
      .filter(txn => txn.type === 'sell')
      .reduce((sum, txn) => sum + txn.totalAmount, 0);

    const totalPurchases = monthlyTransactions
      .filter(txn => txn.type === 'purchase')
      .reduce((sum, txn) => sum + txn.totalAmount, 0);

    const lowStockCount = this.medicines.filter(med => 
      med.stockQuantity <= med.minStockLevel
    ).length;

    const expiringCount = this.getExpiringMedicines(30).length;

    return {
      totalSales,
      totalPurchases,
      lowStockCount,
      expiringCount,
      todayTransactions: todayTransactions.length,
      monthlyRevenue: totalSales
    };
  }
}
