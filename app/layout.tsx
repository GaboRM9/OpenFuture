import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'OpenFuture — AI Probabilistic Forecasting',
  description: 'AI-powered probabilistic forecasting using live web research and real-money prediction market data. Ask any question, get a calibrated probability.',
  keywords: ['forecasting', 'AI forecast', 'prediction market', 'probabilistic forecasting', 'future predictions', 'Metaculus', 'Polymarket'],
  openGraph: {
    title: 'OpenFuture — AI Probabilistic Forecasting',
    description: 'AI-powered probabilistic forecasting using live web research and real-money prediction market data.',
    type: 'website',
    siteName: 'OpenFuture',
  },
  twitter: {
    card: 'summary',
    title: 'OpenFuture — AI Probabilistic Forecasting',
    description: 'AI-powered probabilistic forecasting using live web research and real-money prediction market data.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:text-xs focus:tracking-widest focus:uppercase"
          style={{ background: 'var(--bg)', color: 'var(--green-bright)', border: '1px solid var(--green)' }}
        >
          Skip to content
        </a>
        <nav
          className="sticky top-0 z-10 border-b"
          style={{ borderColor: 'var(--green-border)', background: 'var(--bg)' }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="text-xs glow-sm"
                style={{ color: 'var(--green-muted)' }}
              >
                ◈
              </span>
              <span
                className="text-sm font-bold tracking-widest uppercase glow"
                style={{ color: 'var(--green-bright)' }}
              >
                OPENFUTURE
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--green-faint)' }}
              >
                v0.1.1
              </span>
            </Link>

            <Link
              href="/predictions"
              className="flex items-center gap-2 text-xs tracking-wider transition-all hover:opacity-80"
              style={{ color: 'var(--green-muted)' }}
              title="Prediction Tracker"
            >
              <Clock size={14} />
              <span className="hidden sm:inline">TRACKER</span>
            </Link>
          </div>
        </nav>

        <div id="main-content" className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
