'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/transactions/quick-sell');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--foreground)]/70">Redirecting...</p>
      </div>
    </div>
  );
}
