export type ExtractedPrediction = {
  prediction_text: string
  confidence: number | null
  timeframe: string | null
  resolution_criteria: string | null
}

// Parse the Deep mode ## Predictions Table markdown table
// Columns: Timeframe | Prediction | Confidence | Key Assumption
function extractFromDeepTable(content: string): ExtractedPrediction[] {
  const tableMatch = content.match(/##\s*Predictions Table\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!tableMatch) return []

  const rows = tableMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('|'))
    .slice(2) // skip header and separator rows

  return rows.flatMap(row => {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) return []

    const [timeframe, prediction, confidenceRaw, keyAssumption] = cells

    const confidenceMatch = (confidenceRaw ?? '').match(/(\d+)/)
    const confidence = confidenceMatch ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1]))) : null

    return [{
      prediction_text: prediction ?? '',
      confidence,
      timeframe: timeframe ?? null,
      resolution_criteria: keyAssumption ?? null,
    }]
  }).filter(p => p.prediction_text.length > 0)
}

// Parse the Light mode ## Key Predictions list
// Lines like: "- **65%** Bitcoin hits $100k by end of year"
function extractFromLightList(content: string): ExtractedPrediction[] {
  const sectionMatch = content.match(/##\s*Key Predictions\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!sectionMatch) return []

  return sectionMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
    .flatMap(line => {
      const text = line.replace(/^[-\d.]\s*/, '').trim()
      if (!text) return []

      const confidenceMatch = text.match(/\*?\*?(\d+)%\*?\*?/)
      const confidence = confidenceMatch ? Math.min(100, Math.max(0, parseInt(confidenceMatch[1]))) : null
      const prediction_text = text.replace(/\*?\*?\d+%\*?\*?:?\s*/g, '').trim()

      return [{ prediction_text, confidence, timeframe: null, resolution_criteria: null }]
    })
    .filter(p => p.prediction_text.length > 0)
}

export function extractPredictions(content: string): ExtractedPrediction[] {
  const fromDeep = extractFromDeepTable(content)
  if (fromDeep.length > 0) return fromDeep
  return extractFromLightList(content)
}
