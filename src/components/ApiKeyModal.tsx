import { useEffect, useState } from 'react'

type Provider = 'openai' | 'openrouter'

const PROVIDER_INFO: Record<Provider, { label: string; placeholder: string; note: string }> = {
  openai: {
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    note: 'Your key is stored only in session storage and never sent anywhere except OpenAI.',
  },
  openrouter: {
    label: 'OpenRouter API Key',
    placeholder: 'sk-or-...',
    note: 'Your key is stored only in session storage and never sent anywhere except OpenRouter.',
  },
}

interface Props {
  open: boolean
  onClose: () => void
  isRequired?: boolean
}

export function ApiKeyModal({ open, onClose, isRequired = false }: Props) {
  const [provider, setProvider] = useState<Provider>('openai')
  const [key, setKey] = useState('')

  useEffect(() => {
    if (open) {
      const savedProvider = (sessionStorage.getItem('ai_provider') || 'openai') as Provider
      const savedKey = sessionStorage.getItem('ai_api_key') || ''
      setProvider(savedProvider)
      setKey(savedKey)
    }
  }, [open])

  if (!open) return null

  const save = () => {
    if (!key.trim()) return
    sessionStorage.setItem('ai_provider', provider)
    sessionStorage.setItem('ai_api_key', key.trim())
    onClose()
  }

  const info = PROVIDER_INFO[provider]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold">AI Configuration</h2>

        {/* Provider selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Provider</label>
          <div className="flex gap-3">
            {(['openai', 'openrouter'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  provider === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'openai' ? 'OpenAI' : 'OpenRouter'}
              </button>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{info.label}</label>
          <input
            type="password"
            placeholder={info.placeholder}
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <p className="text-xs text-gray-500">{info.note}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {!isRequired && (
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={save}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {isRequired ? 'Save & Continue' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
