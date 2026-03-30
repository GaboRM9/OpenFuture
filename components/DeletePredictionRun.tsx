'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePredictionRun({ id }: { id: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  async function handleDelete() {
    await fetch('/api/delete-prediction-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    startTransition(() => router.refresh())
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs tracking-widest border px-2 py-0.5 transition-all hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: 'var(--red, #e05252)', color: 'var(--red, #e05252)' }}
        >
          CONFIRM
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs tracking-widest border px-2 py-0.5 transition-all hover:opacity-80"
          style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
        >
          CANCEL
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs tracking-widest border px-2 py-0.5 transition-all hover:opacity-80"
      style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
    >
      [DELETE]
    </button>
  )
}
