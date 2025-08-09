'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataStore } from '@/lib/mock-data';
import { DashboardStats, Transaction, ExpiringMedicine } from '@/types';
import { formatCurrency, formatDate } from '@/lib/export-utils';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<ExpiringMedicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Load dashboard data
    const dashboardStats = DataStore.getDashboardStats();
    const transactions = DataStore.getTransactions().slice(-5).reverse(); // Last 5 transactions
    const expiring = DataStore.getExpiringMedicines(15); // Expiring in 15 days
    const inventory = DataStore.getInventory();
    const lowStock = inventory.filter(item => item.isLowStock);

    setStats(dashboardStats);
    setRecentTransactions(transactions);
    setExpiringMedicines(expiring);
    setLowStockMedicines(lowStock);

    // Prepare combined sales and purchase data for graph (group by month)
    const formatYearMonth = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };

    const transactionsByMonth: Record<string, { sales: number; purchases: number }> = {};
    
    // Aggregate sales transactions
    const salesTransactions = DataStore.getTransactions('sell');
    salesTransactions.forEach(txn => {
      const key = formatYearMonth(txn.date);
      if (!transactionsByMonth[key]) {
        transactionsByMonth[key] = { sales: 0, purchases: 0 };
      }
      transactionsByMonth[key].sales += txn.totalAmount;
    });
    
    // Aggregate purchase transactions
    const purchaseTransactions = DataStore.getTransactions('purchase');
    purchaseTransactions.forEach(txn => {
      const key = formatYearMonth(txn.date);
      if (!transactionsByMonth[key]) {
        transactionsByMonth[key] = { sales: 0, purchases: 0 };
      }
      transactionsByMonth[key].purchases += txn.totalAmount;
    });

    // Convert to array and format for display
    const mergedData = Object.entries(transactionsByMonth)
      .map(([yearMonth, amounts]) => {
        const date = new Date(yearMonth + '-01');
        const displayMonth = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        return { month: displayMonth, ...amounts };
      })
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 01');
        const dateB = new Date(b.month + ' 01');
        return dateA.getTime() - dateB.getTime();
      });
    
    setChartData(mergedData);

    // Show notifications for critical items
    if (lowStock.length > 0) {
      toast.warning(`${lowStock.length} medicines are running low on stock!`);
    }
    
    if (expiring.length > 0) {
      toast.warning(`${expiring.length} medicines are expiring within 15 days!`);
    }
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Dashboard</h1>
          <p className="text-[var(--foreground)]/70 mt-1">Welcome to MediStore Pro</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link href="/transactions">
            <Button size="sm">New Transaction</Button>
          </Link>
          <Link href="/inventory">
            <Button variant="outline" size="sm">View Inventory</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Purchases</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">
              Inventory investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--warning)]">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--error)]">{stats.expiringCount}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales & Purchase Comparison Chart */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Purchase Comparison Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    labelStyle={{ color: '#1e293b' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    fill="#dbeafe" 
                    strokeWidth={2}
                    name="Sales"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="purchases" 
                    stroke="#10b981" 
                    fill="#d1fae5" 
                    strokeWidth={2}
                    name="Purchases"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--foreground)]/70 text-sm">
                  No transactional data available to display.
                </p>
                <p className="text-[var(--foreground)]/50 text-xs mt-1">
                  Sales and purchase data will appear here once transactions are recorded.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/transactions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-[var(--foreground)]/70 text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-[var(--panel-bg)] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.type === 'sell' ? 'default' : 'secondary'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{transaction.invoiceNumber}</span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]/70 mt-1">
                        {transaction.items.length} item(s) • {formatDate(transaction.date)}
                      </p>
                      {transaction.customerName && (
                        <p className="text-xs text-[var(--foreground)]/60">{transaction.customerName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-xs text-[var(--foreground)]/60 capitalize">{transaction.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Low Stock Alert */}
              {lowStockMedicines.length > 0 && (
                <div className="p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--warning)]">Low Stock Alert</h4>
                      <p className="text-sm text-[var(--warning)]/80">
                        {lowStockMedicines.length} medicines need restocking
                      </p>
                    </div>
                    <Link href="/inventory">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="mt-2 space-y-1">
                    {lowStockMedicines.slice(0, 3).map((item) => (
                      <p key={item.medicineId} className="text-xs text-[var(--warning)]/90">
                        • {item.medicine.name} ({item.quantity} left)
                      </p>
                    ))}
                    {lowStockMedicines.length > 3 && (
                      <p className="text-xs text-[var(--warning)]/80">
                        +{lowStockMedicines.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Expiring Medicines Alert */}
              {expiringMedicines.length > 0 && (
                <div className="p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--error)]">Expiring Soon</h4>
                      <p className="text-sm text-[var(--error)]/80">
                        {expiringMedicines.length} medicines expiring within 15 days
                      </p>
                    </div>
                    <Link href="/expiring">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="mt-2 space-y-1">
                    {expiringMedicines.slice(0, 3).map((medicine) => (
                      <p key={medicine.id} className="text-xs text-[var(--error)]/90">
                        • {medicine.name} (expires {formatDate(medicine.expiryDate)})
                      </p>
                    ))}
                    {expiringMedicines.length > 3 && (
                      <p className="text-xs text-[var(--error)]/80">
                        +{expiringMedicines.length - 3} more medicines
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* No Alerts */}
              {lowStockMedicines.length === 0 && expiringMedicines.length === 0 && (
                <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-[var(--success)] mr-2">✓</span>
                    <div>
                      <h4 className="font-medium text-[var(--success)]">All Good!</h4>
                      <p className="text-sm text-[var(--success)]/80">No critical alerts at this time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* Removed as per user request */}
    </div>
  );
}
