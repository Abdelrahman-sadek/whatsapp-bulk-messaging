import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexProvider } from './ConvexProvider'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WhatsApp Bulk Messaging Platform',
  description: 'Compliant bulk messaging platform using WhatsApp Web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ConvexProvider>
      </body>
    </html>
  )
}