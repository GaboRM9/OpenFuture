'use client'

import { useState } from 'react'
import ForecastForm from '@/components/ForecastForm'
import ForecastStream from '@/components/ForecastStream'

type ForecastState = { topic: string; horizon: string } | null

export default function Home() {
  const [forecast, setForecast] = useState<ForecastState>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(topic: string, horizon: string) {
    setLoading(true)
    setForecast({ topic, horizon })
  }

  function handleReset() {
    setForecast(null)
    setLoading(false)
  }

  return (
    <main className="flex min-h-[calc(100vh-49px)] flex-col items-center px-4 py-12">
      {!forecast && (
        <div className="flex w-full max-w-2xl flex-col gap-10">
          {/* Header */}
          <div>
            <p className="text-xs tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
              ── ORACLE ENGINE // PREDICTIVE ANALYSIS SYSTEM ──
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-widest uppercase glow leading-tight"
              style={{ color: 'var(--green-bright)' }}
            >
              OPEN
              <span className="cursor-blink" style={{ color: 'var(--green-muted)' }}>_</span>
              FUTURE
            </h1>
            <p className="mt-3 text-sm tracking-wide" style={{ color: 'var(--green-muted)' }}>
              REAL-TIME WEB INTELLIGENCE → PROBABILISTIC FORECASTING
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
            onReset={handleReset}
          />
        </div>
      )}
    </main>
  )
}
