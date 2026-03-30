'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ForecastChart = dynamic(() => import('./ForecastChart'), { ssr: false })

type Props = {
  topic: string
  horizon: string
  mode: 'light' | 'deep'
  onReset: () => void
}

type Status = 'loading' | 'streaming' | 'done' | 'error'

type ChartData = {
  metric: string
  unit: string
  description: string
  data: { label: string; value: number; projected: boolean }[]
} | null

const STATUS_LABEL: Record<Status, string> = {
  loading:   'SCANNING...',
  streaming: 'TRANSMITTING...',
  done:      'ANALYSIS COMPLETE',
  error:     'SIGNAL LOST',
}

const STATUS_COLOR: Record<Status, string> = {
  loading:   'var(--amber)',
  streaming: 'var(--green-bright)',
  done:      'var(--green-muted)',
  error:     'var(--red)',
}

function getLoadingMessages(topic: string, mode: 'light' | 'deep') {
  if (mode === 'light') {
    return [
      `SEARCHING: "${topic}" current state`,
      `SCANNING: recent developments`,
      `SYNTHESIZING: quick forecast`,
    ]
  }
  return [
    `SEARCHING: "${topic}" current state`,
    `RETRIEVING: historical base rates and reference class`,
    `SCANNING: expert forecasts and data signals`,
    `ANALYZING: contrarian and opposing views`,
    `MAPPING: wild card risks`,
    `RUNNING: pre-mortem analysis`,
    `SYNTHESIZING: deep forecast`,
  ]
}

function extractBottomLine(content: string): string | null {
  const match = content.match(/##\s*Bottom Line\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return null
  return match[1].replace(/[*_#`▌▶█]/g, '').trim()
}

function stripBottomLine(content: string): string {
  return content.replace(/\n?##\s*Bottom Line\s*\n[\s\S]*?(?=\n##|$)/, '')
}

export default function ForecastStream({ topic, horizon, mode, onReset }: Props) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState<ChartData>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [forecastId, setForecastId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [retryKey, setRetryKey] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadingMessages = getLoadingMessages(topic, mode)

  // Cycle loading messages
  useEffect(() => {
    if (status !== 'loading') return
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length)
    }, 2000)
    return () => clearInterval(id)
  }, [status, loadingMessages.length])

  useEffect(() => {
    // Reset state on each run (including retries)
    setContent('')
    setStatus('loading')
    setError('')
    setChartData(null)
    setChartLoading(true)
    setForecastId(null)

    const controller = new AbortController()
    abortRef.current = controller
    // Abort automatically after 6 minutes — server caps at 5 min, give 1 min buffer
    const timeoutId = setTimeout(() => controller.abort(), 6 * 60 * 1000)

    function scheduleScroll() {
      if (scrollTimerRef.current) return
      scrollTimerRef.current = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        scrollTimerRef.current = null
      }, 150)
    }

    async function runForecast(): Promise<string> {
      try {
        const res = await fetch('/api/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, horizon, mode }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)
        if (!res.body) throw new Error('No response body received')
        setStatus('streaming')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ''

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            full += chunk
            setContent(full)
            scheduleScroll()
          }
        } finally {
          reader.releaseLock()
        }

        setStatus('done')

        // Save and get ID
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, horizon, content: full }),
        })
          .then((r) => r.json())
          .then(({ id }) => { if (id) setForecastId(id) })
          .catch((err) => console.error('Failed to save forecast:', err))

        return full
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return ''
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
        return ''
      }
    }

    async function runChart(forecastContent: string) {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch('/api/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, horizon, forecastContent, today }),
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.metric && data?.data?.length) setChartData(data)
        }
      } catch {
        // non-critical
      } finally {
        setChartLoading(false)
      }
    }

    async function runAll() {
      const forecastContent = await runForecast()
      await runChart(forecastContent)
    }

    runAll()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [topic, horizon, retryKey])

  function handleShare() {
    if (!forecastId) return
    const url = `${window.location.origin}/forecast/${forecastId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const bottomLine = status === 'done' ? extractBottomLine(content) : null

  return (
    <div className="w-full space-y-4">

      {/* Chart */}
      {(chartLoading || chartData) && (
        <div>
          {chartLoading ? (
            <div
              className="border p-4 text-xs tracking-widest"
              style={{ borderColor: 'var(--green-border)', color: 'var(--amber)' }}
            >
              <span className="cursor-blink">◈</span> IDENTIFYING KEY METRIC...
            </div>
          ) : (
            chartData && <ForecastChart data={chartData} />
          )}
        </div>
      )}

      {/* Forecast terminal window */}
      <div
        className="border"
        style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: 'var(--green-border)', background: 'var(--bg)' }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: 'var(--green-muted)' }}
            >
              MODE
            </span>
            <span
              className="text-xs tracking-widest uppercase px-2 py-0.5 border"
              style={{
                borderColor: mode === 'deep' ? 'var(--green)' : 'var(--green-border)',
                color: mode === 'deep' ? 'var(--green-bright)' : 'var(--green-muted)',
                background: mode === 'deep' ? 'var(--green-faint)' : 'transparent',
              }}
            >
              {mode === 'deep' ? 'DEEP' : 'LIGHT'}
            </span>
            <span
              className="text-xs hidden sm:block truncate"
              style={{ color: 'var(--green-muted)' }}
            >
              QUERY: <span style={{ color: 'var(--green)' }}>{topic.toUpperCase()}</span>
              {' '}// HORIZON: <span style={{ color: 'var(--green)' }}>{horizon.toUpperCase()}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: STATUS_COLOR[status] }}
              role="status"
              aria-live="polite"
              aria-label={`Forecast status: ${STATUS_LABEL[status]}`}
            >
              {status === 'loading' || status === 'streaming' ? (
                <span className="flex items-center gap-1">
                  <span className="cursor-blink" aria-hidden="true">◈</span>
                  {STATUS_LABEL[status]}
                </span>
              ) : STATUS_LABEL[status]}
            </span>
            <button
              onClick={onReset}
              className="text-xs tracking-widest uppercase px-2 py-0.5 border transition-all hover:bg-[var(--green-faint)]"
              style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
            >
              [NEW]
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="p-6 min-h-64 max-h-[75vh] overflow-y-auto">

          {status === 'loading' && (
            <div className="space-y-3">
              <p
                className="text-xs tracking-widest transition-all"
                style={{ color: 'var(--amber)' }}
              >
                <span className="cursor-blink">◈</span>{' '}
                {loadingMessages[loadingMsgIdx]}
              </p>
              <div
                className="h-px w-full overflow-hidden"
                style={{ background: 'var(--green-border)' }}
              >
                <div className="scan-line h-px" style={{ background: 'var(--green-dim)' }} />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div
              className="border p-4 space-y-3"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              <p className="text-xs tracking-widest uppercase">✕ TRANSMISSION FAILED</p>
              <p className="text-xs">{error}</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="text-xs tracking-widest uppercase border px-3 py-1 transition-all hover:bg-[rgba(255,68,68,0.1)]"
                style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
              >
                [RETRY]
              </button>
            </div>
          )}

          {(status === 'streaming' || status === 'done') && (
            <div className="terminal-md text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
                    </div>
                  ),
                  tr: ({ children, ...props }) => {
                    // Color scenario rows based on content
                    const text = JSON.stringify(props).toLowerCase()
                    const bg = text.includes('optimistic') ? 'rgba(0,200,80,0.04)'
                             : text.includes('pessimistic') ? 'rgba(255,68,68,0.04)'
                             : 'transparent'
                    return <tr style={{ background: bg }}>{children}</tr>
                  },
                  strong: ({ children }) => {
                    const text = String(children)
                    if (/\d+%/.test(text)) {
                      return <strong style={{ color: 'var(--amber)' }}>{children}</strong>
                    }
                    return <strong>{children}</strong>
                  },
                  code: ({ children, className }) => {
                    // Inline code — highlight amber
                    if (!className) {
                      return (
                        <code style={{ color: 'var(--amber)', background: 'rgba(255,183,0,0.08)', padding: '0.1em 0.3em', fontSize: '0.9em' }}>
                          {children}
                        </code>
                      )
                    }
                    return <code className={className}>{children}</code>
                  },
                  blockquote: ({ children }) => (
                    <blockquote style={{ borderLeft: '2px solid var(--amber)', paddingLeft: '1em', color: 'var(--green-muted)', margin: '0.75em 0', opacity: 0.85 }}>
                      {children}
                    </blockquote>
                  ),
                }}
              >{status === 'done' ? stripBottomLine(content) : content}</ReactMarkdown>
              {status === 'streaming' && (
                <span
                  className="cursor-blink ml-0.5 inline-block"
                  style={{ color: 'var(--green-bright)' }}
                >
                  ▋
                </span>
              )}
              {status === 'done' && bottomLine && (
                <div
                  className="border-l-2 px-5 py-4 mt-6"
                  style={{ borderColor: 'var(--green-dim)', background: 'var(--bg)' }}
                >
                  <p
                    className="text-xs tracking-widest uppercase mb-2"
                    style={{ color: 'var(--green-muted)' }}
                  >
                    ▶ CONCLUSION
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--green)' }}>
                    {bottomLine}
                  </p>
                </div>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        {status === 'done' && (
          <div
            className="flex items-center justify-between px-4 py-2 border-t text-xs tracking-widest"
            style={{ borderColor: 'var(--green-border)' }}
          >
            <span style={{ color: 'var(--green-faint)' }}>
              ◈ LOGGED TO HISTORY
            </span>
            <div className="flex items-center gap-2">
              {forecastId && (
                <button
                  onClick={handleShare}
                  className="px-3 py-1 border text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                  style={{
                    borderColor: copied ? 'var(--green-dim)' : 'var(--green-border)',
                    color: copied ? 'var(--green-bright)' : 'var(--green-muted)',
                  }}
                >
                  {copied ? '✓ COPIED' : '[SHARE]'}
                </button>
              )}
              <span style={{ color: 'var(--green-muted)' }}>
                {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
