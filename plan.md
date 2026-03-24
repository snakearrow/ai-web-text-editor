# AI-First Word Editor — Architecture Plan

## Client Context
Built for a surveyor company. Supports structured report writing with AI assistance.
Templates (predefined TipTap JSON documents) will be introduced in a later phase.

---

## Stack

| Concern | Choice |
|---|---|
| Editor | TipTap v2 (ProseMirror-based) |
| UI | React + TypeScript |
| Bundler | Vite |
| AI | OpenAI SDK (browser build) |
| DOCX export | `docx` npm package |
| Styling | Tailwind CSS |

---

## Features

### Editor
- Headings (H1–H4), bold, italic, underline, text alignment
- Insert images with captions (`ImageWithCaption` custom TipTap node)
- Right-click context menu wired to current text selection

### AI
- Sidebar chat panel for freeform AI interaction with document context
- Quick actions via right-click menu: Rephrase, Fix Grammar, Summarize, Expand
- Responses stream into the sidebar; user clicks "Apply" to replace selection
- API key provided by user, stored in `sessionStorage` (no backend)

### Export
- Export document to DOCX via the `docx` npm package
- Walk TipTap JSON tree and map nodes to `docx` primitives (no HTML conversion)
- Supported: headings, bold/italic/underline, text alignment, images with captions

### Templates (Phase 2)
- Templates are TipTap JSON documents registered in a central index
- Picking a template calls `editor.commands.setContent(template.content)`
- Admin-editable templates can be saved to `localStorage` or exported as JSON files
- No backend required

---

## Project Structure

```
src/
├── editor/
│   ├── extensions/
│   │   ├── ImageWithCaption.ts   # custom node: image + figcaption
│   │   ├── ContextMenu.ts        # intercepts contextmenu, reads selection
│   │   └── index.ts
│   ├── Editor.tsx                # TipTap instance + toolbar
│   └── Toolbar.tsx               # formatting controls
├── ai/
│   ├── client.ts                 # OpenAI SDK setup, key from sessionStorage
│   ├── actions.ts                # rephrase, fix grammar, summarize, expand
│   └── stream.ts                 # streaming response helpers
├── sidebar/
│   ├── AISidebar.tsx             # chat panel
│   └── ActionResult.tsx          # streamed output display
├── context-menu/
│   └── ContextMenu.tsx           # floating portal, quick action buttons
├── export/
│   └── docx.ts                   # TipTap JSON → docx package nodes
├── templates/                    # Phase 2
│   ├── index.ts
│   ├── types.ts
│   └── surveyor/
└── App.tsx
```

---

## AI Action Flow

```
User selects text → right-clicks → picks action (e.g. "Rephrase")
  → { action, selectedText, surroundingContext } sent to OpenAI
  → response streams into sidebar
  → user clicks "Apply" → editor replaces selection
```

---

## DOCX Export Node Mapping

| TipTap node | docx primitive |
|---|---|
| `heading` | `Paragraph` with `HeadingLevel` |
| `paragraph` | `Paragraph` |
| `bold` | `TextRun({ bold: true })` |
| `italic` | `TextRun({ italics: true })` |
| `underline` | `TextRun({ underline: {} })` |
| `textAlign` | `Paragraph({ alignment })` |
| `image` | `ImageRun({ data: base64 })` |
| `figcaption` | styled `Paragraph` below image |

---

## Build Order

1. Vite + React + TipTap scaffold with toolbar
2. `ImageWithCaption` custom extension
3. Right-click context menu wired to selection
4. OpenAI streaming integration + sidebar
5. AI quick actions
6. DOCX export
