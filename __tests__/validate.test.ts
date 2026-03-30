import { describe, it, expect } from 'vitest'
import { validateTopic, validateHorizon, validateMode, validateContent } from '@/lib/validate'

describe('validateTopic', () => {
  it('accepts a valid topic', () => {
    expect(validateTopic('Will AI replace programmers?')).toBeNull()
  })

  it('rejects non-string', () => {
    expect(validateTopic(42)).not.toBeNull()
  })

  it('rejects empty string', () => {
    expect(validateTopic('')).not.toBeNull()
  })

  it('rejects whitespace-only string', () => {
    expect(validateTopic('   ')).not.toBeNull()
  })

  it('rejects topic over 500 chars', () => {
    expect(validateTopic('a'.repeat(501))).not.toBeNull()
  })

  it('accepts topic exactly 500 chars', () => {
    expect(validateTopic('a'.repeat(500))).toBeNull()
  })
})

describe('validateHorizon', () => {
  it('accepts all valid horizons', () => {
    const valid = ['1 week', '1 month', '3 months', '6 months', '1 year', '2 years']
    valid.forEach((h) => expect(validateHorizon(h)).toBeNull())
  })

  it('rejects invalid horizon', () => {
    expect(validateHorizon('5 years')).not.toBeNull()
    expect(validateHorizon('')).not.toBeNull()
    expect(validateHorizon(null)).not.toBeNull()
  })
})

describe('validateMode', () => {
  it('accepts light and deep', () => {
    expect(validateMode('light')).toBeNull()
    expect(validateMode('deep')).toBeNull()
  })

  it('rejects unknown mode', () => {
    expect(validateMode('turbo')).not.toBeNull()
    expect(validateMode('')).not.toBeNull()
  })
})

describe('validateContent', () => {
  it('accepts valid content', () => {
    expect(validateContent('some forecast content')).toBeNull()
  })

  it('rejects empty content', () => {
    expect(validateContent('')).not.toBeNull()
  })

  it('rejects content over 100k chars', () => {
    expect(validateContent('a'.repeat(100_001))).not.toBeNull()
  })

  it('accepts content exactly 100k chars', () => {
    expect(validateContent('a'.repeat(100_000))).toBeNull()
  })

  it('rejects non-string', () => {
    expect(validateContent(123)).not.toBeNull()
  })
})
