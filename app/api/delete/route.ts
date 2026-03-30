import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export async function DELETE(request: Request) {
  const { id } = await request.json()

  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'Missing or invalid id' }, { status: 400 })
  }

  const { error } = await supabase.from('forecasts').delete().eq('id', id)

  if (error) {
    logger.error('Failed to delete forecast', error, { id })
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
