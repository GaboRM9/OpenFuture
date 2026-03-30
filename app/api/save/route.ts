import { supabase } from '@/lib/supabase'
import { validateTopic, validateHorizon, validateContent } from '@/lib/validate'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const { allowed, retryAfter } = rateLimit(getIp(request), { limit: 20, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfter)

  const { topic, horizon, content } = await request.json()

  const topicErr = validateTopic(topic)
  if (topicErr) return Response.json({ error: topicErr }, { status: 400 })

  const horizonErr = validateHorizon(horizon)
  if (horizonErr) return Response.json({ error: horizonErr }, { status: 400 })

  const contentErr = validateContent(content)
  if (contentErr) return Response.json({ error: contentErr }, { status: 400 })

  const { data, error } = await supabase
    .from('forecasts')
    .insert({ topic, horizon, content })
    .select('id')
    .single()

  if (error) {
    console.error('Save error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ id: data.id })
}
