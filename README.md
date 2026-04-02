# AI Editor

A browser-based AI-first text editor with real-time AI assistance, templates, custom data sources, and DOCX export.

## Features

- **Rich Text Editing** — H1–H3 headings, bold, italic, underline, text alignment
- **Images with Captions** — Insert and resize images with editable captions
- **AI Quick Actions** — Right-click context menu for summarize, fix grammar, expand, improve, shorten
- **Templates** — Pre-built document templates with structured chapters
- **Chapter Generation** — Auto-generate chapters with custom data sources, rendered as markdown
- **Custom Data Sources** — Extensible interface for pulling data from any source (APIs, webpages, databases, etc.)
- **DOCX Export** — Export documents to Word format
- **Navigation Outline** — Jump to any heading from the left sidebar with chapter generation icons
- **Multi-Provider** — Supports OpenAI and OpenRouter APIs
- **Streaming Responses** — Real-time output for AI generation

## Architecture

The application is split into two parts:

- **Frontend** — React + TipTap editor running at `http://localhost:5173`
- **Backend** — Python FastAPI server at `http://localhost:8000` managing LLM credentials and data sources

API keys are stored only in the backend's `.env` file for security.

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Create a `.env` file with your API keys:
```bash
# .env
OPENROUTER_API_KEY=your_key_here
# Or use OpenAI:
# OPENAI_API_KEY=your_key_here

LLM_PROVIDER=openrouter
LLM_MODEL=minimax/minimax-m2.7
DEBUG=False
```

4. Source the virtual environment and run the backend:
```bash
source .venv/bin/activate
python -m uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

Visit `http://localhost:5173` and start creating documents.

## Tech Stack

### Frontend
- **React 19** — UI framework
- **TipTap v2** — ProseMirror-based rich text editor
- **Tailwind CSS** — Styling
- **Heroicons** — Toolbar icons
- **docx** — DOCX export
- **markdown-it** — Markdown rendering

### Backend
- **FastAPI** — Web framework
- **Pydantic** — Configuration management
- **OpenAI SDK** — LLM integration
- **BeautifulSoup** — HTML parsing for web data sources
- **requests** — HTTP client

## Custom Templates & Data Sources

### What is a Template?

A template is a JSON file that defines a structured document with chapters. Each chapter has:
- A `prompt` — Instructions for the AI on what to generate
- A `dataSourceId` — Reference to where to fetch context data
- An `id` — Unique identifier for the chapter

Templates appear in the "📋 Templates" button in the toolbar.

### Adding a Custom Template

1. Create a JSON file in `backend/templates/`. For example, `my-template.json`:

```json
{
  "type": "template",
  "name": "My Template",
  "description": "A custom template for my workflow",
  "version": "1.0",
  "dataSources": [
    {
      "id": "my_source",
      "name": "My Data Source",
      "pythonInterface": "data_sources.custom::fetch_my_data",
      "parameters": {
        "key": "value"
      }
    }
  ],
  "chapters": [
    {
      "id": "chapter_1",
      "title": "My Chapter",
      "dataSourceId": "my_source",
      "prompt": "Generate content based on the provided data.",
      "status": "pending"
    }
  ],
  "document": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "My Document" }]
      },
      {
        "type": "heading",
        "attrs": { "level": 2, "chapterId": "chapter_1" },
        "content": [{ "type": "text", "text": "My Chapter" }]
      },
      {
        "type": "paragraph",
        "attrs": { "chapterId": "chapter_1" },
        "content": [{ "type": "text", "text": "[Generate chapter]" }]
      }
    ]
  }
}
```

### Adding a Custom Data Source

1. Create a new Python class in `backend/data_sources.py` that extends `DataSourceInterface`:

```python
class MyDataSource(DataSourceInterface):
    def fetch(self, key: str = "", **kwargs) -> str:
        """
        Fetch data from your custom source.

        Args:
            key: The parameter passed from the template

        Returns:
            str: The data as a string (will be passed to the LLM)
        """
        # Your implementation here
        data = fetch_from_api(key)
        return data
```

2. Register it in the `DATA_SOURCE_REGISTRY`:

```python
DATA_SOURCE_REGISTRY: Dict[str, DataSourceInterface] = {
    "data_sources.custom::fetch_my_data": MyDataSource(),
    # ... other sources
}
```

3. Reference it in your template's `dataSources` section using the registry key:
```json
"pythonInterface": "data_sources.custom::fetch_my_data"
```

### Example: Web Page Data Source

The editor comes with a built-in `WebpageDataSource` that fetches and parses HTML from URLs.

**Register it:**
```python
"data_sources.web::fetch_html_content": WebpageDataSource()
```

**Use it in a template:**
```json
{
  "dataSources": [
    {
      "id": "webpage",
      "name": "Webpage Content",
      "pythonInterface": "data_sources.web::fetch_html_content",
      "parameters": {
        "url": "https://example.com/article"
      }
    }
  ],
  "chapters": [
    {
      "prompt": "Write a blog post based on the provided webpage content.",
      "dataSourceId": "webpage"
    }
  ]
}
```

## Environment Variables

### Backend (.env)

```
# LLM Credentials (choose one)
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# LLM Configuration
LLM_PROVIDER=openrouter  # or "openai"
LLM_MODEL=minimax/minimax-m2.7

# Debug Mode
DEBUG=False
```

All environment variables are required based on your chosen provider. The backend validates this at startup.
