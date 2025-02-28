import './globals.css'
import type { Metadata } from 'next'
import { Poppins, Open_Sans } from "next/font/google"
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import AccessibilityProvider from './components/AccessibilityProvider'
import DataInitializer from './components/DataInitializer'
import I18nProvider from './components/I18nProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ProLingo',
  description: 'AI-powered language learning platform',
}

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className={`${openSans.className} min-h-screen`}>
        <AccessibilityProvider />
        <DataInitializer />
        <I18nProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}

export default RootLayout; 