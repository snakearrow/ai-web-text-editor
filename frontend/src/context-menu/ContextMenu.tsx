import { useEffect, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { ACTION_LABELS, type AIAction } from '../ai'

interface Props {
  x: number
  y: number
  selectedText: string
  editor: Editor
  onClose: () => void
  onOpenSidebar: (action: AIAction) => void
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

  const handleAction = (action: AIAction) => {
    onOpenSidebar(action)
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
      style={{ top: y, left: x }}
    >
      <div className="flex gap-0">
        {ACTIONS.map((action, index) => (
          <div key={action} className="flex items-center">
            <button
              onClick={() => handleAction(action)}
              className="px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              {ACTION_LABELS[action]}
            </button>
            {index < ACTIONS.length - 1 && (
              <div className="w-px h-5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
