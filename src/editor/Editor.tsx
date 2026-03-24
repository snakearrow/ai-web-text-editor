import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { ImageWithCaption } from './extensions'
import { Toolbar } from './Toolbar'
import { ContextMenu } from '../context-menu/ContextMenu'
import { useState, useRef, useEffect } from 'react'
import { type Editor as TipTapEditor } from '@tiptap/react'

interface Props {
  onAIAction: () => void
  onEditorReady?: (editor: TipTapEditor) => void
  onSettingsClick?: () => void
}

export function Editor({ onAIAction, onEditorReady, onSettingsClick }: Props) {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    selectedText: string
  } | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your report…' }),
      ImageWithCaption,
    ],
    editorProps: {
      attributes: { class: 'tiptap prose max-w-none' },
    },
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) return null

  const handleContextMenu = (e: React.MouseEvent) => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' ',
    )
    if (!selectedText.trim()) return
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, selectedText })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toolbar editor={editor} onSettingsClick={onSettingsClick || (() => {})} />

      <div
        ref={editorRef}
        className="flex-1 overflow-y-auto bg-white pt-12"
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        <div className="max-w-3xl mx-auto min-h-full shadow-sm border border-gray-100">
          <EditorContent editor={editor} />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedText={contextMenu.selectedText}
          editor={editor}
          onClose={() => setContextMenu(null)}
          onOpenSidebar={onAIAction}
        />
      )}
    </div>
  )
}
