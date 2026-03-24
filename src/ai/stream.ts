import { getOpenAIClient, getAIModel } from './client'
import { buildPrompt, type AIAction } from './actions'

export async function streamAIAction(
  action: AIAction,
  selectedText: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
) {
  const client = getOpenAIClient()
  const model = getAIModel()
  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      { role: 'system', content: 'You are a professional writing assistant.' },
      { role: 'user', content: buildPrompt(action, selectedText) },
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) onChunk(delta)
  }

  onDone()
}
