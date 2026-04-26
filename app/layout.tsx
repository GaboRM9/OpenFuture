import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import Script from 'next/script'
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
    <html lang="en" className={`${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {/* Set theme before first paint to avoid flash */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('openfuture_theme');if(t)document.documentElement.dataset.theme=t;})();` }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:text-xs focus:tracking-widest focus:uppercase"
          style={{ background: 'var(--bg)', color: 'var(--green-bright)', border: '1px solid var(--green)' }}
        >
          Skip to content
        </a>

        <div id="main-content" className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
