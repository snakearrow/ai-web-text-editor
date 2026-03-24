import { useEffect, useState } from 'react'
import { type Editor } from '@tiptap/react'
import { SparklesIcon } from '@heroicons/react/20/solid'
import { extractHeadings, buildHeadingTree, type TreeNode } from './outlineUtils'

interface Props {
  editor: Editor
  currentTemplateId?: string | null
  onGenerateChapter?: (chapterId: string) => void
}

export function Outline({ editor, currentTemplateId, onGenerateChapter }: Props) {
  const [tree, setTree] = useState<TreeNode[]>([])

  useEffect(() => {
    const updateHandler = () => {
      const headings = extractHeadings(editor.state.doc)
      const newTree = buildHeadingTree(headings)
      setTree(newTree)
    }
    updateHandler()
    editor.on('update', updateHandler)
    return () => {
      editor.off('update', updateHandler)
    }
  }, [editor])

  const handleNavigate = (pos: number) => {
    editor.commands.setTextSelection(pos)
    editor.view.focus()
    // Scroll the selection into view
    editor.view.dispatch(editor.state.tr.scrollIntoView())
  }

  return (
    <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
        Contents
      </div>
      {tree.length === 0 ? (
        <div className="text-xs text-gray-400">No headings yet</div>
      ) : (
        <TreeRenderer tree={tree} onNavigate={handleNavigate} onGenerateChapter={onGenerateChapter} />
      )}
    </div>
  )
}

function TreeRenderer({
  tree,
  onNavigate,
  onGenerateChapter,
}: {
  tree: TreeNode[]
  onNavigate: (pos: number) => void
  onGenerateChapter?: (chapterId: string) => void
}) {
  return (
    <ul className="space-y-0 text-sm">
      {tree.map(node => (
        <TreeItem key={node.pos} node={node} onNavigate={onNavigate} onGenerateChapter={onGenerateChapter} />
      ))}
    </ul>
  )
}

function TreeItem({
  node,
  onNavigate,
  onGenerateChapter,
}: {
  node: TreeNode
  onNavigate: (pos: number) => void
  onGenerateChapter?: (chapterId: string) => void
}) {
  return (
    <>
      <li>
        <div className="flex items-center gap-1 px-2 py-1.5 rounded text-sm hover:bg-blue-50 transition-colors" style={{ paddingLeft: `${(node.level - 1) * 12 + 8}px` }}>
          <button
            onClick={() => onNavigate(node.pos)}
            className="flex-1 text-left text-gray-700 hover:text-blue-700 truncate"
            title={node.text}
          >
            {node.text || `Heading ${node.level}`}
          </button>
          {node.chapterId && onGenerateChapter && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGenerateChapter(node.chapterId!)
              }}
              className="p-1 text-gray-500 hover:text-blue-600 flex-shrink-0 transition-colors"
              title="Generate chapter"
            >
              <SparklesIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </li>
      {node.children.length > 0 && (
        <ul className="space-y-0">
          {node.children.map(child => (
            <TreeItem key={child.pos} node={child} onNavigate={onNavigate} onGenerateChapter={onGenerateChapter} />
          ))}
        </ul>
      )}
    </>
  )
}
