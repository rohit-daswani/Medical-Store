import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthWrapper } from '@/components/AuthWrapper'
import { LayoutContent } from '@/components/LayoutContent'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MediStore Pro - Medical Store Management System',
  description: 'Complete medical store management solution with inventory, transactions, and compliance features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151',
            },
          }}
        />
      </body>
    </html>
  )
}
