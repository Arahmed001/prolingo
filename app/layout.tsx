import './globals.css'
import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import Footer from './components/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ProLingo',
  description: 'AI-powered language learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
} 