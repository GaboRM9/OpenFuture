import { describe, it, expect } from 'vitest'
import { extractPredictions } from '@/lib/extract-predictions'

const DEEP_CONTENT = `
## Summary
Some summary text.

## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
| Q1 2025 | GDP growth exceeds 3% | 70% | No major shocks |
| Q2 2025 | Inflation falls below 4% | 55% | Fed holds rates |

## Risks
Some risk text.
`

const LIGHT_CONTENT = `
## Overview
Some overview text.

## Key Predictions
- **70%** GDP growth exceeds 3% by Q1
- **55%** Inflation falls below 4% by mid-year
- **80%** Fed holds interest rates in Q2

## Caveats
Some caveats.
`

describe('extractPredictions — deep mode (table)', () => {
  it('extracts predictions from a standard table', () => {
    const result = extractPredictions(DEEP_CONTENT)
    expect(result).toHaveLength(2)
  })

  it('extracts correct prediction_text', () => {
    const result = extractPredictions(DEEP_CONTENT)
    expect(result[0].prediction_text).toBe('GDP growth exceeds 3%')
    expect(result[1].prediction_text).toBe('Inflation falls below 4%')
  })

  it('extracts timeframe from first column', () => {
    const result = extractPredictions(DEEP_CONTENT)
    expect(result[0].timeframe).toBe('Q1 2025')
    expect(result[1].timeframe).toBe('Q2 2025')
  })

  it('extracts confidence as a number', () => {
    const result = extractPredictions(DEEP_CONTENT)
    expect(result[0].confidence).toBe(70)
    expect(result[1].confidence).toBe(55)
  })

  it('extracts resolution_criteria from key assumption column', () => {
    const result = extractPredictions(DEEP_CONTENT)
    expect(result[0].resolution_criteria).toBe('No major shocks')
    expect(result[1].resolution_criteria).toBe('Fed holds rates')
  })

  it('clamps confidence above 100 to 100', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
| 2025 | Some claim | 150% | Assumption |
`
    const result = extractPredictions(content)
    expect(result[0].confidence).toBe(100)
  })

  it('extracts digits from a negative-looking confidence value', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
| 2025 | Some claim | -10% | Assumption |
`
    const result = extractPredictions(content)
    // /(\d+)/ matches the digits "10" from "-10%"; negative sign is not captured
    expect(result[0].confidence).toBe(10)
  })

  it('returns null confidence when confidence cell is missing digits', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
| 2025 | Some claim | unknown | Assumption |
`
    const result = extractPredictions(content)
    expect(result[0].confidence).toBeNull()
  })

  it('skips rows with empty prediction text', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
| 2025 |  | 70% | Assumption |
| 2025 | Valid claim | 60% | Assumption |
`
    const result = extractPredictions(content)
    expect(result).toHaveLength(1)
    expect(result[0].prediction_text).toBe('Valid claim')
  })

  it('returns empty array when table section is absent', () => {
    const result = extractPredictions('## Overview\nNo predictions here.')
    expect(result).toEqual([])
  })

  it('returns empty array when table has no data rows', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|
`
    const result = extractPredictions(content)
    expect(result).toEqual([])
  })
})

describe('extractPredictions — light mode (list)', () => {
  it('extracts predictions from a bullet list', () => {
    const result = extractPredictions(LIGHT_CONTENT)
    expect(result).toHaveLength(3)
  })

  it('extracts confidence as a number', () => {
    const result = extractPredictions(LIGHT_CONTENT)
    expect(result[0].confidence).toBe(70)
    expect(result[1].confidence).toBe(55)
    expect(result[2].confidence).toBe(80)
  })

  it('strips only the leading confidence marker, preserving percentages in the body', () => {
    const result = extractPredictions(LIGHT_CONTENT)
    expect(result[0].prediction_text).toBe('GDP growth exceeds 3% by Q1')
  })

  it('sets timeframe and resolution_criteria to null', () => {
    const result = extractPredictions(LIGHT_CONTENT)
    expect(result[0].timeframe).toBeNull()
    expect(result[0].resolution_criteria).toBeNull()
  })

  it('handles items without a confidence marker', () => {
    const content = `
## Key Predictions
- Bitcoin hits $100k by end of year
`
    const result = extractPredictions(content)
    expect(result).toHaveLength(1)
    expect(result[0].confidence).toBeNull()
    expect(result[0].prediction_text).toBe('Bitcoin hits $100k by end of year')
  })

  it('returns empty array when section is absent', () => {
    const result = extractPredictions('## Overview\nNo predictions here.')
    expect(result).toEqual([])
  })
})

describe('extractPredictions — fallback behaviour', () => {
  it('falls back to light list when deep table yields no rows', () => {
    const content = `
## Predictions Table
| Timeframe | Prediction | Confidence | Key Assumption |
|-----------|-----------|-----------|---------------|

## Key Predictions
- **65%** Markets rally in Q3
`
    const result = extractPredictions(content)
    expect(result).toHaveLength(1)
    expect(result[0].prediction_text).toBe('Markets rally in Q3')
  })

  it('returns empty array for empty input', () => {
    expect(extractPredictions('')).toEqual([])
  })
})
