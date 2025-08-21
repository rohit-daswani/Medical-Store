

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';



export function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);

      // If not authenticated and not on login page, redirect to login
      if (!isLoggedIn && pathname !== '/login') {
        router.push('/login');
      }
      // If authenticated and on login page, redirect to dashboard
      else if (isLoggedIn && pathname === '/login') {
        router.push('/');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]/70">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login page, show login page regardless of auth status
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If not authenticated, don't render children (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
