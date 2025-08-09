'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MedicineSearch } from '@/components/MedicineSearch';
import { purchaseFormSchema, PurchaseFormData } from '@/lib/validations';
import { DataStore } from '@/lib/mock-data';
import { Medicine, TransactionItem } from '@/types';
import { formatCurrency, generateInvoiceNumber, calculateGST } from '@/lib/export-utils';
import { toast } from 'sonner';

interface PurchaseItem {
  medicineId: string;
  medicine?: Medicine;
  quantity: number;
  price: number;
}

export function PurchaseForm() {
  const [selectedMedicines, setSelectedMedicines] = useState<PurchaseItem[]>([
    { medicineId: '', quantity: 1, price: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      items: [{ medicineId: '', quantity: 1, price: 0 }],
      paymentMethod: 'cash'
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const addMedicine = () => {
    const newItem = { medicineId: '', quantity: 1, price: 0 };
    setSelectedMedicines([...selectedMedicines, newItem]);
    append(newItem);
  };

  const removeMedicine = (index: number) => {
    if (selectedMedicines.length > 1) {
      const newMedicines = selectedMedicines.filter((_, i) => i !== index);
      setSelectedMedicines(newMedicines);
      remove(index);
    }
  };

  const handleMedicineSelect = (index: number, medicine: Medicine) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      medicineId: medicine.id,
      medicine,
      price: medicine.price * 0.8 // Assume purchase price is 80% of selling price
    };
    setSelectedMedicines(updatedMedicines);

    // Update form values
    setValue(`items.${index}.medicineId`, medicine.id);
    setValue(`items.${index}.price`, medicine.price * 0.8);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index].price = price;
    setSelectedMedicines(updatedMedicines);
    setValue(`items.${index}.price`, price);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index].quantity = quantity;
    setSelectedMedicines(updatedMedicines);
    setValue(`items.${index}.quantity`, quantity);
  };

  const calculateTotal = () => {
    return selectedMedicines.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateGSTAmount = (subtotal: number) => {
    return calculateGST(subtotal, 18);
  };

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setIsSubmitting(true);

      const subtotal = calculateTotal();
      const gstAmount = calculateGSTAmount(subtotal);
      const totalAmount = subtotal + gstAmount;

      const transactionItems: TransactionItem[] = selectedMedicines.map(item => ({
        medicineId: item.medicineId,
        medicineName: item.medicine?.name || '',
        quantity: item.quantity,
        price: item.price,
        batchNo: item.medicine?.batchNo || '',
        expiryDate: item.medicine?.expiryDate || ''
      }));

      const transaction = {
        type: 'purchase' as const,
        items: transactionItems,
        totalAmount,
        date: new Date().toISOString(),
        gstAmount,
        invoiceNumber: data.invoiceNumber,
        paymentMethod: data.paymentMethod
      };

      // Save transaction
      DataStore.addTransaction(transaction);

      toast.success('Purchase recorded successfully!');
      
      // Reset form
      reset();
      setSelectedMedicines([{ medicineId: '', quantity: 1, price: 0 }]);

    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = calculateTotal();
  const gstAmount = calculateGSTAmount(subtotal);
  const total = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Supplier Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplierName">Supplier Name *</Label>
            <Input
              id="supplierName"
              {...register('supplierName')}
              placeholder="Enter supplier name"
            />
            {errors.supplierName && (
              <p className="text-sm text-red-600 mt-1">{errors.supplierName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input
              id="invoiceNumber"
              {...register('invoiceNumber')}
              placeholder="Enter supplier invoice number"
            />
            {errors.invoiceNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.invoiceNumber.message}</p>
            )}
          </div>
        </div>

        {/* Medicine Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Purchase Items</h3>
            <Button type="button" onClick={addMedicine} variant="outline">
              Add Medicine
            </Button>
          </div>

          {selectedMedicines.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <Label>Medicine</Label>
                  <MedicineSearch
                    onSelect={(medicine) => handleMedicineSelect(index, medicine)}
                    placeholder="Search and select medicine"
                  />
                  {errors.items?.[index]?.medicineId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.items[index]?.medicineId?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      handleQuantityChange(index, quantity);
                    }}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`price-${index}`}>Unit Price</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      handlePriceChange(index, price);
                    }}
                  />
                  {errors.items?.[index]?.price && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.items[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Total</Label>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                  {selectedMedicines.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Medicine Info */}
              {item.medicine && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium">{item.medicine.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Manufacturer:</span>
                      <p className="font-medium">{item.medicine.manufacturer}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <p className="font-medium">{item.medicine.stockQuantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Selling Price:</span>
                      <p className="font-medium">{formatCurrency(item.medicine.price)}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Payment Method */}
        <div>
          <Label>Payment Method</Label>
          <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod && (
            <p className="text-sm text-red-600 mt-1">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Purchase Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <p>Items will be added to inventory after purchase confirmation</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || subtotal === 0}
        >
          {isSubmitting ? 'Recording Purchase...' : `Record Purchase - ${formatCurrency(total)}`}
        </Button>
      </form>
    </div>
  );
}
