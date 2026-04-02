import { useEffect, useRef, useState } from 'react'
import { type Editor } from '@tiptap/react'
import { streamAIAction, ACTION_LABELS, type AIAction } from '../ai'
import { markdownToHtml } from '../utils/markdownToHtml'

interface Props {
  pendingAction: {
    action: AIAction
    selectedText: string
    editor: Editor
  } | null
  onClose: () => void
}

interface Result {
  action: AIAction
  selectedText: string
  output: string
  done: boolean
  error?: string
  editor: Editor
}

export function AISidebar({ pendingAction, onClose }: Props) {
  const [result, setResult] = useState<Result | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pendingAction) return

    const next: Result = { ...pendingAction, output: '', done: false }
    setResult(next)

    streamAIAction(
      pendingAction.action,
      pendingAction.selectedText,
      chunk => setResult(r => r ? { ...r, output: r.output + chunk } : r),
      ()    => setResult(r => r ? { ...r, done: true } : r),
    ).catch(error => {
      setResult(r => r ? { ...r, done: true, error: error.message } : r)
    })
  }, [pendingAction])

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [result?.output])

  const applyResult = () => {
    if (!result?.done) return
    const html = markdownToHtml(result.output)
    result.editor.chain().focus().insertContentAt(
      {
        from: result.editor.state.selection.from,
        to:   result.editor.state.selection.to,
      },
      html,
    ).run()
    setResult(null)
  }

  return (
    <div className="w-80 flex flex-col bg-white border-l border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="font-semibold text-gray-800">AI Assistant</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={outputRef}>
        {!result && (
          <p className="text-sm text-gray-400">
            Select text in the editor, then right-click to run an AI action.
          </p>
        )}

        {result && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {ACTION_LABELS[result.action]}
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 line-clamp-3">
              "{result.selectedText}"
            </div>
            {result.error ? (
              <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                {result.error}
              </div>
            ) : (
              <div className="text-sm text-gray-800 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(result.output) }} />
                {!result.done && <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply button */}
      {result?.done && !result.error && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={applyResult}
            className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Apply to Document
          </button>
        </div>
      )}
    </div>
  )
}
