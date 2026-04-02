import { supabase, type PredictionRun, type PredictionRunStatus } from '@/lib/supabase'
import Link from 'next/link'
import ResolveButtons from '@/components/ResolveButtons'
import DeletePredictionRun from '@/components/DeletePredictionRun'

export const dynamic = 'force-dynamic'

const STATUS_FILTER = ['all', 'pending', 'correct', 'incorrect', 'partial'] as const
type Filter = typeof STATUS_FILTER[number]

const STATUS_COLORS: Record<PredictionRunStatus, string> = {
  pending:   'var(--green-faint)',
  correct:   'var(--green-bright)',
  incorrect: 'var(--red, #e05252)',
  partial:   'var(--amber, #d4a017)',
}

const PAGE_SIZE = 20

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { filter: filterParam, page: pageParam } = await searchParams
  const filter: Filter = STATUS_FILTER.includes(filterParam as Filter)
    ? (filterParam as Filter)
    : 'pending'
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('prediction_runs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filter !== 'all') query = query.eq('status', filter)

  const { data: runs, error, count } = await query

  // Calibration stats across all resolved runs
  const { data: stats } = await supabase
    .from('prediction_runs')
    .select('status')
    .neq('status', 'pending')

  const resolved = stats ?? []
  const correct = resolved.filter(r => r.status === 'correct').length
  const partial = resolved.filter(r => r.status === 'partial').length
  const incorrect = resolved.filter(r => r.status === 'incorrect').length
  const total = resolved.length
  const score = total > 0
    ? Math.round(((correct + partial * 0.5) / total) * 100)
    : null

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
          ── ORACLE ENGINE // PREDICTION TRACKER ──
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase glow" style={{ color: 'var(--green-bright)' }}>
              PREDICTION TRACKER
            </h1>
            {count != null && (
              <p className="mt-1 text-xs tracking-widest" style={{ color: 'var(--green-faint)' }}>
                {count} {filter === 'all' ? 'TOTAL' : filter.toUpperCase()} · PAGE {page} OF {totalPages || 1}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs tracking-widest uppercase border transition-all hover:bg-[var(--green-faint)]"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
          >
            [HOME]
          </Link>
        </div>

        {/* Calibration score */}
        {total > 0 && (
          <div
            className="mt-4 flex items-center gap-6 border p-3 text-xs tracking-widest"
            style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
          >
            <span style={{ color: 'var(--green-muted)' }}>CALIBRATION</span>
            <span className="text-base font-bold" style={{ color: 'var(--green-bright)' }}>{score}%</span>
            <span style={{ color: 'var(--green-faint)' }}>
              {correct}✓ · {partial}~ · {incorrect}✕ · {total} RESOLVED
            </span>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mt-4 flex items-center gap-1 flex-wrap">
          {STATUS_FILTER.map(f => (
            <Link
              key={f}
              href={`/predictions?filter=${f}`}
              className="text-xs tracking-widest border px-3 py-1 uppercase transition-all hover:bg-[var(--green-faint)]"
              style={{
                borderColor: filter === f ? 'var(--green)' : 'var(--green-border)',
                color: filter === f ? 'var(--green)' : 'var(--green-faint)',
              }}
            >
              {f}
            </Link>
          ))}
        </div>

        <div className="mt-4 border-t" style={{ borderColor: 'var(--green-border)' }} />
      </div>

      {/* Error */}
      {error && (
        <div className="border p-4 text-xs tracking-widest" style={{ borderColor: 'var(--red, #e05252)', color: 'var(--red, #e05252)' }}>
          ✕ DATABASE ERROR: {error.message.toUpperCase()}
        </div>
      )}

      {/* Empty */}
      {!error && (!runs || runs.length === 0) && (
        <div className="border p-12 text-center" style={{ borderColor: 'var(--green-border)' }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--green-muted)' }}>
            {filter === 'pending' ? 'NO PENDING PREDICTIONS' : 'NO RECORDS'}
          </p>
          <Link
            href="/"
            className="text-xs tracking-widest uppercase border px-4 py-2 transition-all hover:bg-[var(--green-faint)]"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
          >
            [RUN A FORECAST]
          </Link>
        </div>
      )}

      {/* Run list */}
      {runs && runs.length > 0 && (
        <div className="space-y-px">
          {runs.map((run: PredictionRun, i: number) => {
            const index = String(from + i + 1).padStart(3, '0')
            const date = new Date(run.created_at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

            return (
              <div key={run.id} className="log-entry p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold shrink-0 mt-0.5" style={{ color: 'var(--green-faint)' }}>
                    [{index}]
                  </span>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Topic + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--green)' }}>
                        {run.topic}
                      </span>
                      <span
                        className="text-xs tracking-widest uppercase border px-1.5 py-0.5 shrink-0"
                        style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
                      >
                        {run.horizon.toUpperCase()}
                      </span>
                      <span
                        className="text-xs tracking-widest uppercase border px-1.5 py-0.5 shrink-0"
                        style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
                      >
                        {run.mode.toUpperCase()}
                      </span>
                      <span
                        className="text-xs ml-auto shrink-0"
                        style={{ color: STATUS_COLORS[run.status] }}
                      >
                        ● {run.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Extracted predictions preview */}
                    {run.predictions.length > 0 && (
                      <div className="space-y-1">
                        {run.predictions.slice(0, 3).map((p, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs" style={{ color: 'var(--green-muted)' }}>
                            <span style={{ color: 'var(--green-faint)' }}>·</span>
                            <span className="flex-1">{p.prediction_text}</span>
                            {p.confidence != null && (
                              <span className="shrink-0" style={{ color: 'var(--amber, #d4a017)' }}>
                                {p.confidence}%
                              </span>
                            )}
                          </div>
                        ))}
                        {run.predictions.length > 3 && (
                          <p className="text-xs" style={{ color: 'var(--green-faint)' }}>
                            +{run.predictions.length - 3} more
                          </p>
                        )}
                      </div>
                    )}

                    {/* Date + actions */}
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      <span className="text-xs" style={{ color: 'var(--green-faint)' }}>{date}</span>
                      <Link
                        href={`/forecast/${run.forecast_id}`}
                        className="text-xs tracking-widest border px-2 py-0.5 uppercase transition-all hover:bg-[var(--green-faint)]"
                        style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
                      >
                        [REVIEW]
                      </Link>
                      <ResolveButtons id={run.id} current={run.status} />
                      <DeletePredictionRun id={run.id} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between text-xs tracking-widest">
          {page > 1 ? (
            <Link
              href={`/predictions?filter=${filter}&page=${page - 1}`}
              className="border px-4 py-2 uppercase transition-all hover:bg-[var(--green-faint)]"
              style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
            >
              [← PREV]
            </Link>
          ) : <span />}
          <span style={{ color: 'var(--green-faint)' }}>{page} / {totalPages}</span>
          {page < totalPages ? (
            <Link
              href={`/predictions?filter=${filter}&page=${page + 1}`}
              className="border px-4 py-2 uppercase transition-all hover:bg-[var(--green-faint)]"
              style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
            >
              [NEXT →]
            </Link>
          ) : <span />}
        </div>
      )}
    </main>
  )
}
