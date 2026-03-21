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

export default function ForecastStream({ topic, horizon, onReset }: Props) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

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

        if (!res.ok) {
          throw new Error(`API error ${res.status}`)
        }

        setStatus('streaming')

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          setContent((prev) => prev + decoder.decode(value, { stream: true }))
        }

        setStatus('done')
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    }

    run()

    return () => {
      controller.abort()
    }
  }, [topic, horizon])

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-semibold text-zinc-100">{topic}</span>
          <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
            {horizon}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          New forecast
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        {status === 'loading' && (
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
            <span className="text-sm">Researching and analyzing...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
            <p className="font-medium">Error generating forecast</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {(status === 'streaming' || status === 'done') && (
          <div className="prose prose-invert prose-emerald max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-200 prose-code:text-emerald-400 prose-table:text-zinc-300 prose-th:text-zinc-200 prose-td:text-zinc-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {status === 'streaming' && (
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            )}
          </div>
        )}

        {status === 'done' && (
          <p className="mt-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
            Forecast saved to history
          </p>
        )}
      </div>
    </div>
  )
}
