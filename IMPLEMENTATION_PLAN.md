# Medical Store Web App - Comprehensive Implementation Plan

## Overview
A modern, responsive medical store web app supporting:
- Multi-medicine transactions (sell/purchase)
- Inventory management with alerts
- Indian medical compliance (Schedule H drugs)
- CA tax filing data export
- Mobile-responsive design

## 1. Project Structure & Files

### 1.1 Type Definitions
**File:** `src/types/index.ts` (NEW)

```typescript
export interface Medicine {
  id: string;
  name: string;
  expiryDate: string;
  batchNo: string;
  supplier: string;
  isScheduleH: boolean;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
}

export interface TransactionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  batchNo: string;
}

export interface Transaction {
  id: string;
  type: 'sell' | 'purchase';
  items: TransactionItem[];
  totalAmount: number;
  date: string;
  customerName?: string;
  prescriptionFiles?: string[]; // For Schedule H drugs
  gstAmount?: number;
  invoiceNumber: string;
}

export interface InventoryItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  isLowStock: boolean;
}

export interface TaxData {
  totalSales: number;
  totalPurchases: number;
  gstCollected: number;
  gstPaid: number;
  netProfit: number;
  transactions: Transaction[];
}
```

### 1.2 Main Layout & Navigation
**File:** `src/app/layout.tsx` (NEW)

```typescript
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

**File:** `src/app/page.tsx` (NEW)

```typescript
import { Dashboard } from '@/components/Dashboard'

export default function HomePage() {
  return <Dashboard />
}
```

### 1.3 Core Pages

#### 1.3.1 Transactions Page
**File:** `src/app/transactions/page.tsx` (NEW)

Features:
- Tabbed interface (Sell/Purchase)
- Multi-medicine selection for sell transactions
- Schedule H drug detection with prescription upload option
- Form validation with react-hook-form + zod
- Real-time medicine search with suggestions

#### 1.3.2 Inventory Management Page
**File:** `src/app/inventory/page.tsx` (NEW)

Features:
- Current stock display with low-stock highlighting
- Search and filter functionality
- Stock level management
- Browser notifications for low stock

#### 1.3.3 Expiring Medicines Page
**File:** `src/app/expiring/page.tsx` (NEW)

Features:
- Configurable expiry period (15/30 days)
- Detailed medicine information (name, expiry, batch, supplier)
- CSV export functionality
- Alert notifications

#### 1.3.4 CA Tax Filing Page
**File:** `src/app/tax-filing/page.tsx` (NEW)

Features:
- Date range selection for tax period
- Summary of sales, purchases, GST
- Detailed transaction reports
- Export options (CSV, PDF)
- Profit/Loss calculations
- GST return data formatting

### 1.4 Core Components

#### 1.4.1 Sidebar Navigation
**File:** `src/components/Sidebar.tsx` (NEW)

Navigation items:
- Dashboard
- Transactions
- Inventory
- Expiring Medicines
- Tax Filing
- Settings

#### 1.4.2 Dashboard Component
**File:** `src/components/Dashboard.tsx` (NEW)

Features:
- Key metrics overview
- Recent transactions
- Low stock alerts
- Expiry notifications
- Quick action buttons

#### 1.4.3 Multi-Medicine Sell Form
**File:** `src/components/MultiMedicineSellForm.tsx` (NEW)

Features:
- Dynamic medicine addition/removal
- Auto-suggestion search for each medicine
- Schedule H detection per medicine
- Bulk prescription upload handling
- Total calculation

#### 1.4.4 Medicine Search Component
**File:** `src/components/MedicineSearch.tsx` (NEW)

Features:
- Debounced search input
- Dropdown suggestions
- Medicine details display
- Stock availability check

#### 1.4.5 Prescription Upload Dialog
**File:** `src/components/PrescriptionUploadDialog.tsx` (NEW)

Features:
- File upload (PDF/images)
- Multiple file support
- Skip option with confirmation
- File validation

#### 1.4.6 Tax Report Components
**File:** `src/components/TaxReports.tsx` (NEW)

Features:
- Sales/Purchase summary
- GST calculations
- Profit/Loss statements
- Export functionality

### 1.5 API Endpoints

#### 1.5.1 Transactions API
**File:** `src/app/api/transactions/route.ts` (NEW)

Endpoints:
- GET: Fetch all transactions with filters
- POST: Create new transaction (sell/purchase)

**File:** `src/app/api/transactions/[id]/route.ts` (NEW)

Endpoints:
- GET: Fetch specific transaction
- PUT: Update transaction
- DELETE: Delete transaction

#### 1.5.2 Inventory API
**File:** `src/app/api/inventory/route.ts` (NEW)

Endpoints:
- GET: Fetch inventory with stock levels
- POST: Add new medicine
- PUT: Update stock levels

#### 1.5.3 Medicines API
**File:** `src/app/api/medicines/route.ts` (NEW)

Endpoints:
- GET: Search medicines with suggestions
- POST: Add new medicine

**File:** `src/app/api/medicines/expiring/route.ts` (NEW)

Endpoints:
- GET: Fetch expiring medicines

#### 1.5.4 Tax Filing API
**File:** `src/app/api/tax-filing/route.ts` (NEW)

Endpoints:
- GET: Generate tax reports for date range
- POST: Export tax data

### 1.6 Utility Functions

#### 1.6.1 Data Export Utilities
**File:** `src/lib/export-utils.ts` (NEW)

Functions:
- `exportToCSV(data, filename)`
- `exportToPDF(data, filename)`
- `generateTaxReport(transactions, dateRange)`

#### 1.6.2 Validation Schemas
**File:** `src/lib/validations.ts` (NEW)

Zod schemas for:
- Transaction validation
- Medicine validation
- Tax report validation

#### 1.6.3 Mock Data Store
**File:** `src/lib/mock-data.ts` (NEW)

Mock data for:
- Sample medicines (including Schedule H)
- Sample transactions
- Inventory data

## 2. Implementation Steps

### Step 1: Setup Core Structure
1. Create type definitions
2. Setup main layout with sidebar
3. Create dashboard page
4. Setup mock data store

### Step 2: Implement Transactions
1. Create multi-medicine sell form
2. Implement medicine search with suggestions
3. Add Schedule H detection and prescription upload
4. Create purchase form
5. Setup transaction API endpoints

### Step 3: Inventory Management
1. Create inventory display page
2. Implement low stock detection
3. Add browser notifications
4. Setup inventory API endpoints

### Step 4: Expiring Medicines
1. Create expiring medicines page
2. Implement date filtering (15/30 days)
3. Add CSV export functionality
4. Setup expiring medicines API

### Step 5: Tax Filing System
1. Create CA tax filing page
2. Implement date range selection
3. Add sales/purchase summaries
4. Create GST calculations
5. Implement export functionality
6. Setup tax filing API endpoints

### Step 6: UI/UX Enhancements
1. Add responsive design
2. Implement toast notifications
3. Add loading states
4. Error handling
5. Form validations

### Step 7: Testing & Optimization
1. Test all workflows
2. Mobile responsiveness check
3. Performance optimization
4. Error handling verification

## 3. Key Features Implementation

### 3.1 Multi-Medicine Selling
- Dynamic form with add/remove medicine functionality
- Individual medicine search for each item
- Separate Schedule H handling per medicine
- Bulk total calculations
- Invoice generation

### 3.2 Schedule H Compliance
- Automatic detection based on medicine database
- Prescription upload modal with skip option
- Multiple file upload support
- Compliance warnings and confirmations

### 3.3 Tax Filing Integration
- Comprehensive sales/purchase tracking
- GST calculations (CGST, SGST, IGST)
- Profit/Loss statements
- Export in CA-friendly formats
- Date range filtering for tax periods

### 3.4 Inventory Alerts
- Real-time low stock monitoring
- Browser notifications
- Expiry date tracking
- Automated reorder suggestions

## 4. Technical Specifications

### 4.1 Frontend
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui components
- React Hook Form + Zod validation
- Sonner for notifications

### 4.2 Data Management
- Local JSON storage for demo
- In-memory state management
- File system for prescription uploads
- CSV/PDF export capabilities

### 4.3 Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interfaces
- Accessible design patterns

## 5. Compliance & Standards

### 5.1 Indian Medical Standards
- Schedule H drug identification
- Prescription requirement enforcement
- Batch number tracking
- Supplier information maintenance

### 5.2 Tax Compliance
- GST calculation accuracy
- Invoice number generation
- Transaction audit trail
- Export format compatibility

This comprehensive plan ensures a complete, professional medical store management system that meets all requirements while maintaining code quality and user experience standards.
