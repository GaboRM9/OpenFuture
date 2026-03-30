import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '@/lib/logger'

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('logger', () => {
  it('logger.error calls console.error with structured output', () => {
    logger.error('something broke', new Error('boom'), { endpoint: '/api/test' })
    expect(console.error).toHaveBeenCalledOnce()
    const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(msg).toContain('ERROR')
    expect(msg).toContain('something broke')
    expect(msg).toContain('boom')
    expect(msg).toContain('/api/test')
  })

  it('logger.warn calls console.warn', () => {
    logger.warn('heads up', { key: 'val' })
    expect(console.warn).toHaveBeenCalledOnce()
    const [msg] = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(msg).toContain('WARN')
    expect(msg).toContain('heads up')
  })

  it('logger.info calls console.log', () => {
    logger.info('started', { route: '/api/forecast' })
    expect(console.log).toHaveBeenCalledOnce()
    const [msg] = (console.log as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(msg).toContain('INFO')
    expect(msg).toContain('started')
  })

  it('handles non-Error thrown values', () => {
    logger.error('string error', 'just a string')
    expect(console.error).toHaveBeenCalledOnce()
    const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(msg).toContain('just a string')
  })
})
