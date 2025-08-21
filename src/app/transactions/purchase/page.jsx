

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataStore } from '@/lib/mock-data';
import { Supplier, Medicine, MedicineLot } from '@/types';
import { formatCurrency } from '@/lib/export-utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';





export default function PurchaseStockPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  
  // New supplier fields
  const [newSupplierData, setNewSupplierData] = useState({
    address: '',
    contactNumber: '',
    gstinNumber: ''
  });

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Medicine selection states
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [isAddingNewMedicine, setIsAddingNewMedicine] = useState(false);

  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    quantity: 1,
    unitPrice: 0,
    mrp: 0,
    batchNumber: '',
    expiryDate: '',
    gstRate: 12,
    isNewMedicine: false
  });

  const [newMedicineData, setNewMedicineData] = useState({
    name: '',
    manufacturer: '',
    category: '',
    isScheduleH: false,
    minStockLevel: 10
  });

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
      setShowSupplierSuggestions(filtered.length > 0);
    } else {
      setSupplierSuggestions([]);
      setShowSupplierSuggestions(false);
    }
  }, [supplierName, suppliers]);

  useEffect(() => {
    // Filter medicines based on search term
    if (medicineSearchTerm.length > 0 && !isAddingNewMedicine) {
      setShowMedicineSuggestions(true);
    } else {
      setShowMedicineSuggestions(false);
    }
  }, [medicineSearchTerm, isAddingNewMedicine]);

  const selectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierName(supplier.name);
    setNewSupplierData({
      address: supplier.address,
      contactNumber: supplier.contactNumber,
      gstinNumber: supplier.gstinNumber || ''
    });
    setShowSupplierSuggestions(false);
  };

  const selectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setMedicineSearchTerm(medicine.name);
    setCurrentItem(prev => ({
      ...prev,
      medicineId: medicine.id,
      medicineName: medicine.name,
      manufacturer: medicine.manufacturer,
      gstRate: medicine.gstRate,
      isNewMedicine: false
    }));
    setShowMedicineSuggestions(false);
    setIsAddingNewMedicine(false);
  };

  const handleAddNewMedicine = () => {
    setIsAddingNewMedicine(true);
    setSelectedMedicine(null);
    setMedicineSearchTerm('');
    setCurrentItem(prev => ({
      ...prev,
      medicineId: undefined,
      medicineName: '',
      manufacturer: '',
      isNewMedicine: true
    }));
    setShowMedicineSuggestions(false);
  };

  const addItemToPurchase = () => {
    if (!selectedSupplier && !supplierName) {
      toast.error('Please select or enter supplier information');
      return;
    }

    if (isAddingNewMedicine) {
      if (!newMedicineData.name || !newMedicineData.manufacturer || !newMedicineData.category) {
        toast.error('Please fill all required medicine details');
        return;
      }
    } else if (!selectedMedicine) {
      toast.error('Please select a medicine');
      return;
    }

    if (!currentItem.quantity || currentItem.quantity <= 0 || 
        !currentItem.unitPrice || currentItem.unitPrice <= 0 ||
        !currentItem.mrp || currentItem.mrp <= 0 ||
        !currentItem.batchNumber || !currentItem.expiryDate) {
      toast.error('Please fill all required fields');
      return;
    }

  const newItem = {
      medicineId: isAddingNewMedicine ? undefined : selectedMedicine?.id,
  medicineName: isAddingNewMedicine ? newMedicineData.name : (selectedMedicine ? selectedMedicine.name : ''),
      isNewMedicine: isAddingNewMedicine,
      newMedicineData: isAddingNewMedicine ? { ...newMedicineData } : undefined,
  quantity: currentItem.quantity,
  unitPrice: currentItem.unitPrice,
  mrp: currentItem.mrp,
  totalPrice: (currentItem.quantity || 0) * (currentItem.unitPrice || 0),
  batchNumber: currentItem.batchNumber,
  expiryDate: currentItem.expiryDate,
  manufacturer: isAddingNewMedicine ? newMedicineData.manufacturer : (selectedMedicine ? selectedMedicine.manufacturer : ''),
  gstRate: currentItem.gstRate
    };

    setItems([...items, newItem]);

    // Reset form
    setCurrentItem({
      quantity: 1,
      unitPrice: 0,
      mrp: 0,
      batchNumber: '',
      expiryDate: '',
      gstRate: 12,
      isNewMedicine: false
    });
    setSelectedMedicine(null);
    setMedicineSearchTerm('');
    setIsAddingNewMedicine(false);
    setNewMedicineData({
      name: '',
      manufacturer: '',
      category: '',
      isScheduleH: false,
      minStockLevel: 10
    });

    toast.success('Item added to purchase');
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    toast.success('Item removed from purchase');
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTaxBreakdown = () => {
    const breakdown = { sgst: 0, cgst: 0, total: 0, avgGstRate: 0 };
    
    if (items.length === 0) {
      return breakdown;
    }

    let totalGstRate = 0;
    items.forEach(item => {
      const itemTax = (item.totalPrice * item.gstRate) / 100;
      breakdown.sgst += itemTax / 2;
      breakdown.cgst += itemTax / 2;
      breakdown.total += itemTax;
      totalGstRate += item.gstRate;
    });

    breakdown.avgGstRate = totalGstRate / items.length;
    return breakdown;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTaxBreakdown().total;
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

    if (!selectedSupplier && (!newSupplierData.contactNumber || !newSupplierData.address)) {
      toast.error('Please fill supplier contact details');
      return;
    }

    setIsLoading(true);

    try {
      // Save supplier if new
      let supplierId = selectedSupplier?.id;
      if (!selectedSupplier && supplierName) {
  const newSupplier = {
          id: `supplier_${Date.now()}`,
          name: supplierName,
          address: newSupplierData.address,
          contactNumber: newSupplierData.contactNumber,
          gstinNumber: newSupplierData.gstinNumber || undefined,
          createdAt: new Date().toISOString()
        };
        const updatedSuppliers = [...suppliers, newSupplier];
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
        supplierId = newSupplier.id;
      }

      // Process each item and update inventory with FIFO
      for (const item of items) {
        if (item.isNewMedicine && item.newMedicineData) {
          // Create new medicine
          const newMedicine = {
            id: `medicine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.newMedicineData.name,
            expiryDate: item.expiryDate,
            batchNo: item.batchNumber,
            supplier: supplierName,
            isScheduleH: item.newMedicineData.isScheduleH,
            price: item.unitPrice,
            mrp: item.mrp,
            stockQuantity: item.quantity,
            minStockLevel: item.newMedicineData.minStockLevel,
            category: item.newMedicineData.category,
            manufacturer: item.newMedicineData.manufacturer,
            gstRate: item.gstRate,
            fifoLots: [{
              id: `lot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              batchNo: item.batchNumber,
              expiryDate: item.expiryDate,
              quantity: item.quantity,
              purchasePrice: item.unitPrice,
              purchaseDate: new Date().toISOString(),
              supplierId: supplierId,
              supplierName: supplierName,
              gstRate: item.gstRate
            }]
          };

          // Add to medicines list (in real app, this would be saved to database)
          DataStore.getMedicines().push(newMedicine);
        } else {
          // Update existing medicine with new FIFO lot
          const existingMedicine = DataStore.getMedicineById(item.medicineId);
          if (existingMedicine) {
            const newLot = {
              id: `lot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              batchNo: item.batchNumber,
              expiryDate: item.expiryDate,
              quantity: item.quantity,
              purchasePrice: item.unitPrice,
              purchaseDate: new Date().toISOString(),
              supplierId: supplierId,
              supplierName: supplierName,
              gstRate: item.gstRate
            };

            if (!existingMedicine.fifoLots) {
              existingMedicine.fifoLots = [];
            }
            existingMedicine.fifoLots.push(newLot);
            existingMedicine.stockQuantity += item.quantity;
            
            // Update GST rate if different
            if (existingMedicine.gstRate !== item.gstRate) {
              existingMedicine.gstRate = item.gstRate;
            }
          }
        }
      }

      // Create transaction record
      const transaction = {
        id: `purchase_${Date.now()}`,
  type: 'purchase',
        invoiceNumber,
        date: new Date().toISOString(),
        supplierName,
        supplierContact: newSupplierData.contactNumber,
        supplierGstin: newSupplierData.gstinNumber,
        items: items.map(item => ({
          medicineId: item.medicineId || `new_${item.medicineName}`,
          medicineName: item.medicineName,
          quantity: item.quantity,
          price: item.unitPrice,
          batchNo: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        totalAmount: calculateGrandTotal(),
        gstAmount: calculateTaxBreakdown().total,
        paymentMethod,
        notes
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setItems([]);
      setSelectedSupplier(null);
      setSupplierName('');
      setNewSupplierData({ address: '', contactNumber: '', gstinNumber: '' });
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

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(medicineSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Purchase Stock</h1>
          <p className="text-[var(--foreground)]/70 mt-1">Add new inventory to your stock</p>
        </div>
        <Button 
          onClick={() => router.push('/inventory/bulk-upload')} 
          variant="outline"
        >
          Bulk Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Selection */}
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
                  onFocus={() => setShowSupplierSuggestions(supplierSuggestions.length > 0)}
                />
                {showSupplierSuggestions && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {supplierSuggestions.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                        onClick={() => selectSupplier(supplier)}
                      >
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.contactNumber}</p>
                        <p className="text-xs text-gray-500">{supplier.address}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!selectedSupplier && supplierName && (
                <Alert>
                  <AlertDescription>
                    New supplier detected. Please fill in the details below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input
                    placeholder="Enter contact number"
                    value={newSupplierData.contactNumber}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    disabled={!!selectedSupplier}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN Number</Label>
                  <Input
                    placeholder="Enter GSTIN number"
                    value={newSupplierData.gstinNumber}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, gstinNumber: e.target.value }))}
                    disabled={!!selectedSupplier}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Textarea
                  placeholder="Enter supplier address"
                  value={newSupplierData.address}
                  onChange={(e) => setNewSupplierData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!!selectedSupplier}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medicine Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Add Medicine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAddingNewMedicine ? (
                <div className="space-y-2 relative">
                  <Label>Search Medicine</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search by name or manufacturer..."
                      value={medicineSearchTerm}
                      onChange={(e) => setMedicineSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleAddNewMedicine}
                      type="button"
                    >
                      Add New Medicine
                    </Button>
                  </div>
                  
                  {showMedicineSuggestions && filteredMedicines.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredMedicines.map((medicine) => (
                        <div
                          key={medicine.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => selectMedicine(medicine)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{medicine.name}</p>
                              <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                              <p className="text-xs text-gray-500">Category: {medicine.category}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">GST: {medicine.gstRate}%</Badge>
                              <p className="text-xs text-gray-500 mt-1">Stock: {medicine.stockQuantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">New Medicine Details</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsAddingNewMedicine(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medicine Name *</Label>
                      <Input
                        placeholder="Enter medicine name"
                        value={newMedicineData.name}
                        onChange={(e) => setNewMedicineData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Manufacturer *</Label>
                      <Input
                        placeholder="Enter manufacturer"
                        value={newMedicineData.manufacturer}
                        onChange={(e) => setNewMedicineData(prev => ({ ...prev, manufacturer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Input
                        placeholder="Enter category"
                        value={newMedicineData.category}
                        onChange={(e) => setNewMedicineData(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Stock Level</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newMedicineData.minStockLevel}
                        onChange={(e) => setNewMedicineData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 10 }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduleH"
                      checked={newMedicineData.isScheduleH}
                      onChange={(e) => setNewMedicineData(prev => ({ ...prev, isScheduleH: e.target.checked }))}
                    />
                    <Label htmlFor="scheduleH">Schedule H Medicine (Requires Prescription)</Label>
                  </div>
                </div>
              )}

              {(selectedMedicine || isAddingNewMedicine) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentItem.mrp}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Number *</Label>
                    <Input
                      value={currentItem.batchNumber}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, batchNumber: e.target.value }))}
                      placeholder="Enter batch number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={currentItem.expiryDate}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Rate *</Label>
                    <Select 
                      value={currentItem.gstRate?.toString()} 
                      onValueChange={(value) => setCurrentItem(prev => ({ ...prev, gstRate: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <Button onClick={addItemToPurchase} className="w-full">
                      Add Item to Purchase
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Items */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{item.medicineName}</h4>
                            {item.isNewMedicine && (
                              <Badge variant="secondary">New Medicine</Badge>
                            )}
                            <Badge variant="outline">GST: {item.gstRate}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.manufacturer} | Batch: {item.batchNumber} | Expiry: {item.expiryDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            MRP: {formatCurrency(item.mrp)}
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input
                  placeholder="Enter invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

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

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
            <div className="flex justify-between">
              <span>SGST ({(calculateTaxBreakdown().avgGstRate / 2).toFixed(1)}%):</span>
              <span>{formatCurrency(calculateTaxBreakdown().sgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST ({(calculateTaxBreakdown().avgGstRate / 2).toFixed(1)}%):</span>
              <span>{formatCurrency(calculateTaxBreakdown().cgst)}</span>
            </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateGrandTotal())}</span>
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
