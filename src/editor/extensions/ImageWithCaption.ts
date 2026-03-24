import { Node, mergeAttributes } from '@tiptap/core'
import type { NodeViewRendererProps } from '@tiptap/core'

export const ImageWithCaption = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src:     { default: null },
      alt:     { default: '' },
      caption: { default: '' },
      width:   { default: null },
      height:  { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'figure' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, src, alt, width } = HTMLAttributes
    return [
      'figure', mergeAttributes({ class: 'image-figure' }),
      ['img', { src, alt, ...(width ? { style: `width: ${width}px` } : {}) }],
      ['figcaption', {}, caption ?? ''],
    ]
  },

  addNodeView() {
    return (props: NodeViewRendererProps) => {
      const { node, editor, getPos } = props

      const updateAttributes = (attrs: Record<string, unknown>) => {
        if (typeof getPos !== 'function') return
        const pos = getPos()
        if (pos === undefined) return
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
        )
      }

      const figure = document.createElement('figure')
      figure.className = 'image-figure'

      // Wrapper keeps the handle anchored to the image edge (figure spans full width)
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'position:relative;display:inline-block;line-height:0'

      const img = document.createElement('img')
      img.src = node.attrs.src as string
      img.alt = (node.attrs.alt as string) ?? ''
      img.style.cssText = 'display:block;max-width:100%;border-radius:0.25rem'
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`

      // Resize handle
      const handle = document.createElement('div')
      handle.style.cssText = [
        'position:absolute;bottom:4px;right:4px',
        'width:10px;height:10px',
        'background:#3b82f6;border-radius:2px',
        'cursor:se-resize;opacity:0;transition:opacity 0.15s',
      ].join(';')

      wrapper.addEventListener('mouseenter', () => { handle.style.opacity = '1' })
      wrapper.addEventListener('mouseleave', () => { handle.style.opacity = '0' })

      handle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const startX     = e.clientX
        const startWidth = img.offsetWidth

        const onMove = (e: MouseEvent) => {
          const newWidth = Math.max(80, startWidth + (e.clientX - startX))
          img.style.width = `${newWidth}px`
        }

        const onUp = () => {
          const w = img.offsetWidth
          const ratio = img.naturalHeight / img.naturalWidth
          updateAttributes({ width: w, height: Math.round(w * ratio) })
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })

      const caption = document.createElement('figcaption')
      caption.contentEditable = 'true'
      caption.textContent = (node.attrs.caption as string) ?? ''
      caption.addEventListener('input', () => {
        updateAttributes({ caption: caption.textContent })
      })

      wrapper.appendChild(img)
      wrapper.appendChild(handle)
      figure.appendChild(wrapper)
      figure.appendChild(caption)

      return { dom: figure }
    }
  },
})
