# Implementation Plan for Pharmacy Management System Enhancements

## Task Overview
The following enhancements are to be made to the pharmacy management system based on the provided requirements:

1. Show SGST and CGST percentages alongside their values.
2. Update the quick sell page to reflect the correct tax based on selected medicine.
3. Implement functionality to upload stock with images or PDF files.
4. Compare new stock prices with previous purchase prices based on supplier and manufacturer.
5. Fix the prescription upload functionality.
6. Ensure details are reflected in the "Discount Sale" popup for expiring medicines.
7. Add validation for discount percentages.
8. Automatically add new supplier details when uploading stock.

## Detailed Steps

### 1. Show SGST and CGST Percentages
- **Files to Edit**: 
  - `src/components/PurchaseForm.tsx`
  - `src/app/transactions/quick-sell/page.tsx`
- **Changes**: Update the display of SGST and CGST to include percentages in brackets.

### 2. Update Quick Sell Page Tax
- **Files to Edit**: 
  - `src/app/transactions/quick-sell/page.tsx`
- **Changes**: Modify the tax display logic to show the correct tax based on the selected medicine.

### 3. Upload Stock with Images or PDFs
- **Files to Edit**: 
  - `src/app/inventory/bulk-upload/page.tsx`
- **Changes**: Implement file upload functionality for images and PDFs, similar to the existing CSV upload.

### 4. Compare New Stock Prices
- **Files to Edit**: 
  - `src/components/PurchaseForm.tsx`
- **Changes**: Add logic to compare new stock prices with previous purchase prices based on supplier and manufacturer.

### 5. Fix Prescription Upload Functionality
- **Files to Edit**: 
  - `src/components/PrescriptionUploadDialog.tsx`
- **Changes**: Debug and fix the issue preventing the file selection window from appearing.

### 6. Discount Sale Popup Details
- **Files to Edit**: 
  - `src/app/expiring/page.tsx`
- **Changes**: Ensure that the correct medicine details are displayed in the discount sale popup.

### 7. Validation for Discount Percentages
- **Files to Edit**: 
  - `src/components/MultiMedicineSellForm.tsx`
- **Changes**: Implement validation to notify users if the discount price falls below the purchase price.

### 8. Automatically Add New Supplier Details
- **Files to Edit**: 
  - `src/app/inventory/bulk-upload/page.tsx`
- **Changes**: Add logic to automatically include new supplier details when uploading stock.

## Follow-Up Steps
- Test all changes thoroughly to ensure functionality.
- Update any relevant documentation.
- Prepare for deployment.
