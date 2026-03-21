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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Forecast History</h1>
        <Link
          href="/"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          New Forecast
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
          Failed to load history: {error.message}
        </div>
      )}

      {!error && (!forecasts || forecasts.length === 0) && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">No forecasts yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            Generate your first forecast
          </Link>
        </div>
      )}

      {forecasts && forecasts.length > 0 && (
        <div className="space-y-4">
          {forecasts.map((forecast: Forecast) => {
            const preview = forecast.content
              .split('\n')
              .find((l) => l.trim() && !l.startsWith('#'))
            const date = new Date(forecast.created_at).toLocaleDateString(
              undefined,
              { year: 'numeric', month: 'short', day: 'numeric' },
            )

            return (
              <div
                key={forecast.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold text-zinc-100">
                        {forecast.topic}
                      </h2>
                      <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                        {forecast.horizon}
                      </span>
                    </div>
                    {preview && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">
                        {preview.replace(/[*_#`]/g, '')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">{date}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
