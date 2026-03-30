/**
 * In-memory sliding window rate limiter.
 * Works per-process — sufficient for a single server or Vercel Edge.
 * Swap the store for Redis/Upstash to support multi-instance deployments.
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export interface RateLimitConfig {
  /** Max requests allowed within the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  )
}

export function rateLimitResponse(retryAfter: number): Response {
  return new Response('Too many requests', {
    status: 429,
    headers: {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(retryAfter),
    },
  })
}
