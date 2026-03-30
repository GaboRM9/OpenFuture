import { describe, it, expect, beforeEach, vi } from 'vitest'

// Reset module cache between tests so the store Map is fresh
beforeEach(() => {
  vi.resetModules()
})

describe('rateLimit', () => {
  it('allows requests under the limit', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    const config = { limit: 3, windowMs: 60_000 }
    expect(rateLimit('ip-1', config).allowed).toBe(true)
    expect(rateLimit('ip-1', config).allowed).toBe(true)
    expect(rateLimit('ip-1', config).allowed).toBe(true)
  })

  it('blocks request at the limit', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    const config = { limit: 2, windowMs: 60_000 }
    rateLimit('ip-2', config)
    rateLimit('ip-2', config)
    const result = rateLimit('ip-2', config)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('tracks IPs independently', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    const config = { limit: 1, windowMs: 60_000 }
    rateLimit('ip-a', config)
    const blocked = rateLimit('ip-a', config)
    const allowed = rateLimit('ip-b', config)
    expect(blocked.allowed).toBe(false)
    expect(allowed.allowed).toBe(true)
  })

  it('resets after window expires', async () => {
    vi.useFakeTimers()
    const { rateLimit } = await import('@/lib/rate-limit')
    const config = { limit: 1, windowMs: 1000 }
    rateLimit('ip-3', config)
    expect(rateLimit('ip-3', config).allowed).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(rateLimit('ip-3', config).allowed).toBe(true)
    vi.useRealTimers()
  })
})

describe('getIp', () => {
  it('extracts IP from x-forwarded-for', async () => {
    const { getIp } = await import('@/lib/rate-limit')
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', async () => {
    const { getIp } = await import('@/lib/rate-limit')
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    })
    expect(getIp(req)).toBe('9.9.9.9')
  })

  it('falls back to anonymous', async () => {
    const { getIp } = await import('@/lib/rate-limit')
    const req = new Request('http://localhost')
    expect(getIp(req)).toBe('anonymous')
  })
})
