import { type AIAction } from './actions'

const BACKEND_URL = 'http://localhost:8000/api'

export async function streamAIAction(
  action: AIAction,
  selectedText: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
) {
  try {
    const response = await fetch(`${BACKEND_URL}/quick-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        text: selectedText,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.chunk) {
              onChunk(json.chunk)
            } else if (json.error) {
              throw new Error(json.error)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    }

    onDone()
  } catch (error) {
    console.error('AI action failed:', error)
    throw error
  }
}
