import { useState } from 'react'
import { type Editor as TipTapEditor } from '@tiptap/react'
import { type AIAction } from './ai'
import { Editor } from './editor/Editor'
import { AISidebar } from './sidebar/AISidebar'
import { ApiKeyModal } from './components/ApiKeyModal'
import { Outline } from './outline/Outline'

interface PendingAction {
  action: AIAction
  selectedText: string
  editor: TipTapEditor
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editor, setEditor] = useState<TipTapEditor | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)

  // Show settings modal on first visit (no API key set)
  const hasApiKey = !!sessionStorage.getItem('ai_api_key')
  const showForcedSettings = !hasApiKey && editor !== null

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* API Key Modal - forced on first visit, can be opened via settings button */}
      <ApiKeyModal
        open={settingsOpen || showForcedSettings}
        onClose={() => setSettingsOpen(false)}
        isRequired={showForcedSettings}
      />

      {/* Outline sidebar */}
      {editor && (
        <Outline
          editor={editor}
          currentTemplateId={currentTemplateId}
          onGenerateChapter={(chapterId) => {
            console.log('Generate chapter:', chapterId)
            // TODO: implement chapter generation
          }}
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
          onSettingsClick={() => setSettingsOpen(true)}
          onTemplateLoaded={setCurrentTemplateId}
        />
      </div>

      {/* AI Sidebar */}
      {sidebarOpen && (
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
