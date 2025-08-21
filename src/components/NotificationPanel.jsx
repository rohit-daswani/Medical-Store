'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataStore } from '@/lib/mock-data';
import { formatDate } from '@/lib/export-utils';

interface Notification {
  id: string;
  type: 'low-stock' | 'expiry' | 'transaction' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      generateNotifications();
    }
  }, [isOpen]);

  const generateNotifications = () => {
    const inventory = DataStore.getInventory();
    const lowStockItems = inventory.filter(item => item.isLowStock);
    const expiringMedicines = DataStore.getExpiringMedicines(30);
    
    const notificationList: Notification[] = [];

    // Low stock notifications
    lowStockItems.forEach((item, index) => {
      notificationList.push({
        id: `low-stock-${index}`,
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${item.medicine.name} is running low (${item.quantity} left)`,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time within last 24 hours
        read: false,
        priority: 'high'
      });
    });

    // Expiry notifications
    expiringMedicines.forEach((medicine, index) => {
      notificationList.push({
        id: `expiry-${index}`,
        type: 'expiry',
        title: 'Expiry Alert',
        message: `${medicine.name} expires on ${formatDate(medicine.expiryDate)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        read: false,
        priority: 'medium'
      });
    });

    // Recent transaction notifications
    const recentTransactions = DataStore.getTransactions().slice(-3);
    recentTransactions.forEach((transaction, index) => {
      notificationList.push({
        id: `transaction-${index}`,
        type: 'transaction',
        title: 'New Transaction',
        message: `${transaction.type === 'sell' ? 'Sale' : 'Purchase'} transaction completed - ${transaction.invoiceNumber}`,
        timestamp: new Date(transaction.date),
        read: Math.random() > 0.5,
        priority: 'low'
      });
    });

    // System notifications
    notificationList.push({
      id: 'system-1',
      type: 'system',
      title: 'System Update',
      message: 'MediStore Pro has been updated to version 1.2.0',
      timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
      read: true,
      priority: 'low'
    });

    // Sort by timestamp (newest first)
    notificationList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setNotifications(notificationList);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low-stock':
        return '⚠️';
      case 'expiry':
        return '📅';
      case 'transaction':
        return '💰';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-200';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200';
      case 'low':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div 
        className="absolute top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="secondary" className="w-fit">
              {notifications.filter(n => !n.read).length} unread
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 hover:bg-gray-50 cursor-pointer ${
                    notification.read ? 'opacity-60' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.timestamp.toISOString())}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
