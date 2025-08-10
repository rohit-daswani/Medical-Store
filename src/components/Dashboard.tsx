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

type TimeRange = 'day' | 'week' | 'month';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expiringMedicines, setExpiringMedicines] = useState<ExpiringMedicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('month');
  const [dateRange, setDateRange] = useState<string>('');

  const processChartData = (timeRange: TimeRange) => {
    const salesTransactions = DataStore.getTransactions('sell');
    const purchaseTransactions = DataStore.getTransactions('purchase');
    
    let formatKey: (dateStr: string) => string;
    let displayFormat: (key: string) => string;
    
    switch (timeRange) {
      case 'day':
        formatKey = (dateStr: string) => {
          const date = new Date(dateStr);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        displayFormat = (key: string) => {
          const date = new Date(key);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        break;
      case 'week':
        formatKey = (dateStr: string) => {
          const date = new Date(dateStr);
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          return `${startOfWeek.getFullYear()}-W${Math.ceil(startOfWeek.getDate() / 7)}`;
        };
        displayFormat = (key: string) => {
          return `Week ${key.split('-W')[1]}`;
        };
        break;
      default: // month
        formatKey = (dateStr: string) => {
          const date = new Date(dateStr);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        };
        displayFormat = (key: string) => {
          const date = new Date(key + '-01');
          return date.toLocaleString('default', { month: 'short' });
        };
    }

    const transactionsByPeriod: Record<string, { totalRevenue: number; totalSales: number }> = {};
    
    // Process sales transactions (Total Sales)
    salesTransactions.forEach(txn => {
      const key = formatKey(txn.date);
      if (!transactionsByPeriod[key]) {
        transactionsByPeriod[key] = { totalRevenue: 0, totalSales: 0 };
      }
      transactionsByPeriod[key].totalSales += txn.totalAmount;
    });
    
    // Process purchase transactions (Total Revenue - combining both for revenue calculation)
    purchaseTransactions.forEach(txn => {
      const key = formatKey(txn.date);
      if (!transactionsByPeriod[key]) {
        transactionsByPeriod[key] = { totalRevenue: 0, totalSales: 0 };
      }
      transactionsByPeriod[key].totalRevenue += txn.totalAmount;
    });

    // Add sales to revenue for total revenue calculation
    Object.keys(transactionsByPeriod).forEach(key => {
      transactionsByPeriod[key].totalRevenue += transactionsByPeriod[key].totalSales;
    });

    const chartArray = Object.entries(transactionsByPeriod)
      .map(([period, amounts]) => ({
        period: displayFormat(period),
        totalRevenue: Math.round(amounts.totalRevenue / 100), // Scale down for better visualization
        totalSales: Math.round(amounts.totalSales / 100),
        originalPeriod: period
      }))
      .sort((a, b) => a.originalPeriod.localeCompare(b.originalPeriod))
      .slice(-12); // Show last 12 periods

    return chartArray;
  };

  const updateDateRange = (data: any[], timeRange: TimeRange) => {
    if (data.length === 0) return '';
    
    const firstPeriod = data[0].originalPeriod;
    const lastPeriod = data[data.length - 1].originalPeriod;
    
    const formatDateRange = (period: string) => {
      const date = new Date(period + (timeRange === 'month' ? '-01' : ''));
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    return `${formatDateRange(firstPeriod)} - ${formatDateRange(lastPeriod)}`;
  };

  useEffect(() => {
    // Load dashboard data
    const dashboardStats = DataStore.getDashboardStats();
    const transactions = DataStore.getTransactions().slice(-5).reverse();
    const expiring = DataStore.getExpiringMedicines(15);
    const inventory = DataStore.getInventory();
    const lowStock = inventory.filter(item => item.isLowStock);

    setStats(dashboardStats);
    setRecentTransactions(transactions);
    setExpiringMedicines(expiring);
    setLowStockMedicines(lowStock);

    // Process chart data based on selected time range
    const processedData = processChartData(selectedTimeRange);
    setChartData(processedData);
    setDateRange(updateDateRange(processedData, selectedTimeRange));

    // Show notifications for critical items
    if (lowStock.length > 0) {
      toast.warning(`${lowStock.length} medicines are running low on stock!`);
    }
    
    if (expiring.length > 0) {
      toast.warning(`${expiring.length} medicines are expiring within 15 days!`);
    }
  }, [selectedTimeRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };

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

      {/* Enhanced Sales & Revenue Chart */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            {/* Custom Header with Legends and Time Range Selector */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 space-y-4 lg:space-y-0">
              {/* Custom Legends */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
                    <span className="text-sm font-medium text-[#4F46E5]">Total Revenue</span>
                  </div>
                  <div className="text-xs text-gray-500">{dateRange}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
                    <span className="text-sm font-medium text-[#06B6D4]">Total Sales</span>
                  </div>
                  <div className="text-xs text-gray-500">{dateRange}</div>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedTimeRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="totalSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value, 
                      name === 'totalRevenue' ? 'Total Revenue' : 'Total Sales'
                    ]}
                    labelStyle={{ color: '#1e293b' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke="#4F46E5" 
                    fill="url(#totalRevenue)"
                    strokeWidth={2}
                    dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#4F46E5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalSales" 
                    stroke="#06B6D4" 
                    fill="url(#totalSales)"
                    strokeWidth={2}
                    dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#06B6D4' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--foreground)]/70 text-sm">
                  No transactional data available to display.
                </p>
                <p className="text-[var(--foreground)]/50 text-xs mt-1">
                  Revenue and sales data will appear here once transactions are recorded.
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
