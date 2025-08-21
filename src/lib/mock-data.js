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
    mrp: 30.00,
    stockQuantity: 150,
    minStockLevel: 20,
    category: 'Analgesic',
    manufacturer: 'Cipla Ltd',
    gstRate: 5,
    fifoLots: [
      {
        id: 'lot_1',
        batchNo: 'PCM001',
        expiryDate: '2025-12-31',
        quantity: 150,
        purchasePrice: 25.50,
        purchaseDate: '2024-01-15T00:00:00.000Z',
        supplierId: 'supplier_1',
        supplierName: 'Cipla Ltd',
        gstRate: 5
      }
    ]
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    expiryDate: '2025-06-15',
    batchNo: 'AMX002',
    supplier: 'Sun Pharma',
    isScheduleH: true,
    price: 45.00,
    mrp: 54.00,
    stockQuantity: 8,
    minStockLevel: 15,
    category: 'Antibiotic',
    manufacturer: 'Sun Pharma',
    gstRate: 12,
    fifoLots: [
      {
        id: 'lot_2',
        batchNo: 'AMX002',
        expiryDate: '2025-06-15',
        quantity: 8,
        purchasePrice: 45.00,
        purchaseDate: '2024-02-10T00:00:00.000Z',
        supplierId: 'supplier_2',
        supplierName: 'Sun Pharma',
        gstRate: 12
      }
    ]
  },
  {
    id: '3',
    name: 'Cetirizine 10mg',
    expiryDate: '2025-03-20',
    batchNo: 'CTZ003',
    supplier: 'Dr. Reddy\'s',
    isScheduleH: false,
    price: 18.75,
    mrp: 22.50,
    stockQuantity: 75,
    minStockLevel: 25,
    category: 'Antihistamine',
    manufacturer: 'Dr. Reddy\'s',
    gstRate: 12
  },
  {
    id: '4',
    name: 'Azithromycin 500mg',
    expiryDate: '2025-01-10',
    batchNo: 'AZT004',
    supplier: 'Lupin Ltd',
    isScheduleH: true,
    price: 85.00,
    mrp: 102.00,
    stockQuantity: 12,
    minStockLevel: 10,
    category: 'Antibiotic',
    manufacturer: 'Lupin Ltd',
    gstRate: 12
  },
  {
    id: '5',
    name: 'Omeprazole 20mg',
    expiryDate: '2025-08-30',
    batchNo: 'OMP005',
    supplier: 'Ranbaxy',
    isScheduleH: false,
    price: 32.25,
    mrp: 38.70,
    stockQuantity: 95,
    minStockLevel: 30,
    category: 'Proton Pump Inhibitor',
    manufacturer: 'Ranbaxy',
    gstRate: 12
  },
  {
    id: '6',
    name: 'Metformin 500mg',
    expiryDate: '2025-11-25',
    batchNo: 'MET006',
    supplier: 'Glenmark',
    isScheduleH: false,
    price: 28.50,
    mrp: 34.20,
    stockQuantity: 120,
    minStockLevel: 40,
    category: 'Antidiabetic',
    manufacturer: 'Glenmark',
    gstRate: 12
  },
  {
    id: '7',
    name: 'Diclofenac 50mg',
    expiryDate: '2025-02-14',
    batchNo: 'DCF007',
    supplier: 'Torrent Pharma',
    isScheduleH: true,
    price: 22.00,
    mrp: 26.40,
    stockQuantity: 5,
    minStockLevel: 20,
    category: 'NSAID',
    manufacturer: 'Torrent Pharma',
    gstRate: 12
  },
  {
    id: '8',
    name: 'Vitamin D3 60000 IU',
    expiryDate: '2025-09-18',
    batchNo: 'VTD008',
    supplier: 'Abbott',
    isScheduleH: false,
    price: 65.00,
    mrp: 78.00,
    stockQuantity: 45,
    minStockLevel: 15,
    category: 'Vitamin',
    manufacturer: 'Abbott',
    gstRate: 18
  },
  {
    id: '9',
    name: 'Tramadol 50mg',
    expiryDate: '2025-04-22',
    batchNo: 'TRM009',
    supplier: 'Cadila Healthcare',
    isScheduleH: true,
    price: 42.75,
    mrp: 51.30,
    stockQuantity: 18,
    minStockLevel: 12,
    category: 'Analgesic',
    manufacturer: 'Cadila Healthcare',
    gstRate: 5
  },
  {
    id: '10',
    name: 'Aspirin 75mg',
    expiryDate: '2025-07-08',
    batchNo: 'ASP010',
    supplier: 'Bayer',
    isScheduleH: false,
    price: 15.25,
    mrp: 18.30,
    stockQuantity: 200,
    minStockLevel: 50,
    category: 'Antiplatelet',
    manufacturer: 'Bayer',
    gstRate: 12
  }
];

// Generate dynamic monthly scenarios from Jan 2024 to current month with significant profits
const generateMonthlyScenarios = (): { month: number; year: number; scenario: string; salesMultiplier: number; purchaseMultiplier: number }[] => {
  const scenarios = [];
  // Set start date: Jan 2024
  const startYear = 2024;
  const startMonth = 0; // January is 0
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // current month in zero-based indexing

  let year = startYear;
  let month = startMonth;
  
  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    // Create varied profit scenarios with different multipliers for realistic data
    let salesMultiplier, purchaseMultiplier;
    
    // Add some variation while ensuring profit
    const variation = Math.random() * 0.3; // 0 to 0.3 variation
    salesMultiplier = 1.4 + variation; // 1.4 to 1.7 range
    purchaseMultiplier = 0.7 + (variation * 0.5); // 0.7 to 0.85 range
    
    scenarios.push({
      month,
      year,
      scenario: 'profit',
      salesMultiplier,
      purchaseMultiplier
    });

    // Move to next month
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  
  return scenarios;
};

// Generate comprehensive transaction data from Jan 2024 to current date showing significant profits
const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  let transactionId = 1;
  let invoiceId = 1;
  let purchaseInvoiceId = 1;

  // Use dynamic scenarios from Jan 2024 to current month
  const monthlyScenarios = generateMonthlyScenarios();

  monthlyScenarios.forEach(({ month, year, scenario, salesMultiplier, purchaseMultiplier }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate 15-25 sales transactions per month
    const salesCount = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < salesCount; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const hour = Math.floor(Math.random() * 12) + 9; // 9 AM to 9 PM
      const minute = Math.floor(Math.random() * 60);
      
      const date = new Date(year, month, day, hour, minute);
      const medicineIndex = Math.floor(Math.random() * mockMedicines.length);
      const medicine = mockMedicines[medicineIndex];
      const quantity = Math.floor(Math.random() * 30) + 1;
      
      // Calculate selling price based on scenario
      const baseSellingPrice = medicine.mrp;
      const sellingPrice = baseSellingPrice * salesMultiplier;
      const totalAmount = sellingPrice * quantity;
      const gstAmount = totalAmount * 0.18;

      transactions.push({
        id: `TXN${String(transactionId++).padStart(3, '0')}`,
        type: 'sell',
        items: [{
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity,
          price: sellingPrice,
          batchNo: medicine.batchNo,
          expiryDate: medicine.expiryDate
        }],
        totalAmount,
        date: date.toISOString(),
        customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
        customerPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        gstAmount,
        invoiceNumber: `INV${String(invoiceId++).padStart(3, '0')}`,
        paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'upi'
      });
    }

    // Generate 8-15 purchase transactions per month
    const purchaseCount = Math.floor(Math.random() * 8) + 4;
    for (let i = 0; i < purchaseCount; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const hour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const minute = Math.floor(Math.random() * 60);
      
      const date = new Date(year, month, day, hour, minute);
      const medicineIndex = Math.floor(Math.random() * mockMedicines.length);
      const medicine = mockMedicines[medicineIndex];
      const quantity = Math.floor(Math.random() * 100) + 50;
      
      // Calculate purchase price based on scenario
      const basePurchasePrice = medicine.price;
      const purchasePrice = basePurchasePrice * purchaseMultiplier;
      const totalAmount = purchasePrice * quantity;
      const gstAmount = totalAmount * 0.18;

      transactions.push({
        id: `TXN${String(transactionId++).padStart(3, '0')}`,
        type: 'purchase',
        items: [{
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity,
          price: purchasePrice,
          batchNo: medicine.batchNo,
          expiryDate: medicine.expiryDate
        }],
        totalAmount,
        date: date.toISOString(),
        supplierName: medicine.supplier,
        supplierContact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        gstAmount,
        invoiceNumber: `PINV${String(purchaseInvoiceId++).padStart(3, '0')}`,
        paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'upi'
      });
    }
  });

  // Sort transactions by date
  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const mockTransactions: Transaction[] = generateTransactions();

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
    // Get regular medicines
    const regularInventory = this.medicines.map(medicine => ({
      medicineId: medicine.id,
      medicine,
      quantity: medicine.stockQuantity,
      isLowStock: medicine.stockQuantity <= medicine.minStockLevel,
      daysToExpiry: this.calculateDaysToExpiry(medicine.expiryDate),
      purchasePrice: medicine.price,
      mrp: medicine.mrp
    }));

    // Get bulk uploaded medicines from localStorage (only in browser environment)
    let bulkInventory: InventoryItem[] = [];
    if (typeof window !== 'undefined') {
      try {
        const bulkUploadedMedicines = JSON.parse(localStorage.getItem('bulkUploadedMedicines') || '[]');
        bulkInventory = bulkUploadedMedicines.map((medicine: any) => ({
          medicineId: medicine.id,
          medicine: {
            ...medicine,
            stockQuantity: medicine.stockQuantity,
            minStockLevel: medicine.minStockLevel || 10
          },
          quantity: medicine.stockQuantity,
          isLowStock: medicine.stockQuantity <= (medicine.minStockLevel || 10),
          daysToExpiry: this.calculateDaysToExpiry(medicine.expiryDate),
          purchasePrice: medicine.price,
          mrp: medicine.mrp || medicine.price * 1.2
        }));
      } catch (error) {
        console.error('Error loading bulk uploaded medicines:', error);
      }
    }

    // Combine both inventories
    return [...regularInventory, ...bulkInventory];
  }

  static getExpiringMedicines(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    // Get all medicines (regular + bulk uploaded)
    const allMedicines = [...this.medicines];
    
    // Add bulk uploaded medicines if in browser environment
    if (typeof window !== 'undefined') {
      try {
        const bulkUploadedMedicines = JSON.parse(localStorage.getItem('bulkUploadedMedicines') || '[]');
        allMedicines.push(...bulkUploadedMedicines);
      } catch (error) {
        console.error('Error loading bulk uploaded medicines for expiry check:', error);
      }
    }

    return allMedicines
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
        daysToExpiry: this.calculateDaysToExpiry(med.expiryDate),
        price: med.price,
        mrp: med.mrp,
        gstRate: med.gstRate
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

  // Get monthly revenue data for chart
  static getMonthlyRevenueData() {
    const monthlyData: { [key: string]: { sales: number; purchases: number; profit: number } } = {};
    
    this.transactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, purchases: 0, profit: 0 };
      }
      
      if (txn.type === 'sell') {
        monthlyData[monthKey].sales += txn.totalAmount;
      } else {
        monthlyData[monthKey].purchases += txn.totalAmount;
      }
    });

    // Calculate profit for each month
    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].profit = monthlyData[month].sales - monthlyData[month].purchases;
    });

    return monthlyData;
  }

  private static calculateDaysToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // FIFO Methods for inventory management
  static sellMedicineFromFIFO(medicineId: string, quantityToSell: number): { success: boolean; lots: any[]; message?: string } {
    const medicine = this.getMedicineById(medicineId);
    if (!medicine || !medicine.fifoLots) {
      return { success: false, lots: [], message: 'Medicine not found or no FIFO lots available' };
    }

    // Sort lots by purchase date (FIFO - First In, First Out)
    const sortedLots = [...medicine.fifoLots].sort((a, b) => 
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );

    let remainingQuantity = quantityToSell;
    const usedLots: any[] = [];

    for (let i = 0; i < sortedLots.length && remainingQuantity > 0; i++) {
      const lot = sortedLots[i];
      const quantityFromThisLot = Math.min(lot.quantity, remainingQuantity);
      
      usedLots.push({
        ...lot,
        quantityUsed: quantityFromThisLot,
        remainingInLot: lot.quantity - quantityFromThisLot
      });

      // Update the lot quantity
      lot.quantity -= quantityFromThisLot;
      remainingQuantity -= quantityFromThisLot;

      // Remove lot if quantity becomes 0
      if (lot.quantity === 0) {
        medicine.fifoLots = medicine.fifoLots.filter(l => l.id !== lot.id);
      }
    }

    // Update total stock quantity
    medicine.stockQuantity -= (quantityToSell - remainingQuantity);

    if (remainingQuantity > 0) {
      return { 
        success: false, 
        lots: usedLots, 
        message: `Insufficient stock. Only ${quantityToSell - remainingQuantity} units available.` 
      };
    }

    return { success: true, lots: usedLots };
  }

  static addMedicineToFIFO(medicineId: string, lot: any): boolean {
    const medicine = this.getMedicineById(medicineId);
    if (!medicine) return false;

    if (!medicine.fifoLots) {
      medicine.fifoLots = [];
    }

    medicine.fifoLots.push(lot);
    medicine.stockQuantity += lot.quantity;
    return true;
  }

  static calculateGSTBreakdown(items: any[]): { sgst: number; cgst: number; total: number } {
    const breakdown = { sgst: 0, cgst: 0, total: 0 };
    
    items.forEach(item => {
      const medicine = this.getMedicineById(item.medicineId);
      const gstRate = medicine?.gstRate || item.gstRate || 18;
      const itemTax = (item.totalAmount * gstRate) / 100;
      
      breakdown.sgst += itemTax / 2;
      breakdown.cgst += itemTax / 2;
      breakdown.total += itemTax;
    });

    return breakdown;
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

    // Get low stock count including bulk uploaded medicines
    const inventory = this.getInventory();
    const lowStockCount = inventory.filter(item => item.isLowStock).length;
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
