import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  ImageRun, AlignmentType,
} from 'docx'
import { type Editor } from '@tiptap/react'
import { type JSONContent } from '@tiptap/core'

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
}

const ALIGN_MAP: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
  left:    AlignmentType.LEFT,
  center:  AlignmentType.CENTER,
  right:   AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
}

function getAlignment(node: JSONContent): typeof AlignmentType[keyof typeof AlignmentType] | undefined {
  const align = node.attrs?.textAlign as string | undefined
  return align ? ALIGN_MAP[align] : undefined
}

function inlineToRuns(node: JSONContent): TextRun[] {
  if (node.type === 'text') {
    const marks = node.marks ?? []
    const bold      = marks.some(m => m.type === 'bold')
    const italics   = marks.some(m => m.type === 'italic')
    const underline = marks.some(m => m.type === 'underline') ? {} : undefined
    return [new TextRun({ text: node.text ?? '', bold, italics, underline })]
  }
  return (node.content ?? []).flatMap(inlineToRuns)
}

async function nodeToDocxElements(node: JSONContent): Promise<Paragraph[]> {
  switch (node.type) {
    case 'heading': {
      const level = HEADING_MAP[node.attrs?.level ?? 1]
      const runs = (node.content ?? []).flatMap(inlineToRuns)
      return [new Paragraph({ heading: level, children: runs, alignment: getAlignment(node) })]
    }

    case 'paragraph': {
      const runs = (node.content ?? []).flatMap(inlineToRuns)
      return [new Paragraph({ children: runs, alignment: getAlignment(node) })]
    }

    case 'imageWithCaption': {
      const src: string = node.attrs?.src ?? ''
      const caption: string = node.attrs?.caption ?? ''

      const base64 = src.replace(/^data:image\/\w+;base64,/, '')
      const binary  = atob(base64)
      const bytes   = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

      const w = (node.attrs?.width  as number | null) ?? 400
      const h = (node.attrs?.height as number | null) ?? 300

      const imgParagraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: bytes.buffer as ArrayBuffer,
            transformation: { width: w, height: h },
            type: 'png',
          }),
        ],
      })

      const captionParagraph = new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: caption, italics: true, size: 20, color: '666666' })],
      })

      return [imgParagraph, captionParagraph]
    }

    case 'doc':
    case 'bulletList':
    case 'orderedList':
    case 'listItem':
    case 'blockquote': {
      const children = await Promise.all((node.content ?? []).map(nodeToDocxElements))
      return children.flat()
    }

    default:
      return []
  }
}

export async function exportToDocx(editor: Editor) {
  const json = editor.getJSON()
  const elements = await nodeToDocxElements(json)

  const doc = new Document({
    sections: [{ children: elements }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'document.docx'
  a.click()
  URL.revokeObjectURL(url)
}
