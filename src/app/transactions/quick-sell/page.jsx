

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrescriptionUploadDialog } from '@/components/PrescriptionUploadDialog';
import { DataStore } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/export-utils';
import { toast } from 'sonner';



export default function QuickSellPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [pendingScheduleHItem, setPendingScheduleHItem] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoiceData, setLastInvoiceData] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});

  const medicines = DataStore.getMedicines();
  const inventory = DataStore.getInventory();

  useEffect(() => {
    // Load profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemDirectly = (medicine, quantity = 1) => {
    const inventoryItem = inventory.find(item => item.medicineId === medicine.id);
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      toast.error('Insufficient stock available');
      return;
    }

    // Check if it's a Schedule H drug
    if (medicine.isScheduleH) {
      setPendingScheduleHItem({ medicine, quantity });
      setShowPrescriptionDialog(true);
      return;
    }

    addItemToCart(medicine, quantity);
  };

  const addItemToCart = (medicine, quantity) => {
    const existingItemIndex = items.findIndex(item => item.medicineId === medicine.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setItems(updatedItems);
    } else {
      // Add new item
  const newItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: quantity,
        unitPrice: medicine.mrp || medicine.price,
        totalPrice: quantity * (medicine.mrp || medicine.price),
        batchNumber: medicine.batchNo,
        expiryDate: medicine.expiryDate,
        isScheduleH: medicine.isScheduleH
      };
      setItems([...items, newItem]);
    }

    setSearchTerm('');
    toast.success('Item added to sale');
  };

  const handlePrescriptionUpload = (files) => {
    if (pendingScheduleHItem) {
      toast.success('Prescription uploaded successfully. Item added to sale.');
      addItemToCart(pendingScheduleHItem.medicine, pendingScheduleHItem.quantity);
      setPendingScheduleHItem(null);
      setShowPrescriptionDialog(false);
    }
  };

  const handlePrescriptionSkip = () => {
    if (pendingScheduleHItem) {
      toast.warning('Proceeding without prescription upload.');
      addItemToCart(pendingScheduleHItem.medicine, pendingScheduleHItem.quantity);
      setPendingScheduleHItem(null);
      setShowPrescriptionDialog(false);
    }
  };

  const removeItem = (medicineId) => {
    setItems(items.filter(item => item.medicineId !== medicineId));
    toast.success('Item removed from sale');
  };

  const updateItemQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(medicineId);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.medicineId === medicineId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

const calculateTax = () => {
    let totalSgst = 0;
    let totalCgst = 0;
    
    items.forEach(item => {
      const medicine = medicines.find(med => med.id === item.medicineId);
      const gstRate = medicine?.gstRate || 18; // Use medicine's GST rate or default to 18%
      const itemTotal = item.totalPrice;
      const itemSgst = (itemTotal * (gstRate / 2)) / 100;
      const itemCgst = (itemTotal * (gstRate / 2)) / 100;
      
      totalSgst += itemSgst;
      totalCgst += itemCgst;
    });
    
    return { sgst: totalSgst, cgst: totalCgst };
  };

const calculateGrandTotal = () => {
    const { sgst, cgst } = calculateTax(); // Get SGST and CGST
    return calculateTotal() + sgst + cgst; // Add SGST and CGST to the total
  };

  const completeSale = async () => {
    if (items.length === 0) {
      toast.error('Please add items to the sale');
      return;
    }

    setIsLoading(true);

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      // Create transaction
      const transaction = {
        id: Date.now().toString(),
  type: 'sell',
        invoiceNumber,
        date: new Date().toISOString(),
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        items: items.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: item.unitPrice,
          batchNo: item.batchNumber || '',
          expiryDate: item.expiryDate || ''
        })),
        totalAmount: calculateGrandTotal(),
        gstAmount: (() => {
          const { sgst, cgst } = calculateTax();
          return sgst + cgst;
        })(),
        paymentMethod
      };

      // Store invoice data for printing
      setLastInvoiceData({
        ...transaction,
        items: items,
        subtotal: calculateTotal(),
        tax: calculateTax(),
        grandTotal: calculateGrandTotal(),
        profile: profile
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Sale completed! Invoice: ${invoiceNumber}`);
      setShowInvoice(true);

      // Reset form
      setItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('cash');
    } catch (error) {
      toast.error('Failed to complete sale');
    } finally {
      setIsLoading(false);
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && lastInvoiceData) {
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${lastInvoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .shop-info { margin-bottom: 20px; }
            .invoice-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .terms { font-size: 10px; margin-top: 30px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${lastInvoiceData.profile.shopName || 'MediStore Pro'}</h1>
            <p>${lastInvoiceData.profile.address || 'Shop Address'}</p>
            <p>Contact: ${lastInvoiceData.profile.contactNumber || 'Contact Number'}</p>
            ${lastInvoiceData.profile.gstin ? `<p>GSTIN: ${lastInvoiceData.profile.gstin}</p>` : ''}
          </div>
          
          <div class="invoice-info">
            <p><strong>Invoice No:</strong> ${lastInvoiceData.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(lastInvoiceData.date).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${lastInvoiceData.customerName}</p>
            ${lastInvoiceData.customerPhone ? `<p><strong>Phone:</strong> ${lastInvoiceData.customerPhone}</p>` : ''}
            <p><strong>Payment Method:</strong> ${lastInvoiceData.paymentMethod.toUpperCase()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>GST %</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lastInvoiceData.items.map((item) => {
                const medicine = medicines.find(med => med.id === item.medicineId);
                const gstRate = medicine?.gstRate || 18;
                return `
                <tr>
                  <td>${item.medicineName}${item.isScheduleH ? ' (Schedule H)' : ''}</td>
                  <td>${gstRate}%</td>
                  <td>${item.batchNumber || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.totalPrice)}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>

          <div class="text-right">
            <p><strong>Subtotal: ${formatCurrency(lastInvoiceData.subtotal)}</strong></p>
            <p><strong>SGST: ${formatCurrency(lastInvoiceData.tax.sgst)}</strong></p>
            <p><strong>CGST: ${formatCurrency(lastInvoiceData.tax.cgst)}</strong></p>
            <p class="text-xs text-gray-600">GST calculated based on individual medicine rates</p>
            <p class="total-row"><strong>Total: ${formatCurrency(lastInvoiceData.grandTotal)}</strong></p>
          </div>

          <div class="terms">
            <h4>Terms & Conditions:</h4>
            <p>1. All medicines sold are subject to expiry date mentioned on the package.</p>
            <p>2. No returns or exchanges without valid reason and original receipt.</p>
            <p>3. Schedule H drugs are sold as per prescription only.</p>
            <p>4. Please check the medicines before leaving the store.</p>
            <p>5. For any queries, please contact us within 7 days of purchase.</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Quick Sell</h1>
        <p className="text-[var(--foreground)]/70 mt-1">Process sales transactions quickly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Add */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Add Medicine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Medicine</Label>
                <Input
                  placeholder="Search by name or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm && (
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {filteredMedicines.map((medicine) => {
                    const inventoryItem = inventory.find(item => item.medicineId === medicine.id);
                    return (
                      <div
                        key={medicine.id}
                        className="p-3 border-b hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{medicine.name}</h4>
                              {medicine.isScheduleH && (
                                <Badge variant="destructive" className="text-xs">Schedule H</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-green-600">MRP: {formatCurrency(medicine.mrp || medicine.price)}</p>
                              <Badge variant={inventoryItem && inventoryItem.quantity > 0 ? 'default' : 'destructive'}>
                                Stock: {inventoryItem?.quantity || 0}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addItemDirectly(medicine, 1)}
                            disabled={!inventoryItem || inventoryItem.quantity === 0}
                          >
                            Add Item
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sale Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.medicineId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{item.medicineName}</h4>
                          {item.isScheduleH && (
                            <Badge variant="destructive" className="text-xs">Schedule H</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.medicineId, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.medicineId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name (Optional)</Label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number (Optional)</Label>
                <Input
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>{formatCurrency(calculateTax().sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>{formatCurrency(calculateTax().cgst)}</span>
                </div>
                {items.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    GST rates: {Array.from(new Set(items.map(item => {
                      const medicine = medicines.find(med => med.id === item.medicineId);
                      return medicine?.gstRate || 18;
                    }))).join('%, ')}%
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>

              <Button
                onClick={completeSale}
                disabled={isLoading || items.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Complete Sale'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule H Prescription Dialog */}
      <PrescriptionUploadDialog
        open={showPrescriptionDialog}
        onClose={() => setShowPrescriptionDialog(false)}
        onUpload={handlePrescriptionUpload}
        onSkip={handlePrescriptionSkip}
        scheduleHMedicines={pendingScheduleHItem ? [pendingScheduleHItem.medicine?.name] : []}
      />

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Completed Successfully!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Invoice <strong>{lastInvoiceData?.invoiceNumber}</strong> has been generated.</p>
            <div className="flex space-x-3">
              <Button onClick={printInvoice}>
                Print Invoice
              </Button>
              <Button variant="outline" onClick={() => setShowInvoice(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
