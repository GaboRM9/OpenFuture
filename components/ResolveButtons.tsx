'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PredictionRunStatus } from '@/lib/supabase'

const ACTIONS: { status: PredictionRunStatus; label: string; color: string }[] = [
  { status: 'correct',   label: '✓ CORRECT',   color: 'var(--green-bright)' },
  { status: 'partial',   label: '~ PARTIAL',   color: 'var(--amber, #d4a017)' },
  { status: 'incorrect', label: '✕ WRONG',     color: 'var(--red, #e05252)' },
]

export default function ResolveButtons({
  id,
  current,
}: {
  id: string
  current: PredictionRunStatus
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [active, setActive] = useState<PredictionRunStatus>(current)

  async function resolve(status: PredictionRunStatus) {
    const next = active === status ? 'pending' : status // toggle off
    setActive(next)
    await fetch('/api/resolve-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {ACTIONS.map(({ status, label, color }) => {
        const isActive = active === status
        return (
          <button
            key={status}
            onClick={() => resolve(status)}
            disabled={pending}
            className="text-xs tracking-widest border px-2 py-0.5 transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              borderColor: isActive ? color : 'var(--green-border)',
              color: isActive ? color : 'var(--green-faint)',
              background: isActive ? 'color-mix(in srgb, currentColor 10%, transparent)' : 'transparent',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
