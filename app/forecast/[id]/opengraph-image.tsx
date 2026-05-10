import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ff41"><path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 7.449-11.985 7.449c-7.18 0-12.015-7.449-12.015-7.449s4.446-6.551 12.015-6.551c7.694 0 11.985 6.551 11.985 6.551zm-7 .449c0-2.761-2.238-5-5-5-2.761 0-5 2.239-5 5 0 2.762 2.239 5 5 5 2.762 0 5-2.238 5-5z"/></svg>`
const eyeSrc = `data:image/svg+xml;base64,${Buffer.from(EYE_SVG).toString('base64')}`

function extractBottomLine(content: string): string {
  const match = content.match(/##\s*Bottom Line\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return ''
  return match[1].replace(/[*_#`▌▶█]/g, '').trim().slice(0, 180)
}

type Props = { params: Promise<{ id: string }> }

export default async function Image({ params }: Props) {
  const { id } = await params

  const { data } = await supabase
    .from('forecasts')
    .select('topic, horizon, content')
    .eq('id', id)
    .single()

  const topic = data?.topic ?? 'Forecast'
  const horizon = data?.horizon ?? ''
  const bottomLine = data?.content ? extractBottomLine(data.content) : ''
  const fontSize = topic.length > 60 ? 52 : topic.length > 40 ? 64 : 76

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#050d05',
          display: 'flex', flexDirection: 'column',
          padding: '56px 72px',
          fontFamily: 'monospace',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={eyeSrc} width={30} height={30} />
          <span style={{ color: '#4a8b4a', fontSize: '15px', letterSpacing: '0.28em' }}>
            OPENFUTURE // AI FORECAST
          </span>
        </div>

        {/* Topic */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', marginTop: '24px' }}>
          <span style={{
            color: '#00ff41',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}>
            {topic.toUpperCase()}
          </span>
        </div>

        {/* Bottom line */}
        {bottomLine ? (
          <div style={{
            color: '#4a8b4a',
            fontSize: '20px',
            lineHeight: 1.55,
            marginTop: '20px',
            borderLeft: '3px solid #2d6b2d',
            paddingLeft: '20px',
          }}>
            {bottomLine}
          </div>
        ) : null}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '32px', paddingTop: '24px',
          borderTop: '1px solid #1a3a1a',
          color: '#2d6b2d', fontSize: '15px', letterSpacing: '0.2em',
        }}>
          <span style={{ border: '1px solid #1a3a1a', padding: '5px 14px' }}>
            {horizon.toUpperCase()}
          </span>
          <span>OPENFUTURE</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
