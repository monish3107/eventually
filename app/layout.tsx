import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Footer from "@/components/shared/Footer"
import Header from "@/components/shared/Header"

import './globals.css'
const poppins = Poppins({ subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
 })

export const metadata: Metadata = {
  title: 'Eventually',
  description: 'An event management platform.',
  icons: {
    icon: '/assets/images/logo.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <ClerkProvider afterSignOutUrl="/">
          <div className="flex h-screen flex-col">
            <Header/>
            <main className="flex-1">{children}</main>
            <Footer/>
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
