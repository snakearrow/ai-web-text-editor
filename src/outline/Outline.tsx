import { useEffect, useState } from 'react'
import { type Editor } from '@tiptap/react'
import { extractHeadings, buildHeadingTree, type TreeNode } from './outlineUtils'

interface Props {
  editor: Editor
}

export function Outline({ editor }: Props) {
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
        <TreeRenderer tree={tree} onNavigate={handleNavigate} />
      )}
    </div>
  )
}

function TreeRenderer({
  tree,
  onNavigate,
}: {
  tree: TreeNode[]
  onNavigate: (pos: number) => void
}) {
  return (
    <ul className="space-y-0 text-sm">
      {tree.map(node => (
        <TreeItem key={node.pos} node={node} onNavigate={onNavigate} />
      ))}
    </ul>
  )
}

function TreeItem({
  node,
  onNavigate,
}: {
  node: TreeNode
  onNavigate: (pos: number) => void
}) {
  return (
    <>
      <li>
        <button
          onClick={() => onNavigate(node.pos)}
          className="block w-full text-left px-2 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded text-sm transition-colors truncate"
          style={{ paddingLeft: `${(node.level - 1) * 12 + 8}px` }}
          title={node.text}
        >
          {node.text || `Heading ${node.level}`}
        </button>
      </li>
      {node.children.length > 0 && (
        <ul className="space-y-0">
          {node.children.map(child => (
            <TreeItem key={child.pos} node={child} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </>
  )
}
