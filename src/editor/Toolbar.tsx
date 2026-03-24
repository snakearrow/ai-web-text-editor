import { type Editor } from '@tiptap/react'
import { Bars3Icon, Bars3BottomLeftIcon, Bars3BottomRightIcon, Bars3CenterLeftIcon, H1Icon, H2Icon, H3Icon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/20/solid'
import { exportToDocx } from '../export/docx'
import { TemplateSelector } from '../templates/TemplateSelector'

interface Props {
  editor: Editor
  onSettingsClick: () => void
}

const btn = (active: boolean) =>
  `px-2 py-1 rounded text-sm font-medium transition-colors ${
    active
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 hover:bg-gray-200'
  }`

export function Toolbar({ editor, onSettingsClick }: Props) {
  const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        editor.chain().focus().insertContent({
          type: 'imageWithCaption',
          attrs: { src: reader.result as string, alt: file.name, caption: '' },
        }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200 flex-wrap">
      {/* Headings */}
      {([1, 2, 3] as const).map(level => {
        const IconComponent = level === 1 ? H1Icon : level === 2 ? H2Icon : H3Icon
        return (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={btn(editor.isActive('heading', { level }))}
            title={`Heading ${level}`}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        )
      })}

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Inline formatting */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
        <strong>B</strong>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
        <em>I</em>
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))}>
        <span className="underline">U</span>
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Undo / Redo */}
      <button onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Undo">
        <ArrowUturnLeftIcon className="w-4 h-4" />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Redo">
        <ArrowUturnRightIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Alignment */}
      {(['left', 'center', 'right', 'justify'] as const).map(align => (
        <button
          key={align}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          className={btn(editor.isActive({ textAlign: align }))}
          title={`Align ${align}`}
        >
          {align === 'left' && <Bars3BottomLeftIcon className="w-4 h-4" />}
          {align === 'center' && <Bars3CenterLeftIcon className="w-4 h-4" />}
          {align === 'right' && <Bars3BottomRightIcon className="w-4 h-4" />}
          {align === 'justify' && <Bars3Icon className="w-4 h-4" />}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Image */}
      <button onClick={insertImage} className={btn(false)} title="Insert image">
        🖼
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Template Selector */}
      <TemplateSelector editor={editor} />

      {/* Export & Settings */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors text-lg"
          title="AI Settings"
        >
          ⚙️
        </button>
        <button
          onClick={() => exportToDocx(editor)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Export DOCX
        </button>
      </div>
    </div>
  )
}
