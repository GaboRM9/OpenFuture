'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { /* Clock, */ Settings, Sun, Moon, Github, HelpCircle } from 'lucide-react'
import ForecastForm from '@/components/ForecastForm'
import ForecastStream from '@/components/ForecastStream'
import ApiKeyModal from '@/components/ApiKeyModal'

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
        className="w-full max-w-lg border p-4 sm:p-6 space-y-5"
        style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="border-t pt-3 text-xs" style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}>
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
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('openfuture_api_key')
    if (stored) setApiKey(stored)

    const savedTheme = localStorage.getItem('openfuture_theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    if (settingsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('openfuture_theme', next)
  }

  function handleSubmit(topic: string, horizon: string, mode: 'light' | 'deep') {
    setLoading(true)
    setForecast({ topic, horizon, mode })
  }

  function handleReset() {
    setForecast(null)
    setLoading(false)
  }

  return (
    <main className="h-[100dvh] flex flex-col px-6 sm:px-12">
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {keyModalOpen && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={setApiKey}
          onClose={() => setKeyModalOpen(false)}
        />
      )}

      {!forecast && (
        <div className="flex flex-col flex-1 w-full">
          {/* Header */}
          <div className="pt-6 sm:pt-10">
            <div className="flex items-start justify-end sm:justify-between">
              <p className="hidden sm:block text-base tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
                ── ORACLE ENGINE // PREDICTIVE ANALYSIS SYSTEM ──
              </p>
              <div className="shrink-0 relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  className="flex items-center border p-1.5 transition-all hover:bg-[var(--green-faint)]"
                  style={{
                    borderColor: settingsOpen ? 'var(--green)' : 'var(--green-border)',
                    color: settingsOpen ? 'var(--green-bright)' : 'var(--green-muted)',
                  }}
                  title="Settings"
                >
                  <Settings size={16} />
                </button>

                {settingsOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 z-40 min-w-[180px] border py-1"
                    style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
                  >
                    <button
                      onClick={() => { setKeyModalOpen(true); setSettingsOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                      style={{ color: apiKey ? 'var(--green-bright)' : 'var(--green-muted)' }}
                    >
                      <Settings size={13} />
                      API KEY{apiKey && ' ✓'}
                    </button>
                    <button
                      onClick={() => { toggleTheme(); setSettingsOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                      style={{ color: 'var(--green-muted)' }}
                    >
                      {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                      {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                    </button>
                    <button
                      onClick={() => { setHelpOpen(true); setSettingsOpen(false) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                      style={{ color: 'var(--green-muted)' }}
                    >
                      <HelpCircle size={13} />
                      HELP
                    </button>
                    <div className="my-1 border-t" style={{ borderColor: 'var(--green-border)' }} />
                    <a
                      href="https://github.com/GaboRM9/OpenFuture"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSettingsOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
                      style={{ color: 'var(--green-muted)' }}
                    >
                      <Github size={13} />
                      GITHUB
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <h1
                className="text-[32px] sm:text-[69px] font-black tracking-widest uppercase leading-tight"
                style={{ color: 'var(--green-bright)' }}
              >
                OPEN
                <span style={{ color: 'var(--green-muted)', fontWeight: 700 }}>_</span>
                FUTURE
              </h1>
              <span className="text-xs sm:text-base" style={{ color: 'var(--green-muted)' }}>v0.1.3</span>
            </div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-lg tracking-wide" style={{ color: 'var(--green-muted)' }}>
              REAL-TIME INTELLIGENCE → PROBABILISTIC FORECASTING
            </p>
            <div className="mt-3 sm:mt-4 border-t" style={{ borderColor: 'var(--green-border)' }} />
          </div>

          <div className="flex-1 flex items-center w-full">
            <div className="w-full max-w-[806px] mx-auto">
              <ForecastForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      )}

      {forecast && (
        <div className="flex flex-col flex-1 w-full pt-6 sm:pt-10 pb-6">
          <ForecastStream
            topic={forecast.topic}
            horizon={forecast.horizon}
            mode={forecast.mode}
            apiKey={apiKey}
            onReset={handleReset}
          />
        </div>
      )}
    </main>
  )
}
