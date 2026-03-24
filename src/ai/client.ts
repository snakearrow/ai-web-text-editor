import OpenAI from 'openai'

export type AIProvider = 'openai' | 'openrouter'

const PROVIDER_CONFIG: Record<AIProvider, { baseURL: string; model: string }> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-4o',
  },
}

export function getOpenAIClient(): OpenAI {
  const provider = (sessionStorage.getItem('ai_provider') || 'openai') as AIProvider
  const key = sessionStorage.getItem('ai_api_key')
  if (!key) throw new Error('No API key set')
  const config = PROVIDER_CONFIG[provider]
  return new OpenAI({
    apiKey: key,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  })
}

export function getAIModel(): string {
  const provider = (sessionStorage.getItem('ai_provider') || 'openai') as AIProvider
  return PROVIDER_CONFIG[provider].model
}
