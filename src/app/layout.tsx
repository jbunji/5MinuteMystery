import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '5 Minute Mystery - Solve a New Case Every Day',
  description: 'AI-powered mystery game where you solve procedurally generated cases in just 5 minutes. Perfect for your coffee break.',
  keywords: ['mystery game', 'detective game', 'puzzle game', 'AI game', 'procedural generation'],
  authors: [{ name: '5 Minute Mystery' }],
  openGraph: {
    title: '5 Minute Mystery',
    description: 'Solve a new mystery every coffee break',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '5 Minute Mystery',
    description: 'Solve a new mystery every coffee break',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0d0d0d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} min-h-screen bg-noir-950 antialiased`}>
        <Providers>
          <div className="mystery-container min-h-screen relative">
            <div className="fog-overlay" />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}