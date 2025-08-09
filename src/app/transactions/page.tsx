'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiMedicineSellForm } from '@/components/MultiMedicineSellForm';
import { PurchaseForm } from '@/components/PurchaseForm';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('sell');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Manage sales, purchases, and transaction history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sell">Sell Medicines</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Stock</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">💳</span>
                <span>Sell Medicines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiMedicineSellForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📦</span>
                <span>Purchase Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <span>Transaction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
