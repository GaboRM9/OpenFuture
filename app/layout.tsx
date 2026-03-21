import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'OpenFuture — AI Forecast Analysis',
  description: 'AI-powered probabilistic forecasting using live web research',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950">
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-lg font-bold text-zinc-100 hover:text-emerald-400 transition-colors"
            >
              Open<span className="text-emerald-400">Future</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Forecast
              </Link>
              <Link
                href="/history"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
