import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'OPENFUTURE // ORACLE ENGINE',
  description: 'AI-powered probabilistic forecasting using live web research',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
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
                v1.0
              </span>
            </Link>

            <div className="flex items-center gap-1" style={{ color: 'var(--green-muted)' }}>
              <span className="text-xs mr-3 hidden sm:block tracking-wider">
                SYS:ONLINE
              </span>
              <Link
                href="/"
                className="px-3 py-1 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)] border"
                style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
              >
                [FORECAST]
              </Link>
              <Link
                href="/history"
                className="px-3 py-1 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)] border"
                style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
              >
                [HISTORY]
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
