import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { ImageWithCaption } from './extensions'
import { Toolbar } from './Toolbar'
import { ContextMenu } from '../context-menu/ContextMenu'
import { useState, useRef, useEffect } from 'react'
import { type Editor as TipTapEditor } from '@tiptap/react'
import { type AIAction } from '../ai'

interface Props {
  onAIAction: (action: AIAction, selectedText: string, editor: TipTapEditor) => void
  onEditorReady?: (editor: TipTapEditor) => void
  onTemplateLoaded?: (templateId: string) => void
}

export function Editor({ onAIAction, onEditorReady, onTemplateLoaded }: Props) {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    selectedText: string
  } | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ Heading: false, Paragraph: false }),
      Heading.configure({
        levels: [1, 2, 3],
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            chapterId: {
              default: null,
              parseHTML: element => element.getAttribute('data-chapter-id'),
              renderHTML: attributes => {
                if (!attributes.chapterId) return {}
                return { 'data-chapter-id': attributes.chapterId }
              },
            },
          }
        },
      }),
      Paragraph.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            chapterId: {
              default: null,
              parseHTML: element => element.getAttribute('data-chapter-id'),
              renderHTML: attributes => {
                if (!attributes.chapterId) return {}
                return { 'data-chapter-id': attributes.chapterId }
              },
            },
          }
        },
      }),
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
      <Toolbar editor={editor} onTemplateLoaded={onTemplateLoaded} />

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
          onOpenSidebar={(action) => {
            setContextMenu(null)
            onAIAction(action, contextMenu.selectedText, editor)
          }}
        />
      )}
    </div>
  )
}
