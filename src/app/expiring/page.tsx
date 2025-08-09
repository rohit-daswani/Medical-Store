'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataStore } from '@/lib/mock-data';
import { ExpiringMedicine } from '@/types';
import { formatDate, exportExpiringMedicines } from '@/lib/export-utils';
import { toast } from 'sonner';

export default function ExpiringMedicinesPage() {
  const [expiringMedicines, setExpiringMedicines] = useState<ExpiringMedicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<ExpiringMedicine[]>([]);
  const [expiryPeriod, setExpiryPeriod] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    const medicines = DataStore.getExpiringMedicines(expiryPeriod);
    setExpiringMedicines(medicines);
    setFilteredMedicines(medicines);

    // Show notification if there are expiring medicines
    if (medicines.length > 0) {
      toast.warning(`${medicines.length} medicines are expiring within ${expiryPeriod} days!`);
    }
  }, [expiryPeriod]);

  const handlePeriodChange = (period: string) => {
    setExpiryPeriod(parseInt(period));
    setCurrentPage(1);
  };

  const handleExport = () => {
    try {
      if (filteredMedicines.length === 0) {
        toast.error('No expiring medicines to export');
        return;
      }

      exportExpiringMedicines(filteredMedicines);
      toast.success('Expiring medicines report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export expiring medicines report');
    }
  };

  // Categorize medicines by urgency
  const criticalMedicines = filteredMedicines.filter(med => med.daysToExpiry <= 7);
  const warningMedicines = filteredMedicines.filter(med => med.daysToExpiry > 7 && med.daysToExpiry <= 15);
  const watchMedicines = filteredMedicines.filter(med => med.daysToExpiry > 15);

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getUrgencyBadge = (daysToExpiry: number) => {
    if (daysToExpiry <= 7) {
      return <Badge variant="destructive">Critical - {daysToExpiry} days</Badge>;
    } else if (daysToExpiry <= 15) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Warning - {daysToExpiry} days</Badge>;
    } else {
      return <Badge variant="outline">Watch - {daysToExpiry} days</Badge>;
    }
  };

  const getRowClassName = (daysToExpiry: number) => {
    if (daysToExpiry <= 7) {
      return 'bg-red-50 border-l-4 border-red-500';
    } else if (daysToExpiry <= 15) {
      return 'bg-orange-50 border-l-4 border-orange-500';
    } else {
      return 'bg-yellow-50 border-l-4 border-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiring Medicines</h1>
          <p className="text-gray-600 mt-1">Monitor medicines approaching expiry dates</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button onClick={handleExport} variant="outline" disabled={filteredMedicines.length === 0}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Expiry Period Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label>Show medicines expiring within:</Label>
            <Select value={expiryPeriod.toString()} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="15">15 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {criticalMedicines.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> {criticalMedicines.length} medicines are expiring within 7 days and need immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {warningMedicines.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <strong>Warning:</strong> {warningMedicines.length} medicines are expiring within 8-15 days. Plan for clearance or return.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expiring</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMedicines.length}</div>
            <p className="text-xs text-muted-foreground">
              Within {expiryPeriod} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical (≤7 days)</CardTitle>
            <span className="text-2xl">🚨</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalMedicines.length}</div>
            <p className="text-xs text-muted-foreground">
              Immediate action needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning (8-15 days)</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningMedicines.length}</div>
            <p className="text-xs text-muted-foreground">
              Plan clearance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch ({'>'}15 days)</CardTitle>
            <span className="text-2xl">👁️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{watchMedicines.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitor closely
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Medicines Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Expiring Medicines ({filteredMedicines.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMedicines.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg font-medium text-green-600">Great news!</p>
              <p className="text-gray-500">No medicines are expiring within {expiryPeriod} days</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Stock Quantity</TableHead>
                      <TableHead>Days to Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMedicines.map((medicine) => (
                      <TableRow key={medicine.id} className={getRowClassName(medicine.daysToExpiry)}>
                        <TableCell className="font-medium">
                          {medicine.name}
                        </TableCell>
                        <TableCell>
                          {medicine.batchNo}
                        </TableCell>
                        <TableCell>
                          {medicine.supplier}
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            medicine.daysToExpiry <= 7 ? 'text-red-600' :
                            medicine.daysToExpiry <= 15 ? 'text-orange-600' : 'text-yellow-600'
                          }`}>
                            {formatDate(medicine.expiryDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{medicine.quantity}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {medicine.daysToExpiry} days
                          </div>
                        </TableCell>
                        <TableCell>
                          {getUrgencyBadge(medicine.daysToExpiry)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Mark for Return
                            </Button>
                            <Button variant="outline" size="sm">
                              Discount Sale
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredMedicines.length)} of{' '}
                    {filteredMedicines.length} medicines
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
