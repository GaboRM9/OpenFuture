import Anthropic from '@anthropic-ai/sdk'
import { ORACLE_SYSTEM_PROMPT, buildForecastPrompt } from '@/lib/oracle-prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { topic, horizon } = await request.json()

  if (!topic || !horizon) {
    return new Response('Missing topic or horizon', { status: 400 })
  }

  const encoder = new TextEncoder()
  let fullContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          system: ORACLE_SYSTEM_PROMPT,
          tools: [{ type: 'web_search_20260209', name: 'web_search' }],
          messages: [
            { role: 'user', content: buildForecastPrompt(topic, horizon) },
          ],
        })

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullContent += text
            controller.enqueue(encoder.encode(text))
          }
        }

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
