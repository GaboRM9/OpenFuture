'use client'

import { useMemo } from 'react'

type Props = { horizon: string; content: string }

// ─── Time helpers ─────────────────────────────────────────────────────────────

function parseToDays(h: string): number {
  const m = h.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(day|week|month|year|decade)/i)
  if (!m) return 365
  const n = parseFloat(m[1]), u = m[2][0].toLowerCase()
  if (u === 'd') return Math.round(n)
  if (u === 'w') return Math.round(n * 7)
  if (u === 'm') return Math.round(n * 30)
  if (u === 'y') return Math.round(n * 365)
  return Math.round(n * 3650)
}

function timeLabel(days: number, total: number): string {
  if (total <= 14) return `${days}D`
  if (total <= 90) return `${Math.round(days / 7)} WK`
  if (total <= 730) return `${Math.round(days / 30)} MO`
  const y = parseFloat((days / 365).toFixed(1))
  return `${y} YR`
}

function calDate(totalDays: number, frac: number): string {
  const d = new Date()
  d.setDate(d.getDate() + Math.round(totalDays * frac))
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

// ─── Data extraction ──────────────────────────────────────────────────────────

type Point = { label: string; date: string; text: string; conf: number }

const FRACS = [0.25, 0.5, 0.75, 1.0]

function buildPt(text: string, conf: number, i: number, totalDays: number): Point {
  const days = Math.round(FRACS[i] * totalDays)
  return { text, conf, label: timeLabel(days, totalDays), date: calDate(totalDays, FRACS[i]) }
}

// Extract confidence from a light-mode prediction line.
// Prefers the trailing (X%) / (X% confidence) marker; falls back to the
// last valid percentage in the line so ranges like "25-30%" don't win.
function lineConf(line: string): number | null {
  const trailing = line.match(/\(\s*(\d+)(?:\s*[-–]\s*\d+)?%(?:\s+confidence)?\s*\)\s*[.\s]*$/)
  if (trailing) {
    const v = +trailing[1]
    if (v >= 5 && v <= 99) return v
  }
  const all = [...line.matchAll(/\b(\d+)%/g)].map(m => +m[1]).filter(v => v >= 5 && v <= 99)
  return all.length > 0 ? all[all.length - 1] : null
}

// Strip leading bullet/number and all trailing confidence markers from prediction text.
function lineText(line: string): string {
  return line
    .replace(/^\s*[-*•\d.\)]+\s*/, '')
    .replace(/\s*\(\s*\d+(?:\s*[-–]\s*\d+)?%(?:\s+confidence)?\s*\)/gi, '')
    .replace(/[*_`~]/g, '')
    .trim()
}

// Build a "final assessment" card for slot 3 (the 100% horizon point).
// Uses Bottom Line text + best available overall confidence.
function finalCard(content: string, totalDays: number, rawConfs: number[]): Point {
  const fe = content.match(/[Ff]inal\s+estimate:\s*~?(\d+)(?:[–\-](\d+))?%/)
  const feConf = fe ? Math.round((+fe[1] + (fe[2] ? +fe[2] : +fe[1])) / 2) : null
  const avg = rawConfs.length > 0
    ? Math.round(rawConfs.reduce((s, v) => s + v, 0) / rawConfs.length)
    : 60
  const conf = feConf ?? avg

  const bl = content.match(/##\s*Bottom\s*Line\s*\n([\s\S]*?)(?=\n##|$)/)
  const text = bl
    ? bl[1].replace(/[*_`~#▌▶█]/g, '').split('\n').map(l => l.trim()).find(l => l.length > 10) ?? ''
    : ''

  return {
    text: text || '—',
    conf,
    label: timeLabel(totalDays, totalDays),
    date: calDate(totalDays, 1.0),
  }
}

function getPoints(content: string, totalDays: number): Point[] {
  // Deep mode — Predictions Table (Timeframe | Prediction | Confidence | …)
  const tbl = content.match(/##\s*Predictions\s*Table[\s\S]*?\n((?:\|[^\n]+\n)+)/)
  if (tbl) {
    const raw: { text: string; conf: number }[] = []
    for (const row of tbl[1].split('\n').filter(r => /^\|/.test(r) && !/---/.test(r) && !/timeframe/i.test(r))) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length < 3) continue
      const cm = cells[2].match(/(\d+)(?:[–\-](\d+))?%/)
      if (!cm) continue
      const lo = +cm[1], hi = cm[2] ? +cm[2] : lo
      if (lo < 5 || lo > 99) continue
      const text = cells[1].replace(/[*_`~]/g, '').trim()
      if (text) raw.push({ text, conf: Math.round((lo + hi) / 2) })
    }
    if (raw.length >= 4) return raw.slice(0, 4).map((p, i) => buildPt(p.text, p.conf, i, totalDays))
    if (raw.length >= 1) {
      const used = raw.slice(0, 3)
      while (used.length < 3) used.push({ ...used[used.length - 1] })
      return [...used.map((p, i) => buildPt(p.text, p.conf, i, totalDays)), finalCard(content, totalDays, raw.map(p => p.conf))]
    }
  }

  // Light mode — Key Predictions bullet lines
  const kp = content.match(/##\s*Key\s*Predictions?\s*\n([\s\S]*?)(?=\n##|$)/)
  if (kp) {
    const raw: { text: string; conf: number }[] = []
    for (const line of kp[1].split('\n').filter(l => /^\s*[-*•\d]/.test(l))) {
      const conf = lineConf(line)
      if (conf === null) continue
      const text = lineText(line)
      if (text) raw.push({ text, conf })
    }
    if (raw.length >= 4) return raw.slice(0, 4).map((p, i) => buildPt(p.text, p.conf, i, totalDays))
    if (raw.length >= 1) {
      const used = raw.slice(0, 3)
      while (used.length < 3) used.push({ ...used[used.length - 1] })
      return [...used.map((p, i) => buildPt(p.text, p.conf, i, totalDays)), finalCard(content, totalDays, raw.map(p => p.conf))]
    }
  }

  return FRACS.map((_, i) => buildPt('', 60, i, totalDays))
}

function getCurveAnchors(content: string, pts: Point[]): [number, number] {
  const br = content.match(/[Bb]ase\s+rate:\s*~?(\d+)(?:[–\-](\d+))?%/)
  const base = br ? Math.round((+br[1] + (br[2] ? +br[2] : +br[1])) / 2) : null
  const fe = content.match(/[Ff]inal\s+estimate:\s*~?(\d+)(?:[–\-](\d+))?%/)
  const fin = fe ? Math.round((+fe[1] + (fe[2] ? +fe[2] : +fe[1])) / 2) : null
  const avg = Math.round(pts.reduce((s, p) => s + p.conf, 0) / pts.length)
  const end = fin ?? avg
  const start = base ?? Math.max(10, Math.min(90, end - 15))
  return [start, end]
}

// ─── SVG constants ────────────────────────────────────────────────────────────

const W = 480, H = 90
const PTOP = 20   // headroom for confidence labels above dots
const PBOT = 76   // baseline

// Dot X positions at 12.5 / 37.5 / 62.5 / 87.5% of W — aligns with 4-col card centers
const DX = [0.125, 0.375, 0.625, 0.875].map(f => W * f)

function cy(v: number) { return PTOP + (PBOT - PTOP) * (1 - v / 100) }

function confColor(c: number) {
  return c >= 70 ? 'var(--green)' : c >= 45 ? 'var(--amber)' : 'var(--red, #ff4444)'
}

// ─── Card border classes per 2×2 mobile / 4-col desktop layout ───────────────
const CARD_BORDERS = [
  'border-r border-b sm:border-b-0',   // top-left
  'border-b sm:border-b-0 sm:border-r', // top-right → gains right border on desktop
  'border-r',                            // bottom-left
  '',                                    // bottom-right — no border
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForecastTimeline({ horizon, content }: Props) {
  const totalDays = useMemo(() => parseToDays(horizon), [horizon])
  const pts       = useMemo(() => getPoints(content, totalDays), [content, totalDays])
  const [cS, cE]  = useMemo(() => getCurveAnchors(content, pts), [content, pts])

  // Background arc: overall probability trajectory (base rate → final estimate)
  const arcD = `M 0 ${cy(cS)} C ${W * 0.4} ${cy(cS)} ${W * 0.6} ${cy(cE)} ${W} ${cy(cE)}`

  // Foreground tendency: connects the 4 individual prediction confidences
  const tendD = DX.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${cy(pts[i].conf).toFixed(1)}`).join(' ')

  return (
    <div className="mt-6 border" style={{ borderColor: 'var(--green-border)', background: 'var(--bg)' }}>

      {/* Header */}
      <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--green-border)' }}>
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--green-muted)' }}>
          ── PROJECTION TIMELINE
        </span>
        <div className="flex items-center gap-3 text-[10px] tracking-widest" style={{ color: 'var(--green-faint)' }}>
          <span>━ TENDENCY</span>
          <span style={{ opacity: 0.5 }}>╌ BASE RATE ARC</span>
          <span>{horizon.toUpperCase()}</span>
        </div>
      </div>

      {/* SVG chart — no text inside except axis labels */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-hidden="true"
      >
        {/* Horizontal grid lines */}
        {([25, 50, 75] as const).map(v => (
          <g key={v}>
            <line x1={0} y1={cy(v)} x2={W} y2={cy(v)} stroke="var(--green-border)" strokeWidth="0.5" />
            <text x={5} y={cy(v) + 3} fontSize="6.5" fill="var(--green-faint)" fontFamily="monospace">
              {v}%
            </text>
          </g>
        ))}

        {/* Baseline */}
        <line x1={0} y1={PBOT} x2={W} y2={PBOT} stroke="var(--green-border)" strokeWidth="1" />

        {/* Background arc: base rate → final estimate */}
        <path d={arcD} fill="none" stroke="var(--green-faint)" strokeWidth="1" strokeDasharray="3 5" opacity="0.6" />

        {/* Tendency line through the 4 predictions */}
        <path d={tendD} fill="none" stroke="var(--green-dim)" strokeWidth="1.5" />

        {/* Dots + confidence labels */}
        {DX.map((x, i) => {
          const p = pts[i], y = cy(p.conf), isLast = i === 3, col = confColor(p.conf)
          return (
            <g key={i}>
              {/* Vertical drop guide */}
              <line x1={x} y1={PBOT} x2={x} y2={y + (isLast ? 6 : 5)}
                stroke="var(--green-border)" strokeWidth="0.75" strokeDasharray="2 3" />
              {/* Confidence label */}
              <text x={x} y={y - 8} textAnchor="middle" fontSize="9"
                fill={isLast ? 'var(--green-bright)' : col}
                fontFamily="monospace" fontWeight={isLast ? '700' : '400'}
              >
                {p.conf}%
              </text>
              {/* Dot */}
              <circle cx={x} cy={y} r={isLast ? 5 : 3.5}
                fill={isLast ? col : 'var(--bg)'}
                stroke={col} strokeWidth={isLast ? '2' : '1.5'}
              />
            </g>
          )
        })}
      </svg>

      {/* Event cards — 2×2 on mobile, 4-col on sm+ */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 border-t"
        style={{ borderColor: 'var(--green-border)' }}
      >
        {pts.map((p, i) => {
          const isLast = i === 3
          const col = confColor(p.conf)
          return (
            <div
              key={i}
              className={`flex flex-col gap-2.5 p-3 sm:p-4 ${CARD_BORDERS[i]}`}
              style={{
                borderColor: 'var(--green-border)',
                background: isLast ? 'var(--bg-panel)' : 'transparent',
              }}
            >
              {/* Time milestone */}
              <div>
                <p
                  className="text-[10px] tracking-[0.15em] uppercase font-bold"
                  style={{ color: isLast ? 'var(--green-bright)' : 'var(--green-muted)' }}
                >
                  {p.label}
                </p>
                <p className="text-[9px] tracking-widest mt-0.5" style={{ color: 'var(--green-faint)' }}>
                  {p.date}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: 'var(--green-border)' }} />

              {/* Full prediction text — no truncation */}
              <p className="text-[11px] sm:text-xs leading-relaxed flex-1" style={{ color: 'var(--green-dim)' }}>
                {p.text || '—'}
              </p>

              {/* Confidence bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] tracking-widest uppercase" style={{ color: 'var(--green-faint)' }}>
                    CONFIDENCE
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: col }}>
                    {p.conf}%
                  </span>
                </div>
                <div className="h-px w-full" style={{ background: 'var(--green-border)' }}>
                  <div
                    className="h-full"
                    style={{ width: `${p.conf}%`, background: col, opacity: 0.65 }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
