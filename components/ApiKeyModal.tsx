'use client'

import { useState } from 'react'

type Props = {
  currentKey: string
  onSave: (key: string) => void
  onClose: () => void
}

function maskKey(key: string): string {
  if (key.length < 8) return '••••••••'
  return `${key.slice(0, 10)}...${key.slice(-4)}`
}

export default function ApiKeyModal({ currentKey, onSave, onClose }: Props) {
  const [input, setInput] = useState('')

  function handleSave() {
    const trimmed = input.trim()
    if (!trimmed) return
    localStorage.setItem('openfuture_api_key', trimmed)
    onSave(trimmed)
    onClose()
  }

  function handleClear() {
    localStorage.removeItem('openfuture_api_key')
    onSave('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="API Key Settings"
    >
      <div
        className="w-full max-w-lg border p-4 sm:p-6 space-y-5"
        style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest uppercase glow-sm" style={{ color: 'var(--green-bright)' }}>
            API KEY SETTINGS
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

        <div className="space-y-4 text-xs" style={{ color: 'var(--green-muted)' }}>
          {currentKey ? (
            <p>
              CURRENT KEY: <span style={{ color: 'var(--green)' }}>{maskKey(currentKey)}</span>
            </p>
          ) : (
            <p style={{ color: 'var(--amber)' }}>NO KEY CONFIGURED</p>
          )}

          <div
            className="flex items-center border"
            style={{ borderColor: 'var(--green-border)', background: 'var(--bg-panel)' }}
          >
            <span className="flex items-center px-3 select-none shrink-0" style={{ color: 'var(--green-muted)' }}>
              &gt;_
            </span>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="sk-ant-api03-..."
              className="flex-1 bg-transparent py-3 pr-4 text-sm outline-none placeholder:opacity-30"
              style={{ color: 'var(--green)', caretColor: 'var(--green-bright)' }}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label="Anthropic API key"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!input.trim()}
              className="px-4 py-1.5 text-xs tracking-widest uppercase border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--green)',
                color: 'var(--green-bright)',
                background: input.trim() ? 'var(--green-faint)' : 'transparent',
              }}
            >
              [SAVE]
            </button>
            {currentKey && (
              <button
                onClick={handleClear}
                className="px-4 py-1.5 text-xs tracking-widest uppercase border transition-all hover:bg-[rgba(255,68,68,0.08)]"
                style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
              >
                [CLEAR]
              </button>
            )}
          </div>
        </div>

        <div className="border-t pt-3 space-y-2 text-xs" style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}>
          <p>
            Your key is stored only in this browser and never logged server-side.
            It is only sent to Anthropic when running a forecast.
          </p>
          <p>
            Get a key at{' '}
            <span style={{ color: 'var(--green-muted)' }}>console.anthropic.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
