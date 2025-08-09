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
  // 2023 Transactions
  // January 2023
  {
    id: 'TXN001',
    type: 'sell',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 10, price: 25.50, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 255.00,
    date: '2023-01-15T10:30:00Z',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91-9876543210',
    gstAmount: 45.90,
    invoiceNumber: 'INV001',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN002',
    type: 'sell',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 8, price: 18.75, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 150.00,
    date: '2023-01-28T14:15:00Z',
    customerName: 'Priya Sharma',
    customerPhone: '+91-9123456789',
    gstAmount: 27.00,
    invoiceNumber: 'INV002',
    paymentMethod: 'card'
  },

  // February 2023
  {
    id: 'TXN003',
    type: 'sell',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 12, price: 32.25, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 387.00,
    date: '2023-02-10T11:00:00Z',
    customerName: 'Anita Singh',
    customerPhone: '+91-9988776655',
    gstAmount: 69.66,
    invoiceNumber: 'INV003',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN004',
    type: 'sell',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 15, price: 28.50, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 427.50,
    date: '2023-02-25T16:45:00Z',
    customerName: 'Vikram Patel',
    customerPhone: '+91-9876543210',
    gstAmount: 76.95,
    invoiceNumber: 'INV004',
    paymentMethod: 'cash'
  },

  // March 2023
  {
    id: 'TXN005',
    type: 'sell',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 6, price: 65.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 390.00,
    date: '2023-03-12T09:30:00Z',
    customerName: 'Meera Gupta',
    customerPhone: '+91-9123456789',
    gstAmount: 70.20,
    invoiceNumber: 'INV005',
    paymentMethod: 'card'
  },
  {
    id: 'TXN006',
    type: 'sell',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 20, price: 15.25, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 305.00,
    date: '2023-03-28T13:20:00Z',
    customerName: 'Ravi Kumar',
    customerPhone: '+91-9988776655',
    gstAmount: 54.90,
    invoiceNumber: 'INV006',
    paymentMethod: 'upi'
  },

  // April 2023
  {
    id: 'TXN007',
    type: 'sell',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 18, price: 25.50, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 459.00,
    date: '2023-04-08T10:15:00Z',
    customerName: 'Sunita Devi',
    customerPhone: '+91-9876543210',
    gstAmount: 82.62,
    invoiceNumber: 'INV007',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN008',
    type: 'sell',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 4, price: 45.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 180.00,
    date: '2023-04-22T15:30:00Z',
    customerName: 'Amit Joshi',
    customerPhone: '+91-9123456789',
    gstAmount: 32.40,
    invoiceNumber: 'INV008',
    paymentMethod: 'card'
  },

  // May 2023
  {
    id: 'TXN009',
    type: 'sell',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 3, price: 85.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 255.00,
    date: '2023-05-05T11:45:00Z',
    customerName: 'Deepak Singh',
    customerPhone: '+91-9988776655',
    gstAmount: 45.90,
    invoiceNumber: 'INV009',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN010',
    type: 'sell',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 10, price: 22.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 220.00,
    date: '2023-05-20T14:00:00Z',
    customerName: 'Kavita Sharma',
    customerPhone: '+91-9876543210',
    gstAmount: 39.60,
    invoiceNumber: 'INV010',
    paymentMethod: 'cash'
  },

  // June 2023
  {
    id: 'TXN011',
    type: 'sell',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 25, price: 18.75, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 468.75,
    date: '2023-06-10T09:00:00Z',
    customerName: 'Rohit Verma',
    customerPhone: '+91-9123456789',
    gstAmount: 84.38,
    invoiceNumber: 'INV011',
    paymentMethod: 'card'
  },
  {
    id: 'TXN012',
    type: 'sell',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 8, price: 32.25, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 258.00,
    date: '2023-06-25T16:30:00Z',
    customerName: 'Neha Agarwal',
    customerPhone: '+91-9988776655',
    gstAmount: 46.44,
    invoiceNumber: 'INV012',
    paymentMethod: 'upi'
  },

  // July 2023
  {
    id: 'TXN013',
    type: 'sell',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 22, price: 28.50, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 627.00,
    date: '2023-07-08T12:15:00Z',
    customerName: 'Sanjay Gupta',
    customerPhone: '+91-9876543210',
    gstAmount: 112.86,
    invoiceNumber: 'INV013',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN014',
    type: 'sell',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 9, price: 65.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 585.00,
    date: '2023-07-22T10:45:00Z',
    customerName: 'Pooja Reddy',
    customerPhone: '+91-9123456789',
    gstAmount: 105.30,
    invoiceNumber: 'INV014',
    paymentMethod: 'card'
  },

  // August 2023
  {
    id: 'TXN015',
    type: 'sell',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 30, price: 25.50, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 765.00,
    date: '2023-08-12T14:20:00Z',
    customerName: 'Arjun Patel',
    customerPhone: '+91-9988776655',
    gstAmount: 137.70,
    invoiceNumber: 'INV015',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN016',
    type: 'sell',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 35, price: 15.25, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 533.75,
    date: '2023-08-28T11:30:00Z',
    customerName: 'Lakshmi Iyer',
    customerPhone: '+91-9876543210',
    gstAmount: 96.08,
    invoiceNumber: 'INV016',
    paymentMethod: 'cash'
  },

  // September 2023
  {
    id: 'TXN017',
    type: 'sell',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 7, price: 45.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 315.00,
    date: '2023-09-05T09:45:00Z',
    customerName: 'Manish Kumar',
    customerPhone: '+91-9123456789',
    gstAmount: 56.70,
    invoiceNumber: 'INV017',
    paymentMethod: 'card'
  },
  {
    id: 'TXN018',
    type: 'sell',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 5, price: 85.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 425.00,
    date: '2023-09-20T15:00:00Z',
    customerName: 'Rekha Jain',
    customerPhone: '+91-9988776655',
    gstAmount: 76.50,
    invoiceNumber: 'INV018',
    paymentMethod: 'upi'
  },

  // October 2023
  {
    id: 'TXN019',
    type: 'sell',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 15, price: 22.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 330.00,
    date: '2023-10-10T13:15:00Z',
    customerName: 'Suresh Yadav',
    customerPhone: '+91-9876543210',
    gstAmount: 59.40,
    invoiceNumber: 'INV019',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN020',
    type: 'sell',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 20, price: 18.75, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 375.00,
    date: '2023-10-25T10:30:00Z',
    customerName: 'Geeta Devi',
    customerPhone: '+91-9123456789',
    gstAmount: 67.50,
    invoiceNumber: 'INV020',
    paymentMethod: 'card'
  },

  // November 2023
  {
    id: 'TXN021',
    type: 'sell',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 18, price: 32.25, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 580.50,
    date: '2023-11-08T12:00:00Z',
    customerName: 'Ramesh Chandra',
    customerPhone: '+91-9988776655',
    gstAmount: 104.49,
    invoiceNumber: 'INV021',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN022',
    type: 'sell',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 25, price: 28.50, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 712.50,
    date: '2023-11-22T14:45:00Z',
    customerName: 'Shanti Kumari',
    customerPhone: '+91-9876543210',
    gstAmount: 128.25,
    invoiceNumber: 'INV022',
    paymentMethod: 'cash'
  },

  // December 2023
  {
    id: 'TXN023',
    type: 'sell',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 12, price: 65.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 780.00,
    date: '2023-12-05T11:20:00Z',
    customerName: 'Vinod Sharma',
    customerPhone: '+91-9123456789',
    gstAmount: 140.40,
    invoiceNumber: 'INV023',
    paymentMethod: 'card'
  },
  {
    id: 'TXN024',
    type: 'sell',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 40, price: 25.50, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 1020.00,
    date: '2023-12-20T16:10:00Z',
    customerName: 'Kiran Patel',
    customerPhone: '+91-9988776655',
    gstAmount: 183.60,
    invoiceNumber: 'INV024',
    paymentMethod: 'upi'
  },

  // 2024 Transactions
  // January 2024
  {
    id: 'TXN025',
    type: 'sell',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 45, price: 15.25, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 686.25,
    date: '2024-01-10T09:30:00Z',
    customerName: 'Mohan Lal',
    customerPhone: '+91-9876543210',
    gstAmount: 123.53,
    invoiceNumber: 'INV025',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN026',
    type: 'sell',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 8, price: 45.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 360.00,
    date: '2024-01-25T13:45:00Z',
    customerName: 'Radha Krishna',
    customerPhone: '+91-9123456789',
    gstAmount: 64.80,
    invoiceNumber: 'INV026',
    paymentMethod: 'card'
  },

  // February 2024
  {
    id: 'TXN027',
    type: 'sell',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 6, price: 85.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 510.00,
    date: '2024-02-08T10:15:00Z',
    customerName: 'Ashok Kumar',
    customerPhone: '+91-9988776655',
    gstAmount: 91.80,
    invoiceNumber: 'INV027',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN028',
    type: 'sell',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 20, price: 22.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 440.00,
    date: '2024-02-22T15:30:00Z',
    customerName: 'Usha Rani',
    customerPhone: '+91-9876543210',
    gstAmount: 79.20,
    invoiceNumber: 'INV028',
    paymentMethod: 'cash'
  },

  // March 2024
  {
    id: 'TXN029',
    type: 'sell',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 30, price: 18.75, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 562.50,
    date: '2024-03-12T11:00:00Z',
    customerName: 'Dinesh Gupta',
    customerPhone: '+91-9123456789',
    gstAmount: 101.25,
    invoiceNumber: 'INV029',
    paymentMethod: 'card'
  },
  {
    id: 'TXN030',
    type: 'sell',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 22, price: 32.25, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 709.50,
    date: '2024-03-28T14:20:00Z',
    customerName: 'Savita Devi',
    customerPhone: '+91-9988776655',
    gstAmount: 127.71,
    invoiceNumber: 'INV030',
    paymentMethod: 'upi'
  },

  // April 2024
  {
    id: 'TXN031',
    type: 'sell',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 28, price: 28.50, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 798.00,
    date: '2024-04-05T09:45:00Z',
    customerName: 'Harish Chandra',
    customerPhone: '+91-9876543210',
    gstAmount: 143.64,
    invoiceNumber: 'INV031',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN032',
    type: 'sell',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 15, price: 65.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 975.00,
    date: '2024-04-20T12:30:00Z',
    customerName: 'Kamala Devi',
    customerPhone: '+91-9123456789',
    gstAmount: 175.50,
    invoiceNumber: 'INV032',
    paymentMethod: 'card'
  },

  // May 2024
  {
    id: 'TXN033',
    type: 'sell',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 35, price: 25.50, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 892.50,
    date: '2024-05-10T10:00:00Z',
    customerName: 'Raman Singh',
    customerPhone: '+91-9988776655',
    gstAmount: 160.65,
    invoiceNumber: 'INV033',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN034',
    type: 'sell',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 50, price: 15.25, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 762.50,
    date: '2024-05-25T16:15:00Z',
    customerName: 'Sunita Sharma',
    customerPhone: '+91-9876543210',
    gstAmount: 137.25,
    invoiceNumber: 'INV034',
    paymentMethod: 'cash'
  },

  // June 2024
  {
    id: 'TXN035',
    type: 'sell',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 10, price: 45.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 450.00,
    date: '2024-06-08T11:30:00Z',
    customerName: 'Prakash Joshi',
    customerPhone: '+91-9123456789',
    gstAmount: 81.00,
    invoiceNumber: 'INV035',
    paymentMethod: 'card'
  },
  {
    id: 'TXN036',
    type: 'sell',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 8, price: 85.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 680.00,
    date: '2024-06-22T14:45:00Z',
    customerName: 'Lata Mangeshkar',
    customerPhone: '+91-9988776655',
    gstAmount: 122.40,
    invoiceNumber: 'INV036',
    paymentMethod: 'upi'
  },

  // July 2024
  {
    id: 'TXN037',
    type: 'sell',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 25, price: 22.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 550.00,
    date: '2024-07-12T09:20:00Z',
    customerName: 'Govind Prasad',
    customerPhone: '+91-9876543210',
    gstAmount: 99.00,
    invoiceNumber: 'INV037',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN038',
    type: 'sell',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 35, price: 18.75, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 656.25,
    date: '2024-07-28T13:10:00Z',
    customerName: 'Indira Gandhi',
    customerPhone: '+91-9123456789',
    gstAmount: 118.13,
    invoiceNumber: 'INV038',
    paymentMethod: 'card'
  },

  // August 2024
  {
    id: 'TXN039',
    type: 'sell',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 25, price: 32.25, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 806.25,
    date: '2024-08-05T10:45:00Z',
    customerName: 'Jagdish Chandra',
    customerPhone: '+91-9988776655',
    gstAmount: 145.13,
    invoiceNumber: 'INV039',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN040',
    type: 'sell',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 32, price: 28.50, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 912.00,
    date: '2024-08-20T15:25:00Z',
    customerName: 'Kalpana Chawla',
    customerPhone: '+91-9876543210',
    gstAmount: 164.16,
    invoiceNumber: 'INV040',
    paymentMethod: 'cash'
    },

  // Purchase Transactions - Same duration as sales (2023-2024)
  // January 2023
  {
    id: 'TXN101',
    type: 'purchase',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 100, price: 20.00, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 2000.00,
    date: '2023-01-05T09:00:00Z',
    gstAmount: 360.00,
    invoiceNumber: 'PINV001',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN102',
    type: 'purchase',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 150, price: 15.00, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 2250.00,
    date: '2023-01-20T11:30:00Z',
    gstAmount: 405.00,
    invoiceNumber: 'PINV002',
    paymentMethod: 'card'
  },

  // February 2023
  {
    id: 'TXN103',
    type: 'purchase',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 80, price: 25.00, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 2000.00,
    date: '2023-02-08T14:00:00Z',
    gstAmount: 360.00,
    invoiceNumber: 'PINV003',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN104',
    type: 'purchase',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 120, price: 22.00, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 2640.00,
    date: '2023-02-22T10:15:00Z',
    gstAmount: 475.20,
    invoiceNumber: 'PINV004',
    paymentMethod: 'cash'
  },

  // March 2023
  {
    id: 'TXN105',
    type: 'purchase',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 60, price: 50.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 3000.00,
    date: '2023-03-10T12:45:00Z',
    gstAmount: 540.00,
    invoiceNumber: 'PINV005',
    paymentMethod: 'card'
  },
  {
    id: 'TXN106',
    type: 'purchase',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 200, price: 12.00, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 2400.00,
    date: '2023-03-25T15:20:00Z',
    gstAmount: 432.00,
    invoiceNumber: 'PINV006',
    paymentMethod: 'upi'
  },

  // April 2023
  {
    id: 'TXN107',
    type: 'purchase',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 50, price: 35.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 1750.00,
    date: '2023-04-05T09:30:00Z',
    gstAmount: 315.00,
    invoiceNumber: 'PINV007',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN108',
    type: 'purchase',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 30, price: 70.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 2100.00,
    date: '2023-04-18T13:00:00Z',
    gstAmount: 378.00,
    invoiceNumber: 'PINV008',
    paymentMethod: 'card'
  },

  // May 2023
  {
    id: 'TXN109',
    type: 'purchase',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 100, price: 18.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 1800.00,
    date: '2023-05-12T11:15:00Z',
    gstAmount: 324.00,
    invoiceNumber: 'PINV009',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN110',
    type: 'purchase',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 150, price: 20.00, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 3000.00,
    date: '2023-05-28T16:30:00Z',
    gstAmount: 540.00,
    invoiceNumber: 'PINV010',
    paymentMethod: 'cash'
  },

  // June 2023
  {
    id: 'TXN111',
    type: 'purchase',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 100, price: 15.00, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 1500.00,
    date: '2023-06-08T10:00:00Z',
    gstAmount: 270.00,
    invoiceNumber: 'PINV011',
    paymentMethod: 'card'
  },
  {
    id: 'TXN112',
    type: 'purchase',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 90, price: 25.00, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 2250.00,
    date: '2023-06-22T14:45:00Z',
    gstAmount: 405.00,
    invoiceNumber: 'PINV012',
    paymentMethod: 'upi'
  },

  // July 2023
  {
    id: 'TXN113',
    type: 'purchase',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 140, price: 22.00, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 3080.00,
    date: '2023-07-10T12:30:00Z',
    gstAmount: 554.40,
    invoiceNumber: 'PINV013',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN114',
    type: 'purchase',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 70, price: 50.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 3500.00,
    date: '2023-07-25T15:00:00Z',
    gstAmount: 630.00,
    invoiceNumber: 'PINV014',
    paymentMethod: 'card'
  },

  // August 2023
  {
    id: 'TXN115',
    type: 'purchase',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 250, price: 12.00, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 3000.00,
    date: '2023-08-05T09:45:00Z',
    gstAmount: 540.00,
    invoiceNumber: 'PINV015',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN116',
    type: 'purchase',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 60, price: 35.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 2100.00,
    date: '2023-08-20T13:20:00Z',
    gstAmount: 378.00,
    invoiceNumber: 'PINV016',
    paymentMethod: 'cash'
  },

  // September 2023
  {
    id: 'TXN117',
    type: 'purchase',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 40, price: 70.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 2800.00,
    date: '2023-09-12T11:00:00Z',
    gstAmount: 504.00,
    invoiceNumber: 'PINV017',
    paymentMethod: 'card'
  },
  {
    id: 'TXN118',
    type: 'purchase',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 80, price: 18.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 1440.00,
    date: '2023-09-28T16:15:00Z',
    gstAmount: 259.20,
    invoiceNumber: 'PINV018',
    paymentMethod: 'upi'
  },

  // October 2023
  {
    id: 'TXN119',
    type: 'purchase',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 180, price: 20.00, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 3600.00,
    date: '2023-10-08T10:30:00Z',
    gstAmount: 648.00,
    invoiceNumber: 'PINV019',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN120',
    type: 'purchase',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 120, price: 15.00, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 1800.00,
    date: '2023-10-22T14:00:00Z',
    gstAmount: 324.00,
    invoiceNumber: 'PINV020',
    paymentMethod: 'card'
  },

  // November 2023
  {
    id: 'TXN121',
    type: 'purchase',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 100, price: 25.00, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 2500.00,
    date: '2023-11-10T12:45:00Z',
    gstAmount: 450.00,
    invoiceNumber: 'PINV021',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN122',
    type: 'purchase',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 160, price: 22.00, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 3520.00,
    date: '2023-11-25T15:30:00Z',
    gstAmount: 633.60,
    invoiceNumber: 'PINV022',
    paymentMethod: 'cash'
  },

  // December 2023
  {
    id: 'TXN123',
    type: 'purchase',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 80, price: 50.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 4000.00,
    date: '2023-12-08T11:20:00Z',
    gstAmount: 720.00,
    invoiceNumber: 'PINV023',
    paymentMethod: 'card'
  },
  {
    id: 'TXN124',
    type: 'purchase',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 300, price: 12.00, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 3600.00,
    date: '2023-12-20T16:00:00Z',
    gstAmount: 648.00,
    invoiceNumber: 'PINV024',
    paymentMethod: 'upi'
  },

  // 2024 Purchase Transactions
  // January 2024
  {
    id: 'TXN125',
    type: 'purchase',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 70, price: 35.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 2450.00,
    date: '2024-01-12T09:15:00Z',
    gstAmount: 441.00,
    invoiceNumber: 'PINV025',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN126',
    type: 'purchase',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 45, price: 70.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 3150.00,
    date: '2024-01-28T13:30:00Z',
    gstAmount: 567.00,
    invoiceNumber: 'PINV026',
    paymentMethod: 'card'
  },

  // February 2024
  {
    id: 'TXN127',
    type: 'purchase',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 90, price: 18.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 1620.00,
    date: '2024-02-10T10:45:00Z',
    gstAmount: 291.60,
    invoiceNumber: 'PINV027',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN128',
    type: 'purchase',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 200, price: 20.00, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 4000.00,
    date: '2024-02-25T14:20:00Z',
    gstAmount: 720.00,
    invoiceNumber: 'PINV028',
    paymentMethod: 'cash'
  },

  // March 2024
  {
    id: 'TXN129',
    type: 'purchase',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 140, price: 15.00, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 2100.00,
    date: '2024-03-15T12:00:00Z',
    gstAmount: 378.00,
    invoiceNumber: 'PINV029',
    paymentMethod: 'card'
  },
  {
    id: 'TXN130',
    type: 'purchase',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 110, price: 25.00, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 2750.00,
    date: '2024-03-30T15:45:00Z',
    gstAmount: 495.00,
    invoiceNumber: 'PINV030',
    paymentMethod: 'upi'
  },

  // April 2024
  {
    id: 'TXN131',
    type: 'purchase',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 180, price: 22.00, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 3960.00,
    date: '2024-04-08T09:30:00Z',
    gstAmount: 712.80,
    invoiceNumber: 'PINV031',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN132',
    type: 'purchase',
    items: [{ medicineId: '8', medicineName: 'Vitamin D3 60000 IU', quantity: 90, price: 50.00, batchNo: 'VTD008', expiryDate: '2025-09-18' }],
    totalAmount: 4500.00,
    date: '2024-04-22T13:15:00Z',
    gstAmount: 810.00,
    invoiceNumber: 'PINV032',
    paymentMethod: 'card'
  },

  // May 2024
  {
    id: 'TXN133',
    type: 'purchase',
    items: [{ medicineId: '10', medicineName: 'Aspirin 75mg', quantity: 350, price: 12.00, batchNo: 'ASP010', expiryDate: '2025-07-08' }],
    totalAmount: 4200.00,
    date: '2024-05-12T11:00:00Z',
    gstAmount: 756.00,
    invoiceNumber: 'PINV033',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN134',
    type: 'purchase',
    items: [{ medicineId: '2', medicineName: 'Amoxicillin 250mg', quantity: 80, price: 35.00, batchNo: 'AMX002', expiryDate: '2025-06-15' }],
    totalAmount: 2800.00,
    date: '2024-05-28T16:30:00Z',
    gstAmount: 504.00,
    invoiceNumber: 'PINV034',
    paymentMethod: 'cash'
  },

  // June 2024
  {
    id: 'TXN135',
    type: 'purchase',
    items: [{ medicineId: '4', medicineName: 'Azithromycin 500mg', quantity: 50, price: 70.00, batchNo: 'AZT004', expiryDate: '2025-01-10' }],
    totalAmount: 3500.00,
    date: '2024-06-10T10:45:00Z',
    gstAmount: 630.00,
    invoiceNumber: 'PINV035',
    paymentMethod: 'card'
  },
  {
    id: 'TXN136',
    type: 'purchase',
    items: [{ medicineId: '7', medicineName: 'Diclofenac 50mg', quantity: 100, price: 18.00, batchNo: 'DCF007', expiryDate: '2025-02-14' }],
    totalAmount: 1800.00,
    date: '2024-06-25T14:00:00Z',
    gstAmount: 324.00,
    invoiceNumber: 'PINV036',
    paymentMethod: 'upi'
  },

  // July 2024
  {
    id: 'TXN137',
    type: 'purchase',
    items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 220, price: 20.00, batchNo: 'PCM001', expiryDate: '2025-12-31' }],
    totalAmount: 4400.00,
    date: '2024-07-15T12:30:00Z',
    gstAmount: 792.00,
    invoiceNumber: 'PINV037',
    paymentMethod: 'cash'
  },
  {
    id: 'TXN138',
    type: 'purchase',
    items: [{ medicineId: '3', medicineName: 'Cetirizine 10mg', quantity: 160, price: 15.00, batchNo: 'CTZ003', expiryDate: '2025-03-20' }],
    totalAmount: 2400.00,
    date: '2024-07-30T15:15:00Z',
    gstAmount: 432.00,
    invoiceNumber: 'PINV038',
    paymentMethod: 'card'
  },

  // August 2024
  {
    id: 'TXN139',
    type: 'purchase',
    items: [{ medicineId: '5', medicineName: 'Omeprazole 20mg', quantity: 120, price: 25.00, batchNo: 'OMP005', expiryDate: '2025-08-30' }],
    totalAmount: 3000.00,
    date: '2024-08-08T09:00:00Z',
    gstAmount: 540.00,
    invoiceNumber: 'PINV039',
    paymentMethod: 'upi'
  },
  {
    id: 'TXN140',
    type: 'purchase',
    items: [{ medicineId: '6', medicineName: 'Metformin 500mg', quantity: 200, price: 22.00, batchNo: 'MET006', expiryDate: '2025-11-25' }],
    totalAmount: 4400.00,
    date: '2024-08-25T13:45:00Z',
    gstAmount: 792.00,
    invoiceNumber: 'PINV040',
    paymentMethod: 'cash'
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
