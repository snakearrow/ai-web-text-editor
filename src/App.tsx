import { useState } from 'react'
import { type Editor as TipTapEditor } from '@tiptap/react'
import { Editor } from './editor/Editor'
import { AISidebar } from './sidebar/AISidebar'
import { ApiKeyModal } from './components/ApiKeyModal'
import { Outline } from './outline/Outline'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editor, setEditor] = useState<TipTapEditor | null>(null)

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
      {editor && <Outline editor={editor} />}

      {/* Main editor area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Editor
          onAIAction={() => setSidebarOpen(true)}
          onEditorReady={setEditor}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      </div>

      {/* AI Sidebar */}
      {sidebarOpen && (
        <AISidebar onClose={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
