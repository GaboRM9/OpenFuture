'use client'

import { useState } from 'react'

type Props = { content: string }

export default function ShareButtons({ content }: Props) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="px-3 py-1 border text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
        style={{
          borderColor: copied ? 'var(--green-dim)' : 'var(--green-border)',
          color: copied ? 'var(--green-bright)' : 'var(--green-muted)',
        }}
      >
        {copied ? '✓ COPIED' : '[COPY]'}
      </button>
      <button
        onClick={handleShare}
        className="px-3 py-1 border text-xs tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]"
        style={{
          borderColor: shared ? 'var(--green-dim)' : 'var(--green-border)',
          color: shared ? 'var(--green-bright)' : 'var(--green-muted)',
        }}
      >
        {shared ? '✓ LINK COPIED' : '[SHARE]'}
      </button>
    </div>
  )
}
