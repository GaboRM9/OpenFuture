'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings, Sun, Moon, Github, HelpCircle } from 'lucide-react'

type Props = {
  apiKey: string
  theme: 'dark' | 'light'
  onApiKey: () => void
  onTheme: () => void
  onHelp: () => void
  size?: 'sm' | 'md'
}

export default function SettingsMenu({
  apiKey,
  theme,
  onApiKey,
  onTheme,
  onHelp,
  size = 'sm',
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const iconSize = size === 'sm' ? 13 : 14
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const itemClass = `flex w-full items-center gap-3 px-4 py-2.5 ${textClass} tracking-widest uppercase transition-all hover:bg-[var(--green-faint)]`

  return (
    <div className="shrink-0 relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center border p-1.5 transition-all hover:bg-[var(--green-faint)]"
        style={{
          borderColor: open ? 'var(--green)' : 'var(--green-border)',
          color: open ? 'var(--green-bright)' : 'var(--green-muted)',
        }}
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-40 min-w-[180px] border py-1"
          style={{ background: 'var(--bg)', borderColor: 'var(--green-border)' }}
        >
          <button
            onClick={() => { onApiKey(); setOpen(false) }}
            className={itemClass}
            style={{ color: apiKey ? 'var(--green-bright)' : 'var(--green-muted)' }}
          >
            <Settings size={iconSize} />
            API KEY{apiKey && ' ✓'}
          </button>
          <button
            onClick={() => { onTheme(); setOpen(false) }}
            className={itemClass}
            style={{ color: 'var(--green-muted)' }}
          >
            {theme === 'dark' ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
            {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
          <button
            onClick={() => { onHelp(); setOpen(false) }}
            className={itemClass}
            style={{ color: 'var(--green-muted)' }}
          >
            <HelpCircle size={iconSize} />
            HELP
          </button>
          <div className="my-1 border-t" style={{ borderColor: 'var(--green-border)' }} />
          <a
            href="https://github.com/GaboRM9/OpenFuture"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
            style={{ color: 'var(--green-muted)' }}
          >
            <Github size={iconSize} />
            GITHUB
          </a>
        </div>
      )}
    </div>
  )
}
