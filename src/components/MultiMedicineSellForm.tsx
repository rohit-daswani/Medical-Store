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
import { PrescriptionUploadDialog } from '@/components/PrescriptionUploadDialog';
import { sellFormSchema, SellFormData } from '@/lib/validations';
import { DataStore } from '@/lib/mock-data';
import { Medicine, TransactionItem } from '@/types';
import { formatCurrency, generateInvoiceNumber, calculateGST } from '@/lib/export-utils';
import { toast } from 'sonner';

interface SellItem {
  medicineId: string;
  medicine?: Medicine;
  quantity: number;
  price: number;
}

export function MultiMedicineSellForm() {
  const [selectedMedicines, setSelectedMedicines] = useState<SellItem[]>([
    { medicineId: '', quantity: 1, price: 0 }
  ]);
  const [scheduleHMedicines, setScheduleHMedicines] = useState<string[]>([]);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [prescriptionFiles, setPrescriptionFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
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
    watch,
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
      price: medicine.price
    };
    setSelectedMedicines(updatedMedicines);

    // Update form values
    setValue(`items.${index}.medicineId`, medicine.id);
    setValue(`items.${index}.price`, medicine.price);

    // Check if it's a Schedule H medicine
    if (medicine.isScheduleH) {
      setScheduleHMedicines(prev => [...new Set([...prev, medicine.id])]);
    }
  };

  const calculateTotal = () => {
    return selectedMedicines.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const calculateGSTAmount = (subtotal: number) => {
    return calculateGST(subtotal, 18);
  };

  const onSubmit = async (data: SellFormData) => {
    try {
      setIsSubmitting(true);

      // Check if any Schedule H medicines are selected and no prescription uploaded
      const hasScheduleH = selectedMedicines.some(item => 
        item.medicine?.isScheduleH && scheduleHMedicines.includes(item.medicineId)
      );

      if (hasScheduleH && prescriptionFiles.length === 0) {
        setShowPrescriptionDialog(true);
        setIsSubmitting(false);
        return;
      }

      // Validate stock availability
      for (const item of selectedMedicines) {
        if (item.medicine && item.medicine.stockQuantity < item.quantity) {
          toast.error(`Insufficient stock for ${item.medicine.name}. Available: ${item.medicine.stockQuantity}`);
          setIsSubmitting(false);
          return;
        }
      }

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
        type: 'sell' as const,
        items: transactionItems,
        totalAmount,
        date: new Date().toISOString(),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        prescriptionFiles: prescriptionFiles.length > 0 ? prescriptionFiles : undefined,
        gstAmount,
        invoiceNumber: generateInvoiceNumber('sell'),
        paymentMethod: data.paymentMethod
      };

      // Save transaction
      DataStore.addTransaction(transaction);

      toast.success('Sale completed successfully!');
      
      // Reset form
      reset();
      setSelectedMedicines([{ medicineId: '', quantity: 1, price: 0 }]);
      setScheduleHMedicines([]);
      setPrescriptionFiles([]);

    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Failed to process sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrescriptionUpload = (files: string[]) => {
    setPrescriptionFiles(files);
    setShowPrescriptionDialog(false);
    // Continue with the sale
    handleSubmit(onSubmit)();
  };

  const handleSkipPrescription = () => {
    setShowPrescriptionDialog(false);
    // Continue with the sale without prescription
    handleSubmit(onSubmit)();
  };

  const subtotal = calculateTotal();
  const gstAmount = calculateGSTAmount(subtotal);
  const total = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name (Optional)</Label>
            <Input
              id="customerName"
              {...register('customerName')}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
            <Input
              id="customerPhone"
              {...register('customerPhone')}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Medicine Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Select Medicines</h3>
            <Button type="button" onClick={addMedicine} variant="outline">
              Add Medicine
            </Button>
          </div>

          {selectedMedicines.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                      const updatedMedicines = [...selectedMedicines];
                      updatedMedicines[index].quantity = quantity;
                      setSelectedMedicines(updatedMedicines);
                      setValue(`items.${index}.quantity`, quantity);
                    }}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Price: {formatCurrency(item.price)}</Label>
                    <p className="text-sm text-gray-600">
                      Total: {formatCurrency(item.quantity * item.price)}
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

              {/* Schedule H Warning */}
              {item.medicine?.isScheduleH && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-orange-800">Schedule H Drug</p>
                      <p className="text-xs text-orange-600">
                        This medicine requires a prescription as per Indian medical regulations
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Warning */}
              {item.medicine && item.medicine.stockQuantity < item.quantity && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">❌</span>
                    <div>
                      <p className="text-sm font-medium text-red-800">Insufficient Stock</p>
                      <p className="text-xs text-red-600">
                        Available: {item.medicine.stockQuantity}, Required: {item.quantity}
                      </p>
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

        {/* Bill Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
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
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || subtotal === 0}
        >
          {isSubmitting ? 'Processing Sale...' : `Complete Sale - ${formatCurrency(total)}`}
        </Button>
      </form>

      {/* Prescription Upload Dialog */}
      <PrescriptionUploadDialog
        open={showPrescriptionDialog}
        onClose={() => setShowPrescriptionDialog(false)}
        onUpload={handlePrescriptionUpload}
        onSkip={handleSkipPrescription}
        scheduleHMedicines={scheduleHMedicines.map(id => 
          selectedMedicines.find(item => item.medicineId === id)?.medicine?.name || ''
        )}
      />
    </div>
  );
}
