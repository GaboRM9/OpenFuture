'use client'

import { useState } from 'react'

const HORIZONS = [
  '1 week',
  '1 month',
  '3 months',
  '6 months',
  '1 year',
  '2 years',
]

type Props = {
  onSubmit: (topic: string, horizon: string) => void
  loading: boolean
}

export default function ForecastForm({ onSubmit, loading }: Props) {
  const [topic, setTopic] = useState('')
  const [horizon, setHorizon] = useState('3 months')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    onSubmit(topic.trim(), horizon)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-zinc-400 mb-1"
        >
          Topic
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. artificial intelligence regulation, climate change, SpaceX..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          disabled={loading}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Time Horizon
        </label>
        <div className="flex flex-wrap gap-2">
          {HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              disabled={loading}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                horizon === h
                  ? 'bg-emerald-500 text-black'
                  : 'border border-zinc-600 text-zinc-400 hover:border-emerald-500 hover:text-emerald-400'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Generating forecast...' : 'Generate Forecast'}
      </button>
    </form>
  )
}
