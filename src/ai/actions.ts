export type AIAction = 'rephrase' | 'fix_grammar' | 'summarize' | 'expand'

export const ACTION_LABELS: Record<AIAction, string> = {
  rephrase:    'Rephrase',
  fix_grammar: 'Fix Grammar',
  summarize:   'Summarize',
  expand:      'Expand',
}

const PROMPTS: Record<AIAction, (text: string) => string> = {
  rephrase:    t => `Rephrase the following text. Return only the rephrased text, no explanation.\n\n${t}`,
  fix_grammar: t => `Fix grammar and spelling in the following text. Return only the corrected text.\n\n${t}`,
  summarize:   t => `Summarize the following text concisely. Return only the summary.\n\n${t}`,
  expand:      t => `Expand the following text with more detail. Return only the expanded text.\n\n${t}`,
}

export function buildPrompt(action: AIAction, selectedText: string): string {
  return PROMPTS[action](selectedText)
}
