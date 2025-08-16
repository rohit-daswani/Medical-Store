'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataStore } from '@/lib/mock-data';
import { ExpiringMedicine } from '@/types';
import { formatDate } from '@/lib/export-utils';

type SortField = 'name' | 'supplier' | 'expiryDate' | 'daysToExpiry';
type SortOrder = 'asc' | 'desc';

export default function ExpiringMedicinesPage() {
  const [medicines, setMedicines] = useState<ExpiringMedicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<ExpiringMedicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('daysToExpiry');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [daysFilter, setDaysFilter] = useState('30');

  useEffect(() => {
    // Load expiring medicines
    const days = parseInt(daysFilter);
    const expiringMeds = DataStore.getExpiringMedicines(days);
    setMedicines(expiringMeds);
  }, [daysFilter]);

  useEffect(() => {
    // Apply search filter
    let filtered = medicines;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchLower) ||
        medicine.supplier.toLowerCase().includes(searchLower) ||
        medicine.batchNo.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'supplier':
          aValue = a.supplier.toLowerCase();
          bValue = b.supplier.toLowerCase();
          break;
        case 'expiryDate':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        case 'daysToExpiry':
          aValue = a.daysToExpiry;
          bValue = b.daysToExpiry;
          break;
        default:
          aValue = a.daysToExpiry;
          bValue = b.daysToExpiry;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredMedicines(filtered);
  }, [medicines, searchTerm, sortField, sortOrder]);

  // Categorize medicines by urgency
  const criticalMedicines = filteredMedicines.filter(med => med.daysToExpiry <= 7);
  const warningMedicines = filteredMedicines.filter(med => med.daysToExpiry > 7 && med.daysToExpiry <= 15);
  const watchMedicines = filteredMedicines.filter(med => med.daysToExpiry > 15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getPriorityBadge = (daysToExpiry: number) => {
    if (daysToExpiry <= 7) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (daysToExpiry <= 15) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Warning</Badge>;
    } else if (daysToExpiry <= 30) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Caution</Badge>;
    } else {
      return <Badge variant="secondary">Monitor</Badge>;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Medicine Name', 'Supplier', 'Batch No', 'Expiry Date', 'Days to Expiry', 'Quantity'].join(','),
      ...filteredMedicines.map(medicine => [
        medicine.name,
        medicine.supplier,
        medicine.batchNo,
        medicine.expiryDate,
        medicine.daysToExpiry.toString(),
        medicine.quantity.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expiring-medicines-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Expiring Medicines</h1>
          <p className="text-[var(--foreground)]/70 mt-1">Monitor medicines approaching expiry</p>
        </div>
        <Button onClick={exportData} variant="outline">
          Export to CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search medicines, supplier, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Days to Expiry</Label>
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="15">Next 15 days</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="60">Next 60 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daysToExpiry">Days to Expiry</SelectItem>
                  <SelectItem value="expiryDate">Expiry Date</SelectItem>
                  <SelectItem value="name">Medicine Name</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Critical (≤7 days)</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredMedicines.filter(m => m.daysToExpiry <= 7).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Warning (≤15 days)</div>
            <div className="text-2xl font-bold text-orange-600">
              {filteredMedicines.filter(m => m.daysToExpiry <= 15 && m.daysToExpiry > 7).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Caution (≤30 days)</div>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredMedicines.filter(m => m.daysToExpiry <= 30 && m.daysToExpiry > 15).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Medicines</div>
            <div className="text-2xl font-bold">
              {filteredMedicines.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expiring Medicines ({filteredMedicines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No medicines found matching your search' : 'No medicines expiring in the selected timeframe'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>Medicine Name</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('supplier')}
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>Supplier</span>
                        {getSortIcon('supplier')}
                      </button>
                    </th>
                    <th className="text-left p-3">Batch No</th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('expiryDate')}
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>Expiry Date</span>
                        {getSortIcon('expiryDate')}
                      </button>
                    </th>
                    <th className="text-left p-3">
                      <button
                        onClick={() => handleSort('daysToExpiry')}
                        className="flex items-center space-x-1 hover:text-blue-600"
                      >
                        <span>Days to Expiry</span>
                        {getSortIcon('daysToExpiry')}
                      </button>
                    </th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{medicine.supplier}</td>
                      <td className="p-3 text-gray-600">{medicine.batchNo}</td>
                      <td className="p-3 text-gray-600">{formatDate(medicine.expiryDate)}</td>
                      <td className="p-3">
                        <span className={`font-medium ${
                          medicine.daysToExpiry <= 7 ? 'text-red-600' :
                          medicine.daysToExpiry <= 15 ? 'text-orange-600' :
                          medicine.daysToExpiry <= 30 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {medicine.daysToExpiry} days
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{medicine.quantity}</td>
                      <td className="p-3">
                        {getPriorityBadge(medicine.daysToExpiry)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

{/* Action Recommendations */}
{filteredMedicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalMedicines.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Critical Items (≤7 days)</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Contact suppliers immediately for return/exchange</li>
                    <li>• Offer significant discounts for quick clearance</li>
                    <li>• Check if items can be donated to charitable organizations</li>
                    <li>• Document expired items for tax write-offs</li>
                  </ul>
                </div>
              )}

              {warningMedicines.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Warning Items (8-15 days)</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Plan promotional campaigns to move stock</li>
                    <li>• Contact regular customers who use these medicines</li>
                    <li>• Consider bundling with other products</li>
                    <li>• Negotiate return terms with suppliers</li>
                  </ul>
                </div>
              )}

              {watchMedicines.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Watch Items ({'>'}15 days)</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Monitor sales velocity closely</li>
                    <li>• Adjust ordering patterns for future purchases</li>
                    <li>• Consider mild promotional pricing</li>
                    <li>• Update inventory management thresholds</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}



    </div>
  );
}
