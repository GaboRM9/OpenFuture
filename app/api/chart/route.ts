import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const HORIZON_POINTS: Record<string, { count: number; unit: string }> = {
  '1 week':   { count: 7,  unit: 'day' },
  '1 month':  { count: 4,  unit: 'week' },
  '3 months': { count: 6,  unit: 'biweek' },
  '6 months': { count: 6,  unit: 'month' },
  '1 year':   { count: 12, unit: 'month' },
  '2 years':  { count: 8,  unit: 'quarter' },
}

export async function POST(request: Request) {
  const { topic, horizon } = await request.json()

  if (!topic || !horizon) {
    return Response.json({ error: 'Missing params' }, { status: 400 })
  }

  const points = HORIZON_POINTS[horizon] ?? { count: 6, unit: 'month' }

  const prompt = `Topic: "${topic}"
Time horizon: ${horizon}
Data points needed: ${points.count} (each = 1 ${points.unit})

Task: Identify the single most compelling quantifiable metric that best captures what will change for this topic over the given horizon. Use web search to find the real current value, then project it realistically.

Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{
  "metric": "short metric name",
  "unit": "unit label (e.g. %, $B, GW, million users)",
  "description": "one sentence on why this metric matters",
  "data": [
    { "label": "period label", "value": <number>, "projected": <true/false> }
  ]
}

Rules:
- First 2 data points: recent historical values (projected: false)
- Remaining ${points.count - 2} points: forward projections (projected: true)
- Labels: use short readable strings like "Jan 25", "Q1 25", "Week 1", etc.
- Values must be realistic numbers — no placeholders
- Do not include any text outside the JSON object`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract the last text block (after any tool use)
    const textBlock = response.content
      .filter((b) => b.type === 'text')
      .pop()

    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No data returned' }, { status: 500 })
    }

    // Extract JSON from the response
    const raw = textBlock.text.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Invalid JSON response' }, { status: 500 })
    }

    const chartData = JSON.parse(jsonMatch[0])
    return Response.json(chartData)
  } catch (err) {
    console.error('Chart API error:', err)
    return Response.json({ error: 'Failed to generate chart data' }, { status: 500 })
  }
}
