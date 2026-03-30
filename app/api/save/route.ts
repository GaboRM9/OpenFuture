import { supabase } from '@/lib/supabase'
import { validateTopic, validateHorizon, validateContent, validateMode } from '@/lib/validate'
import { rateLimit, getIp, rateLimitResponse } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { extractPredictions } from '@/lib/extract-predictions'

export async function POST(request: Request) {
  const { allowed, retryAfter } = rateLimit(getIp(request), { limit: 20, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(retryAfter)

  const { topic, horizon, content, mode } = await request.json()

  const topicErr = validateTopic(topic)
  if (topicErr) return Response.json({ error: topicErr }, { status: 400 })

  const horizonErr = validateHorizon(horizon)
  if (horizonErr) return Response.json({ error: horizonErr }, { status: 400 })

  const contentErr = validateContent(content)
  if (contentErr) return Response.json({ error: contentErr }, { status: 400 })

  const resolvedMode = mode ?? 'light'
  const modeErr = validateMode(resolvedMode)
  if (modeErr) return Response.json({ error: modeErr }, { status: 400 })

  const { data, error } = await supabase
    .from('forecasts')
    .insert({ topic, horizon, content })
    .select('id')
    .single()

  if (error) {
    logger.error('Failed to save forecast', error, { topic, horizon })
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Log one prediction run per forecast (predictions stored as JSONB array)
  const predictions = extractPredictions(content)
  const { error: runErr } = await supabase.from('prediction_runs').insert({
    forecast_id: data.id,
    topic,
    horizon,
    mode: resolvedMode,
    predictions,
  })

  if (runErr) {
    logger.error('Failed to log prediction run', runErr, { forecast_id: data.id })
  } else {
    logger.info('Prediction run logged', { forecast_id: data.id, predictions: predictions.length })
  }

  return Response.json({ id: data.id })
}
