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
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-16">
      {!forecast && (
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
              Open<span className="text-emerald-400">Future</span>
            </h1>
            <p className="mt-3 text-zinc-400">
              AI-powered forecast analysis — enter a topic and see what&apos;s
              ahead
            </p>
          </div>
          <ForecastForm onSubmit={handleSubmit} loading={loading} />
        </div>
      )}

      {forecast && (
        <ForecastStream
          topic={forecast.topic}
          horizon={forecast.horizon}
          onReset={handleReset}
        />
      )}
    </main>
  )
}
