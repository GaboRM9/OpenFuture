import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const { id } = await request.json()

  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase.from('prediction_runs').delete().eq('id', id)

  if (error) {
    logger.error('Failed to delete prediction run', error, { id })
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
