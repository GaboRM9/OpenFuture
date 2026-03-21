'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ForecastChart = dynamic(() => import('./ForecastChart'), { ssr: false })

type Props = {
  topic: string
  horizon: string
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
  loading:   'SCANNING WEB...',
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

function getLoadingMessages(topic: string) {
  return [
    `SEARCHING: "${topic}" current state`,
    `SCANNING: recent news and expert analysis`,
    `RETRIEVING: historical data and trend lines`,
    `CROSS-REFERENCING: multiple intelligence sources`,
    `MODELING: probability distributions`,
    `SYNTHESIZING: forecast parameters`,
  ]
}

function extractBottomLine(content: string): string | null {
  const match = content.match(/##\s*Bottom Line\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return null
  return match[1].replace(/[*_#`▌▶█]/g, '').trim()
}

export default function ForecastStream({ topic, horizon, onReset }: Props) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState<ChartData>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [forecastId, setForecastId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadingMessages = getLoadingMessages(topic)

  // Cycle loading messages
  useEffect(() => {
    if (status !== 'loading') return
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length)
    }, 2000)
    return () => clearInterval(id)
  }, [status, loadingMessages.length])

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function runForecast() {
      try {
        const res = await fetch('/api/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, horizon }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)
        setStatus('streaming')

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let full = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          full += chunk
          setContent(full)
          bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
          .catch(() => {})
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    }

    async function runChart() {
      try {
        const res = await fetch('/api/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, horizon }),
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

    runForecast()
    runChart()

    return () => controller.abort()
  }, [topic, horizon])

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

      {/* Bottom Line card — shown when done */}
      {bottomLine && (
        <div
          className="border-l-2 px-5 py-4"
          style={{ borderColor: 'var(--green-dim)', background: 'var(--bg-panel)' }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: 'var(--green-muted)' }}
          >
            ▶ BOTTOM LINE
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--green)' }}>
            {bottomLine}
          </p>
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
              className="text-xs tracking-widest uppercase glow-sm"
              style={{ color: 'var(--green-bright)' }}
            >
              ORACLE
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
            >
              {status === 'loading' || status === 'streaming' ? (
                <span className="flex items-center gap-1">
                  <span className="cursor-blink">◈</span>
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
              className="border p-4"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              <p className="text-xs tracking-widest uppercase mb-1">✕ TRANSMISSION FAILED</p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {(status === 'streaming' || status === 'done') && (
            <div className="terminal-md text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              {status === 'streaming' && (
                <span
                  className="cursor-blink ml-0.5 inline-block"
                  style={{ color: 'var(--green-bright)' }}
                >
                  ▋
                </span>
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
