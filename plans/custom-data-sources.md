# Custom Data Sources USP

## Vision
Enable users to generate entire chapters based on custom databases/content and user-specified prompts. Templates define document structure, data sources, and chapter prompts. Each chapter can be regenerated independently as source data changes.

## Architecture

### Frontend (React/TipTap)
- Load template JSON from backend
- Display as TipTap document with chapter placeholders
- Show chapter list with "Generate" button per chapter
- Stream generated content into document
- Allow regeneration (re-run generation for a chapter)

### Backend (FastAPI)
- **Template Management**: Load, store, retrieve templates
- **Data Sources**: Python module interface pattern
  - Registry maps interface strings to implementations
  - Each source implements `fetch(**params)` method
  - Users write custom modules for their databases
- **Generation**: Stream LLM output to frontend
  - Fetch context from data source
  - Call LLM with prompt + context
  - Handle streaming response

## Template Schema
```json
{
  "type": "template",
  "name": "...",
  "dataSources": [
    {
      "id": "source_id",
      "pythonInterface": "module_path::function_name",
      "parameters": {...}
    }
  ],
  "chapters": [
    {
      "id": "ch_1",
      "title": "...",
      "dataSourceId": "...",
      "prompt": "..."
    }
  ],
  "document": { /* TipTap doc with chapterId attrs */ }
}
```

## Current State (as of 2026-03-24)

### ✅ Completed
- Backend skeleton complete (FastAPI, routes, schemas)
- Template schema designed and validated
- Generation streaming implemented (OpenRouter/OpenAI async support)
- Template file system (2 example templates: blog-post, product-guide)
- Backend routes: `/api/templates` (list), `/api/templates/{id}/load` (load)
- Heading extension enhanced to preserve `chapterId` attribute
- Frontend template selector dropdown (📋 button in toolbar)
- Template document loading into TipTap editor
- Outline sidebar integration with chapter detection
- Chapter generation UI: sparkles icon next to chapters
- Separate clickable areas: text for navigation, icon for generation
- Event infrastructure: `onGenerateChapter` callback wired through component hierarchy

### ⏳ In Progress
- Chapter generation endpoint integration (callback currently logs to console)
- Streaming generated content into document
- Data source implementations (currently stub in generation.py)

## Next Steps (Prioritized)

### Phase 1: Wire Up Generation (core functionality)
1. Implement `onGenerateChapter` handler in App.tsx
   - Call backend: `POST /api/templates/{templateId}/chapters/{chapterId}/generate`
   - Handle SSE streaming (like quick actions already do)
   - Insert generated content into document at chapter placeholder
   - Update chapter status to "completed"

2. Test end-to-end: click icon → stream content → see it in document

### Phase 2: Data Sources (enable custom content)
1. Implement example data sources (currently raise NotImplementedError)
   - `fetch_blog_outline()` - return sample outline
   - `fetch_product_data()` - return sample product info
2. Verify chapter generation can use data source context
3. Document how users add custom data sources

### Phase 3: Polish & Extension
1. Add chapter status tracking (pending/generating/completed)
2. Regeneration support (re-run generation for a chapter)
3. Better error handling and UI feedback
4. Optional: DOCX export with generated content
