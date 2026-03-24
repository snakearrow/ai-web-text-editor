import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface HeadingNode {
  level: number
  text: string
  pos: number
  chapterId?: string
}

export interface TreeNode extends HeadingNode {
  children: TreeNode[]
}

export function extractHeadings(doc: ProseMirrorNode): HeadingNode[] {
  const headings: HeadingNode[] = []

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      headings.push({
        level: node.attrs.level as number,
        text: node.textContent,
        pos,
        chapterId: node.attrs.chapterId as string | undefined,
      })
    }
  })

  return headings
}

export function buildHeadingTree(headings: HeadingNode[]): TreeNode[] {
  const tree: TreeNode[] = []
  const stack: TreeNode[] = []

  for (const heading of headings) {
    const node: TreeNode = { ...heading, children: [] }

    // Pop items from stack that are >= current level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      tree.push(node)
    } else {
      stack[stack.length - 1].children.push(node)
    }

    stack.push(node)
  }

  return tree
}
