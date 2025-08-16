'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    expiryAlerts: true,
    
    // Display Settings
    theme: 'light',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    
    // Business Settings
    taxRate: '18',
    lowStockThreshold: '10',
    expiryWarningDays: '30',
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
      setIsLoading(false);
    }, 1000);
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-blue)]">Settings</h1>
        <p className="text-[var(--foreground)]/70 mt-1">Manage your application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(value) => handleSwitchChange('emailNotifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(value) => handleSwitchChange('smsNotifications', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when stock is low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(value) => handleSwitchChange('lowStockAlerts', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Expiry Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about expiring medicines</p>
              </div>
              <Switch
                checked={settings.expiryAlerts}
                onCheckedChange={(value) => handleSwitchChange('expiryAlerts', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                placeholder="Enter tax rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                placeholder="Enter threshold quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryWarningDays">Expiry Warning (Days)</Label>
              <Input
                id="expiryWarningDays"
                type="number"
                value={settings.expiryWarningDays}
                onChange={(e) => handleInputChange('expiryWarningDays', e.target.value)}
                placeholder="Days before expiry to warn"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-gray-500">Automatically backup your data</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(value) => handleSwitchChange('autoBackup', value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Backup Frequency</Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
