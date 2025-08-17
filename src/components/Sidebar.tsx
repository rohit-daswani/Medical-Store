'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
      </svg>
    ),
    subItems: [
      {
        name: 'Analytics',
        href: '/analytics',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ]
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h7v7a2 2 0 01-2 2h-6" />
      </svg>
    ),
    subItems: [
      {
        name: 'Quick Sell',
        href: '/transactions/quick-sell',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      },
      {
        name: 'Purchase Stock',
        href: '/transactions/purchase',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      },
      {
        name: 'Transaction History',
        href: '/transactions/history',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      }
    ]
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
      </svg>
    )
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    name: 'Expiring Medicines',
    href: '/expiring',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    name: 'Tax Filing',
    href: '/tax-filing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
        <rect width="14" height="14" x="5" y="5" rx="2" ry="2" />
      </svg>
    )
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )
  }
];

function SidebarContent() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand based on current path
  useEffect(() => {
    const currentPath = pathname;
    const newExpanded: string[] = [];

    // Check if we're on dashboard or analytics
    if (currentPath === '/' || currentPath === '/analytics') {
      newExpanded.push('Dashboard');
    }
    
    // Check if we're on any transaction page
    if (currentPath.startsWith('/transactions')) {
      newExpanded.push('Transactions');
    }

    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      // If clicking on Analytics page, collapse Dashboard when other tabs are clicked
      if (pathname === '/analytics' && itemName !== 'Dashboard') {
        return prev.includes(itemName) 
          ? prev.filter(name => name !== itemName)
          : [itemName]; // Only expand the clicked item, collapse others
      }
      
      return prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName];
    });
  };

  const isItemActive = (item: any) => {
    if (item.href === '/' && pathname === '/') return true;
    if (item.href !== '/' && pathname.startsWith(item.href)) return true;
    return false;
  };

  const hasActiveSubItem = (item: any) => {
    return item.subItems && item.subItems.some((subItem: any) => pathname === subItem.href);
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'white' }}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b" style={{ borderColor: '#e4e7ec' }}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--brand-deep-blue)] to-[var(--brand-blue)] rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold" style={{ color: 'black' }}>MediStore Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = isItemActive(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.name);
          const hasActiveSubItemCheck = hasActiveSubItem(item);

          return (
            <div key={item.name}>
              {/* Main Navigation Item */}
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-1',
                    isActive || hasActiveSubItemCheck
                      ? 'text-[#465fff]' 
                      : 'text-black hover:text-black'
                  )}
                  style={{
                    backgroundColor: isActive || hasActiveSubItemCheck ? '#ecf3ff' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !hasActiveSubItemCheck) {
                      e.currentTarget.style.backgroundColor = '#f2f4f7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !hasActiveSubItemCheck) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span 
                    className="mr-3 text-lg" 
                    style={{ 
                      color: isActive || hasActiveSubItemCheck ? '#465fff' : 'black' 
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
                
                {/* Expand/Collapse Button for items with sub-items */}
                {hasSubItems && (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="p-1 rounded hover:bg-gray-100 ml-1"
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sub Items */}
              {hasSubItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems?.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isSubActive 
                            ? 'text-[#465fff] bg-[#ecf3ff]' 
                            : 'text-gray-600 hover:text-black hover:bg-[#f2f4f7]'
                        )}
                      >
                        <span className="mr-3">
                          {subItem.icon}
                        </span>
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: '#e4e7ec' }}>
        <div className="text-xs text-center" style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
          <p>MediStore Pro v1.0</p>
          <p className="mt-1">Medical Store Management</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
            >
              <span className="text-lg">☰</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64" style={{ backgroundColor: 'white' }}>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}
