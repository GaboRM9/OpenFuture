import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { topic, horizon, content } = await request.json()

  if (!topic || !horizon || !content) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

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
