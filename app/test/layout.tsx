import React from 'react'

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="test-section">
      {children}
    </section>
  )
} 