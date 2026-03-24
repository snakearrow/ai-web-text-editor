import { useEffect, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { ACTION_LABELS, type AIAction } from '../ai'

interface Props {
  x: number
  y: number
  selectedText: string
  editor: Editor
  onClose: () => void
  onOpenSidebar: () => void
}

const ACTIONS = Object.keys(ACTION_LABELS) as AIAction[]

export function ContextMenu({ x, y, selectedText, editor, onClose, onOpenSidebar }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleAction = async (action: AIAction) => {
    onClose()
    onOpenSidebar()
    // Dispatch event so sidebar can pick up the action + text
    window.dispatchEvent(new CustomEvent('ai:action', {
      detail: { action, selectedText, editor },
    }))
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40"
      style={{ top: y, left: x }}
    >
      <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide">AI Actions</div>
      {ACTIONS.map(action => (
        <button
          key={action}
          onClick={() => handleAction(action)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          {ACTION_LABELS[action]}
        </button>
      ))}
    </div>
  )
}
