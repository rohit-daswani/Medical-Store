'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataStore } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, exportTransactions } from '@/lib/export-utils';
import { toast } from 'sonner';

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const allTransactions = DataStore.getTransactions();
    setTransactions(allTransactions);
    setFilteredTransactions(allTransactions);
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(txn => txn.type === filters.type);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(txn => 
        new Date(txn.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(txn => 
        new Date(txn.date) <= new Date(filters.dateTo)
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(txn => 
        txn.invoiceNumber.toLowerCase().includes(searchTerm) ||
        txn.customerName?.toLowerCase().includes(searchTerm) ||
        txn.items.some(item => 
          item.medicineName.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const handleExport = (type?: 'sell' | 'purchase') => {
    try {
      const exportData = type 
        ? filteredTransactions.filter(txn => txn.type === type)
        : filteredTransactions;
      
      if (exportData.length === 0) {
        toast.error('No transactions to export');
        return;
      }

      exportTransactions(exportData, type);
      toast.success(`${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'} transactions exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Transaction Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="sell">Sales Only</SelectItem>
                  <SelectItem value="purchase">Purchases Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Invoice, customer, medicine..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleExport()}>
                Export All
              </Button>
              <Button variant="outline" onClick={() => handleExport('sell')}>
                Export Sales
              </Button>
              <Button variant="outline" onClick={() => handleExport('purchase')}>
                Export Purchases
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              <p className="text-sm text-[var(--foreground)]/70">Total Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">
                {filteredTransactions.filter(txn => txn.type === 'sell').length}
              </p>
              <p className="text-sm text-[var(--foreground)]/70">Sales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--brand-blue)]">
                {filteredTransactions.filter(txn => txn.type === 'purchase').length}
              </p>
              <p className="text-sm text-[var(--foreground)]/70">Purchases</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatCurrency(
                  filteredTransactions.reduce((sum, txn) => sum + txn.totalAmount, 0)
                )}
              </p>
              <p className="text-sm text-[var(--foreground)]/70">Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transaction History ({filteredTransactions.length} transactions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--foreground)]/70">No transactions found</p>
              <p className="text-sm text-[var(--foreground)]/60 mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer/Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'sell' ? 'default' : 'secondary'}>
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.customerName || 'Walk-in Customer'}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {transaction.items.slice(0, 2).map((item, index) => (
                              <p key={index} className="text-sm truncate">
                                {item.medicineName} ({item.quantity})
                              </p>
                            ))}
                            {transaction.items.length > 2 && (
                              <p className="text-xs text-[var(--foreground)]/60">
                                +{transaction.items.length - 2} more
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-[var(--foreground)]/70">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{' '}
                    {filteredTransactions.length} transactions
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
