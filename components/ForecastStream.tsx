'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  topic: string
  horizon: string
  onReset: () => void
}

type Status = 'loading' | 'streaming' | 'done' | 'error'

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

export default function ForecastStream({ topic, horizon, onReset }: Props) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    async function run() {
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

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          setContent((prev) => prev + decoder.decode(value, { stream: true }))
          bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }

        setStatus('done')
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    }

    run()
    return () => controller.abort()
  }, [topic, horizon])

  return (
    <div className="w-full">
      {/* Terminal window chrome */}
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
            <span className="text-xs tracking-widest uppercase glow-sm" style={{ color: 'var(--green-bright)' }}>
              ORACLE
            </span>
            <span className="text-xs hidden sm:block truncate" style={{ color: 'var(--green-muted)' }}>
              QUERY:{' '}
              <span style={{ color: 'var(--green)' }}>{topic.toUpperCase()}</span>
              {' '}// HORIZON:{' '}
              <span style={{ color: 'var(--green)' }}>{horizon.toUpperCase()}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: STATUS_COLOR[status] }}
            >
              {status === 'loading' || status === 'streaming' ? (
                <span className="flex items-center gap-1">
                  <span className="cursor-blink">◈</span>
                  {STATUS_LABEL[status]}
                </span>
              ) : (
                STATUS_LABEL[status]
              )}
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

        {/* Output area */}
        <div className="p-6 min-h-64 max-h-[75vh] overflow-y-auto">

          {status === 'loading' && (
            <div className="space-y-2">
              <p className="text-xs tracking-widest" style={{ color: 'var(--amber)' }}>
                ◈ INITIALIZING ORACLE ENGINE...
              </p>
              <p className="text-xs tracking-widest" style={{ color: 'var(--green-muted)' }}>
                ◈ DISPATCHING WEB SCOUTS...
              </p>
              <div
                className="mt-4 h-px w-full overflow-hidden"
                style={{ background: 'var(--green-border)' }}
              >
                <div
                  className="scan-line h-px"
                  style={{ background: 'var(--green-dim)' }}
                />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div
              className="border p-4"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              <p className="text-xs tracking-widest uppercase mb-1">
                ✕ TRANSMISSION FAILED
              </p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {(status === 'streaming' || status === 'done') && (
            <div className="terminal-md text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              {status === 'streaming' && (
                <span className="cursor-blink ml-0.5 inline-block" style={{ color: 'var(--green-bright)' }}>
                  ▋
                </span>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer bar */}
        {status === 'done' && (
          <div
            className="flex items-center justify-between px-4 py-2 border-t text-xs tracking-widest"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
          >
            <span>◈ LOGGED TO HISTORY</span>
            <span style={{ color: 'var(--green-muted)' }}>
              {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
