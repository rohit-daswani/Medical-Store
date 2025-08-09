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

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<ExpiringMedicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);

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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to MediStore Pro</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link href="/transactions">
            <Button>New Transaction</Button>
          </Link>
          <Link href="/inventory">
            <Button variant="outline">View Inventory</Button>
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
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
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
            <div className="text-2xl font-bold text-red-600">{stats.expiringCount}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
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
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.type === 'sell' ? 'default' : 'secondary'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{transaction.invoiceNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {transaction.items.length} item(s) • {formatDate(transaction.date)}
                      </p>
                      {transaction.customerName && (
                        <p className="text-xs text-gray-500">{transaction.customerName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-xs text-gray-500 capitalize">{transaction.paymentMethod}</p>
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
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-orange-800">Low Stock Alert</h4>
                      <p className="text-sm text-orange-600">
                        {lowStockMedicines.length} medicines need restocking
                      </p>
                    </div>
                    <Link href="/inventory">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="mt-2 space-y-1">
                    {lowStockMedicines.slice(0, 3).map((item) => (
                      <p key={item.medicineId} className="text-xs text-orange-700">
                        • {item.medicine.name} ({item.quantity} left)
                      </p>
                    ))}
                    {lowStockMedicines.length > 3 && (
                      <p className="text-xs text-orange-600">
                        +{lowStockMedicines.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Expiring Medicines Alert */}
              {expiringMedicines.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">Expiring Soon</h4>
                      <p className="text-sm text-red-600">
                        {expiringMedicines.length} medicines expiring within 15 days
                      </p>
                    </div>
                    <Link href="/expiring">
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                  <div className="mt-2 space-y-1">
                    {expiringMedicines.slice(0, 3).map((medicine) => (
                      <p key={medicine.id} className="text-xs text-red-700">
                        • {medicine.name} (expires {formatDate(medicine.expiryDate)})
                      </p>
                    ))}
                    {expiringMedicines.length > 3 && (
                      <p className="text-xs text-red-600">
                        +{expiringMedicines.length - 3} more medicines
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* No Alerts */}
              {lowStockMedicines.length === 0 && expiringMedicines.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <div>
                      <h4 className="font-medium text-green-800">All Good!</h4>
                      <p className="text-sm text-green-600">No critical alerts at this time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/transactions">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">💳</span>
                <span className="text-sm">New Sale</span>
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📦</span>
                <span className="text-sm">Purchase</span>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm">Inventory</span>
              </Button>
            </Link>
            <Link href="/tax-filing">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <span className="text-2xl">📋</span>
                <span className="text-sm">Tax Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
