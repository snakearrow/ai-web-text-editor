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

## Current State
- ✅ Backend skeleton complete (FastAPI, routes, schemas, data source interface)
- ✅ Template schema designed
- ⏳ Generation streaming (OpenRouter/OpenAI) — stub only
- ⏳ Data source implementations — stub only
- ⏳ Frontend integration — not started

## Next Steps
1. Implement generation streaming in `generation.py`
2. Implement example data sources
3. Add frontend route to load templates from backend
4. Add chapter generation UI (list + generate buttons)
5. Stream generation to TipTap document
