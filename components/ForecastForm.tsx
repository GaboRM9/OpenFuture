'use client'

import { useState, useEffect, useRef } from 'react'

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

const MOBILE_PLACEHOLDERS = [
  'will remote work last?',
  'housing prices?',
  'when does AGI arrive?',
  'will cash disappear?',
  'humanoid robots at work?',
  'future of college?',
  'EVs vs gas cars?',
  'lab-grown meat?',
  'AI vs white-collar jobs?',
  '4-day work week?',
  'cable TV vs streaming?',
  'commercial space travel?',
  'living to 150?',
  'Gen Z & social media?',
  'nuclear fusion soon?',
  'gig economy in 5y?',
]

function parseHorizonFromTopic(topic: string): string {
  const t = topic.toLowerCase()

  // "next/in/over X days/weeks/months/years"
  const m1 = t.match(/(?:next|in\s+(?:the\s+)?next|over\s+(?:the\s+)?next|in|over)\s+(\d+(?:\.\d+)?)\s+(day|week|month|year|decade)s?/)
  if (m1) {
    const n = m1[1], u = m1[2]
    return `${n} ${u}${parseFloat(n) !== 1 ? 's' : ''}`
  }

  // "by YYYY"
  const m2 = t.match(/\bby\s+(20\d\d)\b/)
  if (m2) {
    const diff = parseInt(m2[1]) - new Date().getFullYear()
    if (diff > 0 && diff <= 50) return `${diff} year${diff !== 1 ? 's' : ''}`
  }

  // "decade"
  if (/\bdecade\b/.test(t)) return '10 years'

  // standalone "X years/months/weeks/days"
  const m3 = t.match(/\b(\d+(?:\.\d+)?)\s+(day|week|month|year)s?\b/)
  if (m3) {
    const n = m3[1], u = m3[2]
    return `${n} ${u}${parseFloat(n) !== 1 ? 's' : ''}`
  }

  return '1 year'
}

type Mode = 'light' | 'deep'

type Props = {
  onSubmit: (topic: string, horizon: string, mode: Mode) => void
  loading: boolean
}

export default function ForecastForm({ onSubmit, loading }: Props) {
  const [topic, setTopic] = useState('')
  const [mode, setMode] = useState<Mode>('light')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const modeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeMenuOpen(false)
      }
    }
    if (modeMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [modeMenuOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    onSubmit(topic.trim(), parseHorizonFromTopic(topic.trim()), mode)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-label="Forecast query form">
      <div className="space-y-3 sm:space-y-4">

        <p className="text-[clamp(10px,3.4vw,14px)] sm:text-sm tracking-tight sm:tracking-wider whitespace-nowrap" style={{ color: 'var(--green-muted)' }}>
          INPUT QUERY · SELECT HORIZON · RECEIVE ANALYSIS
        </p>

        {/* Topic + mode + submit — single row */}
        <div
          className="flex items-stretch border"
          style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
        >
          <span
            className="flex items-center px-2 sm:px-3 text-sm select-none glow-sm shrink-0"
            style={{ color: 'var(--green-muted)' }}
          >
            &gt;_
          </span>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={(isMobile ? MOBILE_PLACEHOLDERS : PLACEHOLDERS)[placeholderIdx]}
            className="flex-1 bg-transparent py-4 sm:py-6 text-sm outline-none placeholder:text-[var(--green-muted)] min-w-0"
            style={{ color: 'var(--green)', caretColor: 'var(--green-bright)' }}
            disabled={loading}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Forecast topic"
            aria-required="true"
          />

          {/* Mode dropdown */}
          <div
            className="flex items-center shrink-0 border-l"
            style={{ borderColor: 'var(--green-border)' }}
            ref={modeMenuRef}
          >
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setModeMenuOpen((o) => !o)}
                disabled={loading}
                className="flex items-center justify-center px-2.5 sm:px-5 py-4 sm:py-6 text-[10px] sm:text-xs tracking-widest uppercase cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 min-w-0 sm:min-w-[80px]"
                style={{ color: 'var(--green-muted)' }}
                aria-label="Forecast mode"
              >
                {mode.toUpperCase()}
                <span className="ml-1 text-xs" style={{ color: 'var(--green-muted)' }}>▾</span>
              </button>

              {modeMenuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 z-40 min-w-[150px] border py-1"
                  style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
                >
                  {(['light', 'deep'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMode(m); setModeMenuOpen(false) }}
                      className="flex w-full items-center px-4 py-2 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                      style={{ color: mode === m ? 'var(--green-bright)' : 'var(--green-muted)' }}
                    >
                      {mode === m && <span className="mr-2">▶</span>}
                      {m.toUpperCase()}
                    </button>
                  ))}
                  <div className="my-1 border-t" style={{ borderColor: 'var(--green-border)' }} />
                  {[['TAROT', '🔮'], ['STOCK', '📈']].map(([label, icon]) => (
                    <div
                      key={label}
                      className="flex w-full items-center justify-between px-4 py-2 text-xs tracking-widest uppercase cursor-not-allowed opacity-35"
                      style={{ color: 'var(--green-muted)' }}
                    >
                      <span>{icon} {label}</span>
                      <span className="text-[10px] ml-3" style={{ color: 'var(--amber)' }}>SOON</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="flex items-center gap-2 px-3 sm:px-5 text-xs tracking-widest uppercase font-bold border-l transition-all shrink-0 bg-[var(--green-faint)] text-[var(--green-bright)] enabled:hover:bg-[var(--green)] enabled:hover:text-[var(--bg)] disabled:bg-transparent disabled:cursor-not-allowed disabled:opacity-30"
            style={{ borderColor: 'var(--green-border)' }}
          >
            {loading ? (
              <span className="cursor-blink">▋</span>
            ) : (
              <>
                <span>▶</span>
                <span className="hidden sm:inline">[RUN]</span>
              </>
            )}
          </button>
        </div>

        {/* Mode hint */}
        <p className="text-xs" style={{ color: 'var(--green-muted)' }}>
          {mode === 'light'
            ? 'LIGHT — 3 searches · concise · fast'
            : 'DEEP — 6-7 searches · base rates · pre-mortem · full analysis'}
        </p>

      </div>
    </form>
  )
}
