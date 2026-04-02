import { useState } from 'react'
import { type Editor as TipTapEditor } from '@tiptap/react'
import { type AIAction } from './ai'
import { Editor } from './editor/Editor'
import { AISidebar } from './sidebar/AISidebar'
import { Outline } from './outline/Outline'
import { markdownToHtml } from './utils/markdownToHtml'

interface PendingAction {
  action: AIAction
  selectedText: string
  editor: TipTapEditor
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editor, setEditor] = useState<TipTapEditor | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(null)

  const handleGenerateChapter = async (chapterId: string) => {
    if (!currentTemplateId || !editor) return

    setGeneratingChapterId(chapterId)

    // Find the chapter placeholder
    let chapterPos = -1
    let chapterNode: any = null
    editor.state.doc.descendants((node, pos) => {
      if (node.attrs?.chapterId === chapterId && node.type.name === 'paragraph') {
        chapterPos = pos
        chapterNode = node
      }
    })

    if (chapterPos === -1) {
      alert(`Could not find chapter with ID: ${chapterId}`)
      setGeneratingChapterId(null)
      return
    }

    const url = `http://localhost:8000/api/templates/${currentTemplateId}/chapters/${chapterId}/generate`
    let fullMarkdown = ''

    try {
      const response = await fetch(url, { method: 'POST' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                fullMarkdown += data.chunk
              }
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete messages
            }
          }
        }
      }

      // Convert markdown to HTML and insert, replacing the entire paragraph content
      const html = markdownToHtml(fullMarkdown)
      editor
        .chain()
        .focus()
        .setTextSelection({ from: chapterPos + 1, to: chapterPos + chapterNode.nodeSize - 1 })
        .deleteSelection()
        .insertContent(html)
        .run()
    } catch (error) {
      alert(
        `Failed to generate chapter: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    } finally {
      setGeneratingChapterId(null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">

      {/* Outline sidebar */}
      {editor && (
        <Outline
          editor={editor}
          currentTemplateId={currentTemplateId}
          generatingChapterId={generatingChapterId}
          onGenerateChapter={handleGenerateChapter}
        />
      )}

      {/* Main editor area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Editor
          onAIAction={(action, selectedText, ed) => {
            setSidebarOpen(true)
            setPendingAction({ action, selectedText, editor: ed })
          }}
          onEditorReady={setEditor}
          onTemplateLoaded={setCurrentTemplateId}
        />
      </div>

      {/* AI Sidebar */}
      {sidebarOpen && pendingAction && (
        <AISidebar
          pendingAction={pendingAction}
          onClose={() => {
            setSidebarOpen(false)
            setPendingAction(null)
          }}
        />
      )}
    </div>
  )
}
