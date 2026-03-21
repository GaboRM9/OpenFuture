'use client'

import { useState, useEffect } from 'react'

const PLACEHOLDERS = [
  'will remote work survive the next 2 years?',
  'housing prices in major cities',
  'AGI — when does it arrive?',
  'will cash disappear in the next decade?',
  'humanoid robots in the workforce',
  'the future of college degrees',
  'electric vehicles replacing gas cars',
  'lab-grown meat going mainstream',
  'AI replacing white-collar jobs',
  'the 4-day work week becoming standard',
  'streaming services and the death of cable',
  'SpaceX and commercial space travel',
  'longevity drugs and living to 150',
  'social media and Gen Z mental health',
  'nuclear fusion going commercial',
  'the gig economy in 5 years',
]

const HORIZONS = [
  { label: '1W',  value: '1 week' },
  { label: '1M',  value: '1 month' },
  { label: '3M',  value: '3 months' },
  { label: '6M',  value: '6 months' },
  { label: '1Y',  value: '1 year' },
  { label: '2Y',  value: '2 years' },
]

type Props = {
  onSubmit: (topic: string, horizon: string) => void
  loading: boolean
}

export default function ForecastForm({ onSubmit, loading }: Props) {
  const [topic, setTopic] = useState('')
  const [horizon, setHorizon] = useState('3 months')
  const [custom, setCustom] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  const isCustom = horizon === '__custom__'
  const activeHorizon = isCustom ? custom.trim() : horizon

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim() || !activeHorizon) return
    onSubmit(topic.trim(), activeHorizon)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Topic input */}
      <div>
        <label
          htmlFor="topic"
          className="block text-xs tracking-widest uppercase mb-2"
          style={{ color: 'var(--green-muted)' }}
        >
          ── QUERY SUBJECT
        </label>
        <div
          className="flex items-center border"
          style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
        >
          <span
            className="px-3 text-sm select-none glow-sm"
            style={{ color: 'var(--green-muted)' }}
          >
            &gt;_
          </span>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            className="flex-1 bg-transparent py-3 pr-4 text-sm outline-none placeholder:opacity-30"
            style={{ color: 'var(--green)', caretColor: 'var(--green-bright)' }}
            disabled={loading}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Horizon */}
      <div>
        <label
          className="block text-xs tracking-widest uppercase mb-2"
          style={{ color: 'var(--green-muted)' }}
        >
          ── TIME HORIZON
        </label>
        <div className="flex flex-wrap gap-2">
          {HORIZONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setHorizon(value)}
              disabled={loading}
              className="px-4 py-1.5 text-xs tracking-widest uppercase border transition-all"
              style={
                horizon === value
                  ? {
                      background: 'var(--green-faint)',
                      borderColor: 'var(--green)',
                      color: 'var(--green-bright)',
                    }
                  : {
                      background: 'transparent',
                      borderColor: 'var(--green-border)',
                      color: 'var(--green-muted)',
                    }
              }
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setHorizon('__custom__')}
            disabled={loading}
            className="px-4 py-1.5 text-xs tracking-widest uppercase border transition-all"
            style={
              isCustom
                ? {
                    background: 'var(--green-faint)',
                    borderColor: 'var(--green)',
                    color: 'var(--green-bright)',
                  }
                : {
                    background: 'transparent',
                    borderColor: 'var(--green-border)',
                    color: 'var(--green-muted)',
                  }
            }
          >
            CUSTOM
          </button>
        </div>

        {isCustom && (
          <div
            className="flex items-center border mt-2"
            style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
          >
            <span className="px-3 text-sm select-none" style={{ color: 'var(--green-muted)' }}>
              &gt;_
            </span>
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. 5 years, 10 years, 18 months..."
              className="flex-1 bg-transparent py-2 pr-4 text-sm outline-none placeholder:opacity-30"
              style={{ color: 'var(--green)', caretColor: 'var(--green-bright)' }}
              disabled={loading}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <p className="mt-2 text-xs" style={{ color: 'var(--green-faint)' }}>
          SELECTED: {activeHorizon ? activeHorizon.toUpperCase() : '—'}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !topic.trim() || !activeHorizon}
        className="w-full py-3 text-sm tracking-widest uppercase font-bold border transition-all disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          background: topic.trim() && !loading ? 'var(--green-faint)' : 'transparent',
          borderColor: 'var(--green-muted)',
          color: 'var(--green-bright)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="cursor-blink">▋</span>
            INITIALIZING...
          </span>
        ) : (
          '▶ EXECUTE ANALYSIS'
        )}
      </button>

    </form>
  )
}
