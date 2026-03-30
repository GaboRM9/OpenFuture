import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

const VALID_STATUSES = ['correct', 'incorrect', 'partial', 'pending'] as const
type Status = typeof VALID_STATUSES[number]

export async function POST(request: Request) {
  const { id, status, notes } = await request.json()

  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status as Status)) {
    return Response.json({ error: 'invalid status' }, { status: 400 })
  }

  const update: Record<string, unknown> = { status }
  update.reviewed_at = status !== 'pending' ? new Date().toISOString() : null
  if (notes !== undefined) update.notes = notes

  const { error } = await supabase
    .from('prediction_runs')
    .update(update)
    .eq('id', id)

  if (error) {
    logger.error('Failed to resolve prediction run', error, { id, status })
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
