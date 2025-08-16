'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DataStore } from '@/lib/mock-data';
import { Supplier } from '@/types';
import { formatCurrency } from '@/lib/export-utils';
import { toast } from 'sonner';

interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
}

export default function PurchaseStockPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierSuggestions, setSupplierSuggestions] = useState<Supplier[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const medicines = DataStore.getMedicines();

  useEffect(() => {
    // Load suppliers from localStorage
    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }
  }, []);

  useEffect(() => {
    // Filter suppliers based on supplier name input
    if (supplierName.length > 0) {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierName.toLowerCase())
      );
      setSupplierSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSupplierSuggestions([]);
      setShowSuggestions(false);
    }
  }, [supplierName, suppliers]);

  const selectSupplier = (supplier: Supplier) => {
    setSupplierName(supplier.name);
    setSupplierContact(supplier.contactNumber);
    setSupplierGstin(supplier.gstinNumber || '');
    setShowSuggestions(false);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (!selectedMedicine || quantity <= 0 || unitPrice <= 0 || !batchNumber || !expiryDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const existingItemIndex = items.findIndex(item => 
      item.medicineId === selectedMedicine.id && item.batchNumber === batchNumber
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: PurchaseItem = {
        medicineId: selectedMedicine.id,
        medicineName: selectedMedicine.name,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: quantity * unitPrice,
        batchNumber: batchNumber,
        expiryDate: expiryDate,
        manufacturer: selectedMedicine.manufacturer
      };
      setItems([...items, newItem]);
    }

    // Reset form
    setSelectedMedicine(null);
    setQuantity(1);
    setUnitPrice(0);
    setBatchNumber('');
    setExpiryDate('');
    setSearchTerm('');
    toast.success('Item added to purchase');
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    toast.success('Item removed from purchase');
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = items.map((item, i) => {
      if (i === index) {
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

  const updateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;

    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          unitPrice: newPrice,
          totalPrice: item.quantity * newPrice
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
    const subtotal = calculateTotal();
    return subtotal * 0.18; // 18% GST
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const completePurchase = async () => {
    if (items.length === 0) {
      toast.error('Please add items to the purchase');
      return;
    }

    if (!supplierName || !invoiceNumber) {
      toast.error('Please fill supplier name and invoice number');
      return;
    }

    setIsLoading(true);

    try {
      // Create transaction
      const transaction = {
        id: Date.now().toString(),
        type: 'purchase' as const,
        invoiceNumber,
        date: new Date().toISOString(),
        supplierName,
        supplierContact,
        supplierGstin,
        items: items.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: item.unitPrice,
          batchNo: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        totalAmount: calculateGrandTotal(),
        gstAmount: calculateTax(),
        paymentMethod,
        notes
      };

      // Save supplier if new
      const existingSupplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
      if (!existingSupplier && supplierName && supplierContact) {
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          name: supplierName,
          address: '', // Can be filled later
          contactNumber: supplierContact,
          gstinNumber: supplierGstin || undefined,
          createdAt: new Date().toISOString()
        };
        const updatedSuppliers = [...suppliers, newSupplier];
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setItems([]);
      setSupplierName('');
      setSupplierContact('');
      setSupplierGstin('');
      setInvoiceNumber('');
      setPaymentMethod('cash');
      setNotes('');

      toast.success(`Purchase completed! Invoice: ${invoiceNumber}`);
    } catch (error) {
      toast.error('Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Purchase Stock</h1>
        <p className="text-[var(--foreground)]/70 mt-1">Add new inventory to your stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Search & Add */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Medicine</CardTitle>
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
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedMedicine?.id === medicine.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{medicine.name}</h4>
                          <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                          <p className="text-sm text-gray-500">Category: {medicine.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedMedicine && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Selected Medicine</Label>
                    <div className="p-2 bg-blue-50 rounded border">
                      <p className="font-medium">{selectedMedicine.name}</p>
                      <p className="text-sm text-gray-600">{selectedMedicine.manufacturer}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Batch Number</Label>
                    <Input
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Enter batch number"
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={addItem} className="w-full">Add Item</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Items */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.medicineName}</h4>
                          <p className="text-sm text-gray-600">
                            Batch: {item.batchNumber} | Expiry: {item.expiryDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-20"
                          placeholder="Qty"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                          className="w-24"
                          placeholder="Price"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supplier & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 relative">
                <Label>Supplier Name *</Label>
                <Input
                  placeholder="Enter supplier name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  onFocus={() => setShowSuggestions(supplierSuggestions.length > 0)}
                />
                {showSuggestions && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {supplierSuggestions.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectSupplier(supplier)}
                      >
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.contactNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="Enter contact number"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GSTIN Number (Optional)</Label>
                <Input
                  placeholder="Enter GSTIN number"
                  value={supplierGstin}
                  onChange={(e) => setSupplierGstin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input
                  placeholder="Enter invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
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

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this purchase..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>

              <Button
                onClick={completePurchase}
                disabled={isLoading || items.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
