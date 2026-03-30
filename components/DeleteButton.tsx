'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs tracking-widest uppercase border px-2 py-0.5 transition-all"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
        >
          {loading ? '...' : 'CONFIRM'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs tracking-widest uppercase border px-2 py-0.5 transition-all hover:bg-[var(--green-faint)]"
          style={{ borderColor: 'var(--green-border)', color: 'var(--green-muted)' }}
        >
          CANCEL
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs tracking-widest uppercase border px-2 py-0.5 shrink-0 transition-all hover:border-[var(--red)] hover:text-[var(--red)]"
      style={{ borderColor: 'var(--green-border)', color: 'var(--green-faint)' }}
    >
      [DEL]
    </button>
  )
}
