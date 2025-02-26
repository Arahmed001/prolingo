'use client';

import './globals.css'
import type { Metadata } from 'next'
import { Poppins, Open_Sans } from "next/font/google"
import Footer from './components/Footer'
import Header from './components/Header'
import AccessibilityProvider from './components/AccessibilityProvider'
import { useEffect } from 'react'
import { isFirebaseInitialized } from '../lib/firebase'
import { addSampleQuizzes } from '../lib/scripts/sampleQuizzes'
import { addSampleThreads } from '../lib/scripts/sampleThreads'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize sample data when the app starts
  useEffect(() => {
    const initializeData = async () => {
      // Wait for Firebase to initialize
      if (isFirebaseInitialized()) {
        try {
          // Add sample quizzes if none exist
          await addSampleQuizzes()
          // Add sample threads if none exist
          await addSampleThreads()
        } catch (error) {
          console.error('Error initializing sample data:', error)
        }
      }
    }

    initializeData()
  }, [])

  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className={openSans.className}>
        <AccessibilityProvider />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
} 