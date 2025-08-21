import { Transaction, ExpiringMedicine, TaxData } from '@/types';

export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Generate headers from first object keys if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(','), // Header row
      ...data.map(row => 
        csvHeaders.map(header => {
          const value = row[header];
          // Handle nested objects and arrays
          const cellValue = typeof value === 'object' && value !== null 
            ? JSON.stringify(value).replace(/"/g, '""')
            : String(value || '').replace(/"/g, '""');
          
          // Wrap in quotes if contains comma, newline, or quote
          return /[,\n"]/.test(cellValue) ? `"${cellValue}"` : cellValue;
        }).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV file');
  }
}

export function exportExpiringMedicines(medicines: ExpiringMedicine[]) {
  const headers = [
    'Medicine Name',
    'Expiry Date',
    'Batch Number',
    'Supplier',
    'Quantity',
    'Days to Expiry'
  ];

  const data = medicines.map(med => ({
    'Medicine Name': med.name,
    'Expiry Date': new Date(med.expiryDate).toLocaleDateString('en-IN'),
    'Batch Number': med.batchNo,
    'Supplier': med.supplier,
    'Quantity': med.quantity,
    'Days to Expiry': med.daysToExpiry
  }));

  const filename = `expiring-medicines-${new Date().toISOString().split('T')[0]}`;
  exportToCSV(data, filename, headers);
}

export function exportTransactions(transactions: Transaction[], type?: 'sell' | 'purchase') {
  const filteredTransactions = type 
    ? transactions.filter(txn => txn.type === type)
    : transactions;

  const headers = [
    'Invoice Number',
    'Date',
    'Type',
    'Customer/Supplier',
    'Items',
    'Total Amount',
    'GST Amount',
    'Payment Method'
  ];

  const data = filteredTransactions.map(txn => ({
    'Invoice Number': txn.invoiceNumber,
    'Date': new Date(txn.date).toLocaleDateString('en-IN'),
    'Type': txn.type.toUpperCase(),
    'Customer/Supplier': txn.customerName || 'N/A',
    'Items': txn.items.map(item => `${item.medicineName} (${item.quantity})`).join('; '),
    'Total Amount': `₹${txn.totalAmount.toFixed(2)}`,
    'GST Amount': `₹${txn.gstAmount.toFixed(2)}`,
    'Payment Method': txn.paymentMethod.toUpperCase()
  }));

  const typePrefix = type ? `${type}-` : '';
  const filename = `${typePrefix}transactions-${new Date().toISOString().split('T')[0]}`;
  exportToCSV(data, filename, headers);
}

export function generateTaxReport(transactions: Transaction[], startDate: string, endDate: string): TaxData {
  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate >= new Date(startDate) && txnDate <= new Date(endDate);
  });

  const salesTransactions = filteredTransactions.filter(txn => txn.type === 'sell');
  const purchaseTransactions = filteredTransactions.filter(txn => txn.type === 'purchase');

  const totalSales = salesTransactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  const totalPurchases = purchaseTransactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  const gstCollected = salesTransactions.reduce((sum, txn) => sum + txn.gstAmount, 0);
  const gstPaid = purchaseTransactions.reduce((sum, txn) => sum + txn.gstAmount, 0);

  return {
    totalSales,
    totalPurchases,
    gstCollected,
    gstPaid,
    netProfit: totalSales - totalPurchases,
    transactions: filteredTransactions,
    period: {
      startDate,
      endDate
    }
  };
}

export function exportTaxReport(taxData: TaxData) {
  // Summary data
  const summaryHeaders = ['Metric', 'Amount'];
  const summaryData = [
    { 'Metric': 'Total Sales', 'Amount': `₹${taxData.totalSales.toFixed(2)}` },
    { 'Metric': 'Total Purchases', 'Amount': `₹${taxData.totalPurchases.toFixed(2)}` },
    { 'Metric': 'GST Collected', 'Amount': `₹${taxData.gstCollected.toFixed(2)}` },
    { 'Metric': 'GST Paid', 'Amount': `₹${taxData.gstPaid.toFixed(2)}` },
    { 'Metric': 'Net GST Liability', 'Amount': `₹${(taxData.gstCollected - taxData.gstPaid).toFixed(2)}` },
    { 'Metric': 'Gross Profit', 'Amount': `₹${taxData.netProfit.toFixed(2)}` }
  ];

  const filename = `tax-report-${taxData.period.startDate}-to-${taxData.period.endDate}`;
  exportToCSV(summaryData, filename, summaryHeaders);
}

export function exportDetailedTaxReport(taxData: TaxData) {
  const headers = [
    'Date',
    'Invoice Number',
    'Type',
    'Party Name',
    'Taxable Amount',
    'GST Amount',
    'Total Amount',
    'Items Detail'
  ];

  const data = taxData.transactions.map(txn => {
    const taxableAmount = txn.totalAmount - txn.gstAmount;
    return {
      'Date': new Date(txn.date).toLocaleDateString('en-IN'),
      'Invoice Number': txn.invoiceNumber,
      'Type': txn.type.toUpperCase(),
      'Party Name': txn.customerName || 'Cash Sale',
      'Taxable Amount': `₹${taxableAmount.toFixed(2)}`,
      'GST Amount': `₹${txn.gstAmount.toFixed(2)}`,
      'Total Amount': `₹${txn.totalAmount.toFixed(2)}`,
      'Items Detail': txn.items.map(item => 
        `${item.medicineName} - Qty: ${item.quantity} @ ₹${item.price}`
      ).join('; ')
    };
  });

  const filename = `detailed-tax-report-${taxData.period.startDate}-to-${taxData.period.endDate}`;
  exportToCSV(data, filename, headers);
}

export function exportInventoryReport(inventory: any[]) {
  const headers = [
    'Medicine Name',
    'Category',
    'Manufacturer',
    'Batch Number',
    'Expiry Date',
    'Current Stock',
    'Minimum Level',
    'Stock Status',
    'Price per Unit',
    'Total Value'
  ];

  const data = inventory.map(item => {
    const medicine = item.medicine;
    const stockStatus = item.isLowStock ? 'LOW STOCK' : 'ADEQUATE';
    const totalValue = medicine.stockQuantity * medicine.price;

    return {
      'Medicine Name': medicine.name,
      'Category': medicine.category,
      'Manufacturer': medicine.manufacturer,
      'Batch Number': medicine.batchNo,
      'Expiry Date': new Date(medicine.expiryDate).toLocaleDateString('en-IN'),
      'Current Stock': medicine.stockQuantity,
      'Minimum Level': medicine.minStockLevel,
      'Stock Status': stockStatus,
      'Price per Unit': `₹${medicine.price.toFixed(2)}`,
      'Total Value': `₹${totalValue.toFixed(2)}`
    };
  });

  const filename = `inventory-report-${new Date().toISOString().split('T')[0]}`;
  exportToCSV(data, filename, headers);
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Utility function to format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Utility function to calculate GST
export function calculateGST(amount: number, gstRate: number = 18): number {
  return (amount * gstRate) / 100;
}

// Utility function to get invoice number
export function generateInvoiceNumber(type: 'sell' | 'purchase'): string {
  const prefix = type === 'sell' ? 'INV' : 'PUR';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
