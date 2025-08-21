'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-64 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
