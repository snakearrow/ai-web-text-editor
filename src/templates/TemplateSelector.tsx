import { useState, useEffect } from 'react'
import { type Editor } from '@tiptap/react'

interface TemplateInfo {
  id: string
  name: string
  description: string
  filename: string
}

interface Props {
  editor: Editor
  onTemplateLoaded?: (templateId: string) => void
}

const BACKEND_URL = 'http://localhost:8000/api'

export function TemplateSelector({ editor, onTemplateLoaded }: Props) {
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/templates`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/templates/${templateId}/load`)
      const template = await response.json()

      // Load template document into editor, emitUpdate=true so the Outline picks up the changes
      editor.commands.setContent({ type: 'doc', content: template.document.content }, true)

      if (onTemplateLoaded) {
        onTemplateLoaded(templateId)
      }

      setOpen(false)
    } catch (error) {
      console.error('Failed to load template:', error)
      alert('Failed to load template')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
        title="Load template"
      >
        📋 Templates
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-48">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No templates available</div>
          ) : (
            <ul className="py-1">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    onClick={() => loadTemplate(template.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
