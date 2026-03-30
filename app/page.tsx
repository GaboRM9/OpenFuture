'use client'

import { useState } from 'react'
import ForecastForm from '@/components/ForecastForm'
import ForecastStream from '@/components/ForecastStream'

type ForecastState = { topic: string; horizon: string; mode: 'light' | 'deep' } | null

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="How to use OpenFuture"
    >
      <div
        className="w-full max-w-lg border p-6 space-y-5"
        style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest uppercase glow-sm" style={{ color: 'var(--green-bright)' }}>
            HOW TO USE OPENFUTURE
          </span>
          <button
            onClick={onClose}
            className="text-xs tracking-widest px-2 py-0.5 border transition-all hover:bg-[var(--green-faint)]"
            style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
          >
            [CLOSE]
          </button>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--green-border)' }} />

        {/* Steps */}
        <div className="space-y-4 text-xs leading-relaxed" style={{ color: 'var(--green-muted)' }}>
          <div className="flex gap-3">
            <span style={{ color: 'var(--green-bright)' }}>01</span>
            <div>
              <p style={{ color: 'var(--green)' }}>ENTER A TOPIC</p>
              <p className="mt-0.5">Type any question or topic you want a probabilistic forecast on — markets, technology, geopolitics, science, anything.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span style={{ color: 'var(--green-bright)' }}>02</span>
            <div>
              <p style={{ color: 'var(--green)' }}>SET A TIME HORIZON</p>
              <p className="mt-0.5">Choose how far ahead to forecast — from 1 week to several years. The engine adapts its reasoning strategy to the horizon.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span style={{ color: 'var(--green-bright)' }}>03</span>
            <div>
              <p style={{ color: 'var(--green)' }}>CHOOSE A MODE</p>
              <p className="mt-0.5">
                <span style={{ color: 'var(--green)' }}>LIGHT</span> — fast, 3 searches, concise predictions with confidence %.<br />
                <span style={{ color: 'var(--green)' }}>DEEP</span> — rigorous, 10+ searches, base rate analysis, scenario table, wild cards, and pre-mortem. Uses real-money prediction market data as priors.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span style={{ color: 'var(--green-bright)' }}>04</span>
            <div>
              <p style={{ color: 'var(--green)' }}>READ THE FORECAST</p>
              <p className="mt-0.5">All predictions include explicit probabilities. A metric chart is generated after the forecast. You can share results via the [SHARE] button.</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-3 text-xs" style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}>
          OPENFUTURE uses live web search + crowd prediction market data to ground every forecast in current evidence.
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [forecast, setForecast] = useState<ForecastState>(null)
  const [loading, setLoading] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  function handleSubmit(topic: string, horizon: string, mode: 'light' | 'deep') {
    setLoading(true)
    setForecast({ topic, horizon, mode })
  }

  function handleReset() {
    setForecast(null)
    setLoading(false)
  }

  return (
    <main className="flex min-h-[calc(100vh-49px)] flex-col items-center px-4 py-12">
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

      {!forecast && (
        <div className="flex w-full max-w-2xl flex-col gap-10">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between">
              <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
                ── ORACLE ENGINE // PREDICTIVE ANALYSIS SYSTEM ──
              </p>
              <button
                onClick={() => setHelpOpen(true)}
                className="text-xs tracking-widest border px-2 py-0.5 transition-all hover:bg-[var(--green-faint)] shrink-0 ml-4"
                style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
              >
                [?]
              </button>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-widest uppercase glow leading-tight"
              style={{ color: 'var(--green-bright)' }}
            >
              OPEN
              <span className="cursor-blink" style={{ color: 'var(--green-muted)' }}>_</span>
              FUTURE
            </h1>
            <p className="mt-3 text-sm tracking-wide" style={{ color: 'var(--green-muted)' }}>
              REAL-TIME INTELLIGENCE → PROBABILISTIC FORECASTING
            </p>
            <div
              className="mt-4 border-t pt-4 text-xs tracking-wider"
              style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
            >
              INPUT QUERY · SELECT HORIZON · RECEIVE ANALYSIS
            </div>
          </div>

          <ForecastForm onSubmit={handleSubmit} loading={loading} />
        </div>
      )}

      {forecast && (
        <div className="w-full max-w-4xl">
          <ForecastStream
            topic={forecast.topic}
            horizon={forecast.horizon}
            mode={forecast.mode}
            onReset={handleReset}
          />
        </div>
      )}
    </main>
  )
}
