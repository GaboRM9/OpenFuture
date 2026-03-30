import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Forecast = {
  id: string
  topic: string
  horizon: string
  content: string
  created_at: string
}

export type PredictionRunStatus = 'pending' | 'correct' | 'incorrect' | 'partial'

export type PredictionRun = {
  id: string
  forecast_id: string
  topic: string
  horizon: string
  mode: 'light' | 'deep'
  predictions: Array<{
    prediction_text: string
    confidence: number | null
    timeframe: string | null
    resolution_criteria: string | null
  }>
  status: PredictionRunStatus
  reviewed_at: string | null
  notes: string | null
  created_at: string
}
