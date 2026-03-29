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

            <span className="flex items-center gap-2 text-xs tracking-wider" style={{ color: 'var(--green-muted)' }}>
              <span className="h-2 w-2 rounded-full" style={{ background: 'var(--green-bright)', boxShadow: '0 0 5px 1px var(--green-bright)' }} />
              SYS:ONLINE
            </span>
          </div>
        </nav>

        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
