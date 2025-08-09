import { z } from 'zod';

export const medicineSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Medicine name is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  isScheduleH: z.boolean(),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  minStockLevel: z.number().min(0, 'Minimum stock level cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required')
});

export const transactionItemSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  batchNo: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required')
});

export const sellTransactionSchema = z.object({
  type: z.literal('sell'),
  items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi']),
  prescriptionFiles: z.array(z.string()).optional()
});

export const purchaseTransactionSchema = z.object({
  type: z.literal('purchase'),
  items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  paymentMethod: z.enum(['cash', 'card', 'upi'])
});

export const transactionSchema = z.union([sellTransactionSchema, purchaseTransactionSchema]);

export const taxReportSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  includeGST: z.boolean().default(true),
  includeProfitLoss: z.boolean().default(true)
});

export const medicineSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().optional().default(10)
});

export const inventoryUpdateSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  operation: z.enum(['add', 'subtract', 'set'])
});

// Form validation schemas for UI components
export const sellFormSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string().min(1, 'Please select a medicine'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().positive('Price must be positive')
  })).min(1, 'Add at least one medicine'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi'], {
    required_error: 'Please select a payment method'
  })
});

export const purchaseFormSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string().min(1, 'Please select a medicine'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().positive('Price must be positive')
  })).min(1, 'Add at least one medicine'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  paymentMethod: z.enum(['cash', 'card', 'upi'], {
    required_error: 'Please select a payment method'
  })
});

export const addMedicineFormSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  isScheduleH: z.boolean().default(false),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  minStockLevel: z.number().min(0, 'Minimum stock level cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required')
});

// Type exports for form data
export type SellFormData = z.infer<typeof sellFormSchema>;
export type PurchaseFormData = z.infer<typeof purchaseFormSchema>;
export type AddMedicineFormData = z.infer<typeof addMedicineFormSchema>;
export type TaxReportData = z.infer<typeof taxReportSchema>;
