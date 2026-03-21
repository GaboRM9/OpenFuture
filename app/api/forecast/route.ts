import Anthropic from '@anthropic-ai/sdk'
import {
  LIGHT_SYSTEM_PROMPT,
  DEEP_RESEARCH_PROMPT,
  COMPRESS_RESEARCH_PROMPT,
  DEEP_SYNTHESIS_PROMPT,
  buildForecastPrompt,
  buildResearchPrompt,
  buildSynthesisPrompt,
} from '@/lib/oracle-prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function fetchMetaculusContext(topic: string): Promise<string> {
  try {
    const url = `https://www.metaculus.com/api2/questions/?search=${encodeURIComponent(topic)}&status=open&limit=5&type=forecast`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = (data.results ?? []).filter((q: any) => {
      const cp = q.community_prediction?.full
      return cp && (typeof cp.q2 === 'number' || typeof cp.avg === 'number')
    })
    if (!questions.length) return ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lines = questions.slice(0, 4).map((q: any) => {
      const cp = q.community_prediction.full
      const prob = Math.round((cp.q2 ?? cp.avg) * 100)
      return `- "${q.title}" → ${prob}% (Metaculus, n=${q.number_of_forecasters ?? '?'})`
    })

    return `\nPREDICTION MARKET PRIORS (Metaculus):\n${lines.join('\n')}`
  } catch {
    return ''
  }
}

async function fetchPolymarketContext(topic: string): Promise<string> {
  try {
    const url = `https://gamma-api.polymarket.com/markets?search=${encodeURIComponent(topic)}&active=true&closed=false&limit=5`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return ''

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markets: any[] = await res.json()
    if (!markets?.length) return ''

    const lines = markets.slice(0, 3).flatMap((m) => {
      try {
        const prices: string[] = JSON.parse(m.outcomePrices ?? '[]')
        const outcomes: string[] = JSON.parse(m.outcomes ?? '[]')
        const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === 'yes')
        if (yesIdx < 0 || !prices[yesIdx]) return []
        const prob = Math.round(parseFloat(prices[yesIdx]) * 100)
        const vol = m.volume ? `, $${Math.round(parseFloat(m.volume)).toLocaleString()} vol` : ''
        return [`- "${m.question}" → ${prob}% Yes (Polymarket${vol})`]
      } catch {
        return []
      }
    })

    if (!lines.length) return ''
    return `\nPREDICTION MARKET PRIORS (Polymarket):\n${lines.join('\n')}`
  } catch {
    return ''
  }
}

function extractResearchText(message: Anthropic.Message): string {
  const textBlocks = message.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!textBlocks.length) return '{}'
  const text = textBlocks[textBlocks.length - 1].text.trim()
  return text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
}

export async function POST(request: Request) {
  const { topic, horizon, mode } = await request.json()

  if (!topic || !horizon) {
    return new Response('Missing topic or horizon', { status: 400 })
  }

  const isDeep = mode === 'deep'
  const today = new Date().toISOString().split('T')[0]

  const [metaculusContext, polymarketContext] = await Promise.all([
    fetchMetaculusContext(topic),
    fetchPolymarketContext(topic),
  ])
  const marketContext = [metaculusContext, polymarketContext].filter(Boolean).join('\n')

  const encoder = new TextEncoder()
  let fullContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let messageStream: ReturnType<typeof anthropic.messages.stream>

        if (isDeep) {
          // Pass 1: research agent gathers evidence into structured JSON
          const researchMessage = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 3000,
            system: DEEP_RESEARCH_PROMPT,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: [{ type: 'web_search_20260209', name: 'web_search', allowed_callers: ['direct'] }] as any,
            messages: [{ role: 'user', content: buildResearchPrompt(topic, horizon, today) }],
          })
          const rawResearch = extractResearchText(researchMessage)

          // Pass 1.5: compress research JSON before passing to Opus
          const compressionMessage = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{
              role: 'user',
              content: `${COMPRESS_RESEARCH_PROMPT}\n\n${rawResearch}`,
            }],
          })
          const researchData = extractResearchText(compressionMessage)

          // Pass 2: Opus synthesizes from the structured evidence
          messageStream = anthropic.messages.stream({
            model: 'claude-opus-4-6',
            max_tokens: 8000,
            system: DEEP_SYNTHESIS_PROMPT,
            messages: [{
              role: 'user',
              content: buildSynthesisPrompt(topic, horizon, today, researchData, marketContext),
            }],
          })
        } else {
          // Light: single pass with live search
          messageStream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 3000,
            system: LIGHT_SYSTEM_PROMPT,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: [{ type: 'web_search_20260209', name: 'web_search', allowed_callers: ['direct'] }] as any,
            messages: [{
              role: 'user',
              content: buildForecastPrompt(topic, horizon, today) + (marketContext ? '\n\n' + marketContext : ''),
            }],
          })
        }

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullContent += text
            controller.enqueue(encoder.encode(text))
          }
        }

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
