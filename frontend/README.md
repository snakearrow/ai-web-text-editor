# AI Editor

A browser-based AI-first word editor with real-time AI assistance, image support, and DOCX export.

## Features

- **Rich Text Editing** — H1–H3 headings, bold, italic, underline, text alignment
- **Images with Captions** — Insert and resize images with editable captions
- **AI Actions** — Right-click context menu for Rephrase, Fix Grammar, Summarize, Expand
- **Live Preview** — AI sidebar with streaming responses
- **DOCX Export** — Export documents to Word format
- **Navigation Outline** — Jump to any heading from the left sidebar
- **Multi-Provider** — Supports OpenAI and OpenRouter APIs

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`, enter your API key (OpenAI or OpenRouter), and start writing.

## Tech Stack

- **TipTap v2** — ProseMirror-based rich text editor
- **React 19** — UI framework
- **Tailwind CSS** — Styling
- **Heroicons** — Toolbar icons
- **docx** — DOCX export
- **OpenAI SDK** — AI integration
