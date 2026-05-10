import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ff41"><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 7.449-11.985 7.449c-7.18 0-12.015-7.449-12.015-7.449s4.446-6.551 12.015-6.551c7.694 0 11.985 6.551 11.985 6.551zm-7 .449c0-2.761-2.238-5-5-5-2.761 0-5 2.239-5 5 0 2.762 2.239 5 5 5 2.762 0 5-2.238 5-5z"/></svg>`
const eyeSrc = `data:image/svg+xml;base64,${Buffer.from(EYE_SVG).toString('base64')}`

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#050d05',
          display: 'flex', flexDirection: 'column',
          padding: '64px 72px',
          fontFamily: 'monospace',
        }}
      >
        {/* Top label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img src={eyeSrc} width={40} height={40} />
          <span style={{ color: '#4a8b4a', fontSize: '17px', letterSpacing: '0.28em' }}>
            ORACLE ENGINE // PREDICTIVE ANALYSIS SYSTEM
          </span>
        </div>

        {/* Main title */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '72px', gap: '0px' }}>
          <span style={{ color: '#00ff41', fontSize: '132px', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1 }}>
            OPEN
          </span>
          <span style={{ color: '#2d6b2d', fontSize: '132px', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1 }}>
            _
          </span>
          <span style={{ color: '#00ff41', fontSize: '132px', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1 }}>
            FUTURE
          </span>
        </div>

        {/* Tagline */}
        <div style={{ marginTop: '28px', color: '#4a8b4a', fontSize: '26px', letterSpacing: '0.22em' }}>
          REAL-TIME INTELLIGENCE → PROBABILISTIC FORECASTING
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 'auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#2d6b2d', fontSize: '16px', letterSpacing: '0.18em',
          borderTop: '1px solid #1a3a1a', paddingTop: '24px',
        }}>
          <span>LIGHT MODE · DEEP MODE · PREDICTION TRACKER</span>
          <span>v0.1.4</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
