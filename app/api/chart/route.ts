import Anthropic from '@anthropic-ai/sdk'
import { validateTopic, validateHorizon } from '@/lib/validate'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL_CHART = process.env.MODEL_CHART ?? 'claude-sonnet-4-6'

const HORIZON_POINTS: Record<string, { count: number; unit: string }> = {
  '1 week':   { count: 7,  unit: 'day' },
  '1 month':  { count: 4,  unit: 'week' },
  '3 months': { count: 6,  unit: 'biweek' },
  '6 months': { count: 6,  unit: 'month' },
  '1 year':   { count: 12, unit: 'month' },
  '2 years':  { count: 8,  unit: 'quarter' },
}

export async function POST(request: Request) {
  const { allowed, retryAfter } = rateLimit(getIp(request), { limit: 10, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfter)

  const { topic, horizon, forecastContent, today } = await request.json()

  const topicErr = validateTopic(topic)
  if (topicErr) return Response.json({ error: topicErr }, { status: 400 })

  const horizonErr = validateHorizon(horizon)
  if (horizonErr) return Response.json({ error: horizonErr }, { status: 400 })

  const points = HORIZON_POINTS[horizon] ?? { count: 6, unit: 'month' }
  const currentDate = today ?? new Date().toISOString().split('T')[0]

  const forecastContext = forecastContent
    ? `\nFORECAST SUMMARY (already generated — your metric must directly reflect the core prediction in this forecast):\n${forecastContent.slice(0, 1500)}\n`
    : ''

  const prompt = `Today's date: ${currentDate}
Topic: "${topic}"
Time horizon: ${horizon} (from ${currentDate})
Data points needed: ${points.count} (each = 1 ${points.unit})
${forecastContext}
Task: Identify the single quantifiable metric that MOST DIRECTLY measures the core outcome predicted for this topic. If a forecast is provided, the metric must track the central claim — not a peripheral one. Use web search to find the real current value and recent historical values, then project forward from ${currentDate}.

Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{
  "metric": "short metric name",
  "unit": "unit label (e.g. %, $B, GW, million users)",
  "description": "one sentence on why this metric is the core indicator",
  "data": [
    { "label": "period label", "value": <number>, "projected": <true/false> }
  ]
}

Rules:
- First 3 data points: recent historical values anchored to real dates before ${currentDate} (projected: false)
- Remaining ${points.count - 3} points: forward projections from ${currentDate} (projected: true)
- Labels: use short readable strings like "Jan 25", "Q1 25", "Week 1" — anchored to actual calendar dates
- Values must be realistic numbers grounded in your web search — no placeholders
- Do not include any text outside the JSON object`

  try {
    const response = await anthropic.messages.create({
      model: MODEL_CHART,
      max_tokens: 1024,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract the last text block (after any tool use)
    const textBlock = response.content
      .filter((b) => b.type === 'text')
      .pop()

    if (!textBlock || textBlock.type !== 'text') {
      logger.warn('Chart API returned no text block', { topic, horizon })
      return Response.json({ error: 'No data returned' }, { status: 500 })
    }

    // Extract JSON from the response
    const raw = textBlock.text.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.warn('Chart API response contained no valid JSON', { topic, horizon, raw: raw.slice(0, 200) })
      return Response.json({ error: 'Invalid JSON response' }, { status: 500 })
    }

    const chartData = JSON.parse(jsonMatch[0])
    return Response.json(chartData)
  } catch (err) {
    logger.error('Chart API failed', err, { topic, horizon })
    return Response.json({ error: 'Failed to generate chart data' }, { status: 500 })
  }
}
