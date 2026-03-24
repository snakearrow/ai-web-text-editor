export type AIAction = 'summarize' | 'fix_grammar' | 'expand' | 'improve' | 'shorten'

export const ACTION_LABELS: Record<AIAction, string> = {
  summarize:   'Summarize',
  fix_grammar: 'Fix Grammar',
  expand:      'Expand',
  improve:     'Improve',
  shorten:     'Shorten',
}
