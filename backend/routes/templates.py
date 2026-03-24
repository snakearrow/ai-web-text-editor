from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict
import json

from schemas import Template, GenerateChapterRequest, GenerateChapterResponse
from data_sources import load_data
from generation import generate_chapter

router = APIRouter()

# In-memory template storage (for now)
templates_store: Dict[str, Template] = {}

@router.post("/templates/load")
async def load_template(template: Template) -> Dict:
    """Load a template into the backend"""
    template_id = f"{template.name.lower().replace(' ', '_')}_v{template.version}"
    templates_store[template_id] = template
    return {
        "templateId": template_id,
        "message": f"Template '{template.name}' loaded successfully",
        "chapters": [
            {"id": ch.id, "title": ch.title, "status": ch.status}
            for ch in template.chapters
        ],
    }

@router.get("/templates/{template_id}")
async def get_template(template_id: str) -> Template:
    """Retrieve a loaded template"""
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")
    return templates_store[template_id]

@router.post("/templates/{template_id}/chapters/{chapter_id}/generate")
async def generate_chapter_endpoint(template_id: str, chapter_id: str):
    """Generate a chapter with streaming response"""
    # Retrieve template
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")

    template = templates_store[template_id]

    # Find chapter
    chapter = next((ch for ch in template.chapters if ch.id == chapter_id), None)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Find data source
    data_source = next((ds for ds in template.dataSources if ds.id == chapter.dataSourceId), None)
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    # Load data from source
    try:
        context = load_data(data_source.pythonInterface, data_source.parameters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")

    # Generate chapter with streaming
    async def stream_generation():
        try:
            async for chunk in generate_chapter(chapter.prompt, context):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_generation(), media_type="text/event-stream")

@router.post("/templates/{template_id}/chapters/{chapter_id}/complete")
async def complete_chapter(template_id: str, chapter_id: str, content: str) -> Dict:
    """Mark a chapter as complete with generated content"""
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")

    template = templates_store[template_id]
    chapter = next((ch for ch in template.chapters if ch.id == chapter_id), None)

    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Update chapter status
    chapter.status = "completed"
    chapter.generatedContent = content

    return {
        "chapterId": chapter_id,
        "status": "completed",
        "message": "Chapter saved",
    }
