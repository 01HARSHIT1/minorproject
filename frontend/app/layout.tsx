import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreHydration from '@/components/StoreHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Student Portal Gateway',
  description: 'Universal AI Student Gateway - Monitor and manage your college portals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
