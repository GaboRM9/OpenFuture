import { supabase, type Forecast } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const { data: forecasts, error } = await supabase
    .from('forecasts')
    .select('id, topic, horizon, content, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
          ── ORACLE ENGINE // QUERY LOG ──
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-xl font-bold tracking-widest uppercase glow"
              style={{ color: 'var(--green-bright)' }}
            >
              FORECAST HISTORY
            </h1>
            {forecasts && (
              <p className="mt-1 text-xs tracking-widest" style={{ color: 'var(--green-faint)' }}>
                {forecasts.length} ENTRIES FOUND
              </p>
            )}
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs tracking-widest uppercase border transition-all hover:bg-[var(--green-faint)]"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
          >
            [NEW QUERY]
          </Link>
        </div>
        <div
          className="mt-4 border-t"
          style={{ borderColor: 'var(--green-border)' }}
        />
      </div>

      {/* Error state */}
      {error && (
        <div
          className="border p-4 text-xs tracking-widest"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
        >
          ✕ DATABASE ERROR: {error.message.toUpperCase()}
        </div>
      )}

      {/* Empty state */}
      {!error && (!forecasts || forecasts.length === 0) && (
        <div
          className="border p-12 text-center"
          style={{ borderColor: 'var(--green-border)' }}
        >
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--green-muted)' }}>
            NO RECORDS IN SYSTEM
          </p>
          <Link
            href="/"
            className="text-xs tracking-widest uppercase border px-4 py-2 transition-all hover:bg-[var(--green-faint)]"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
          >
            [INITIALIZE FIRST QUERY]
          </Link>
        </div>
      )}

      {/* Log entries */}
      {forecasts && forecasts.length > 0 && (
        <div className="space-y-px">
          {forecasts.map((forecast: Forecast, i: number) => {
            const preview = forecast.content
              .split('\n')
              .find((l) => l.trim() && !l.startsWith('#'))
            const date = new Date(forecast.created_at)
            const dateStr = date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
            const index = String(i + 1).padStart(3, '0')

            return (
              <div
                key={forecast.id}
                className="log-entry p-4"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-bold shrink-0 mt-0.5"
                    style={{ color: 'var(--green-faint)' }}
                  >
                    [{index}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{ color: 'var(--green)' }}
                      >
                        {forecast.topic}
                      </span>
                      <span
                        className="text-xs tracking-widest uppercase border px-2 py-0.5 shrink-0"
                        style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
                      >
                        {forecast.horizon.toUpperCase()}
                      </span>
                    </div>
                    {preview && (
                      <p
                        className="mt-1 text-xs line-clamp-2 leading-relaxed"
                        style={{ color: 'var(--green-muted)' }}
                      >
                        {preview.replace(/[*_#`▌▶█]/g, '').trim()}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs shrink-0 hidden sm:block"
                    style={{ color: 'var(--green-faint)' }}
                  >
                    {dateStr}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
