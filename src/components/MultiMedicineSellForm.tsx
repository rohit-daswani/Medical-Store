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

export function MultiMedicineSellForm() {
  const [scheduleHMedicines, setScheduleHMedicines] = useState<string[]>([]);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [prescriptionFiles, setPrescriptionFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discounts, setDiscounts] = useState<{ [key: number]: number }>({});

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
    reset,
    control,
    watch
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const addMedicine = () => {
    append({ medicineId: '', quantity: 1, price: 0 });
  };

  const removeMedicine = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleMedicineSelect = (index: number, medicine: Medicine) => {
    setValue(`items.${index}.medicineId`, medicine.id);
    setValue(`items.${index}.price`, medicine.price);

    if (medicine.isScheduleH) {
      setScheduleHMedicines(prev => [...new Set([...prev, medicine.id])]);
    }
  };

  const handleDiscountChange = (index: number, discountPercentage: number) => {
    const medicineId = watch(`items.${index}.medicineId`);
    const medicine = DataStore.getMedicineById(medicineId);
    
    if (!medicine) return;

    const originalPrice = medicine.mrp || medicine.price;
    const purchasePrice = medicine.price;
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);

    // Validation: Check if discounted price is below purchase price
    if (discountedPrice < purchasePrice) {
      toast.warning(
        `Warning: Discounted price (${formatCurrency(discountedPrice)}) is below purchase price (${formatCurrency(purchasePrice)}). You may proceed but this will result in a loss.`,
        { 
          duration: 8000,
          action: {
            label: 'Continue Anyway',
            onClick: () => {
              setDiscounts(prev => ({ ...prev, [index]: discountPercentage }));
              setValue(`items.${index}.price`, discountedPrice);
            }
          }
        }
      );
      return;
    }

    // Apply discount if validation passes
    setDiscounts(prev => ({ ...prev, [index]: discountPercentage }));
    setValue(`items.${index}.price`, discountedPrice);
    
    toast.success(`${discountPercentage}% discount applied. New price: ${formatCurrency(discountedPrice)}`);
  };

  const calculateTotal = () => {
    const items = watch('items');
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const calculateGSTBreakdown = (items: any[]) => {
    let totalSgst = 0;
    let totalCgst = 0;
    
    items.forEach(item => {
      const medicine = DataStore.getMedicineById(item.medicineId);
      const gstRate = medicine?.gstRate || 18; // Use medicine's GST rate or default to 18%
      const itemTotal = item.totalAmount || 0;
      const itemSgst = (itemTotal * (gstRate / 2)) / 100;
      const itemCgst = (itemTotal * (gstRate / 2)) / 100;
      
      totalSgst += itemSgst;
      totalCgst += itemCgst;
    });
    
    return { sgst: totalSgst, cgst: totalCgst, total: totalSgst + totalCgst };
  };

  const onSubmit = async (data: SellFormData) => {
    try {
      setIsSubmitting(true);

      const hasScheduleH = data.items.some(item => scheduleHMedicines.includes(item.medicineId));
      if (hasScheduleH && prescriptionFiles.length === 0) {
        setShowPrescriptionDialog(true);
        setIsSubmitting(false);
        return;
      }

      // Validate stock availability
      for (const item of data.items) {
        const medicine = DataStore.getMedicineById(item.medicineId);
        if (medicine && medicine.stockQuantity < item.quantity) {
          toast.error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`);
          setIsSubmitting(false);
          return;
        }
      }

      const subtotal = calculateTotal();
      
      // Use FIFO for selling medicines
      const transactionItems: TransactionItem[] = [];
      for (const item of data.items) {
        const medicine = DataStore.getMedicineById(item.medicineId);
        if (!medicine) continue;

        // Use FIFO to sell from oldest lots first
        const fifoResult = DataStore.sellMedicineFromFIFO(item.medicineId, item.quantity);
        if (!fifoResult.success) {
          toast.error(fifoResult.message || 'Failed to process sale');
          setIsSubmitting(false);
          return;
        }

        transactionItems.push({
          medicineId: item.medicineId,
          medicineName: medicine.name,
          quantity: item.quantity,
          price: item.price,
          batchNo: fifoResult.lots[0]?.batchNo || medicine.batchNo,
          expiryDate: fifoResult.lots[0]?.expiryDate || medicine.expiryDate
        });
      }

      const gstBreakdown = calculateGSTBreakdown(transactionItems);
      const totalAmount = subtotal + gstBreakdown.total;

      const transaction = {
        type: 'sell' as const,
        items: transactionItems,
        totalAmount,
        date: new Date().toISOString(),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        prescriptionFiles: prescriptionFiles.length > 0 ? prescriptionFiles : undefined,
        gstAmount: gstBreakdown.total,
        invoiceNumber: generateInvoiceNumber('sell'),
        paymentMethod: data.paymentMethod
      };

      DataStore.addTransaction(transaction);

      toast.success('Sale completed successfully!');
      reset();
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
    handleSubmit(onSubmit)();
  };

  const handleSkipPrescription = () => {
    setShowPrescriptionDialog(false);
    handleSubmit(onSubmit)();
  };

  const subtotal = calculateTotal();
  const items = watch('items');
  const gstBreakdown = calculateGSTBreakdown(items.map(item => ({
    medicineId: item.medicineId,
    totalAmount: item.quantity * item.price
  })));
  const total = subtotal + gstBreakdown.total;

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
            <Button type="button" onClick={addMedicine} variant="outline" size="sm">
              Add Medicine
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
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
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Price: {formatCurrency(watch(`items.${index}.price`))}</Label>
                    <p className="text-sm text-gray-600">
                      Total: {formatCurrency(watch(`items.${index}.quantity`) * watch(`items.${index}.price`))}
                    </p>
                  </div>
                  {fields.length > 1 && (
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

              {/* Discount Section */}
              {watch(`items.${index}.medicineId`) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                    <Input
                      id={`discount-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discounts[index] || ''}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        if (discount >= 0 && discount <= 100) {
                          handleDiscountChange(index, discount);
                        }
                      }}
                      placeholder="Enter discount percentage"
                    />
                  </div>
                  {discounts[index] && (
                    <div className="flex items-end">
                      <div>
                        <Label>Discount Applied</Label>
                        <p className="text-sm font-medium text-green-600">
                          {discounts[index]}% off - Save {formatCurrency(
                            (DataStore.getMedicineById(watch(`items.${index}.medicineId`))?.mrp || 0) * 
                            (discounts[index] / 100) * 
                            watch(`items.${index}.quantity`)
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Schedule H Warning */}
              {scheduleHMedicines.includes(watch(`items.${index}.medicineId`)) && (
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
              {(() => {
                const medicineId = watch(`items.${index}.medicineId`);
                const quantity = watch(`items.${index}.quantity`);
                const medicine = DataStore.getMedicineById(medicineId);
                if (medicine && medicine.stockQuantity < quantity) {
                  return (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">❌</span>
                        <div>
                          <p className="text-sm font-medium text-red-800">Insufficient Stock</p>
                          <p className="text-xs text-red-600">
                            Available: {medicine.stockQuantity}, Required: {quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
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
              <span>SGST:</span>
              <span>{formatCurrency(gstBreakdown.sgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>{formatCurrency(gstBreakdown.cgst)}</span>
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
          DataStore.getMedicineById(id)?.name || ''
        )}
      />
    </div>
  );
}
