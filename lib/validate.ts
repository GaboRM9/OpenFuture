export const VALID_HORIZONS = ['1 week', '1 month', '3 months', '6 months', '1 year', '2 years'] as const
export type Horizon = typeof VALID_HORIZONS[number]

export const VALID_MODES = ['light', 'deep'] as const
export type Mode = typeof VALID_MODES[number]

export function validateTopic(topic: unknown): string | null {
  if (typeof topic !== 'string') return 'Topic must be a string'
  const t = topic.trim()
  if (t.length === 0) return 'Topic is required'
  if (t.length > 500) return 'Topic must be 500 characters or fewer'
  return null
}

export function validateHorizon(horizon: unknown): string | null {
  if (typeof horizon !== 'string') return 'Horizon must be a string'
  const h = horizon.trim()
  if (h.length === 0) return 'Horizon is required'
  if (h.length > 50) return 'Horizon must be 50 characters or fewer'
  return null
}

export function validateMode(mode: unknown): string | null {
  if (!VALID_MODES.includes(mode as Mode)) {
    return `Mode must be one of: ${VALID_MODES.join(', ')}`
  }
  return null
}

export function validateContent(content: unknown): string | null {
  if (typeof content !== 'string') return 'Content must be a string'
  if (content.trim().length === 0) return 'Content is required'
  if (content.length > 100_000) return 'Content exceeds maximum allowed length'
  return null
}
