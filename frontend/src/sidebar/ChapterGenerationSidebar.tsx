import { useEffect, useRef } from 'react'
import { type Editor } from '@tiptap/react'

interface PendingChapter {
  chapterId: string
  templateId: string
  output: string
  done: boolean
  error?: string
  editor: Editor
}

interface Props {
  pendingChapter: PendingChapter
  onClose: () => void
}

export function ChapterGenerationSidebar({ pendingChapter, onClose }: Props) {
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [pendingChapter.output])


  return (
    <div className="w-80 flex flex-col bg-white border-l border-gray-200 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="font-semibold text-gray-800">Generate Chapter</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={outputRef}>
        {!pendingChapter.output && !pendingChapter.error && (
          <p className="text-sm text-gray-400">Generating chapter...</p>
        )}

        {pendingChapter.error ? (
          <div className="text-sm text-red-600 bg-red-50 rounded p-2">
            {pendingChapter.error}
          </div>
        ) : (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {pendingChapter.output}
            {!pendingChapter.done && (
              <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {pendingChapter.done && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          {pendingChapter.error ? 'Generation failed' : 'Content inserted into document'}
        </div>
      )}
    </div>
  )
}
