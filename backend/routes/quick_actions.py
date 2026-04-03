from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict
import json

from schemas import QuickActionRequest
from generation import generate_chapter
from prompts_loader import load_prompt

router = APIRouter()

# Prompts for each quick action
ACTION_PROMPTS: Dict[str, str] = {
    "summarize": "Summarize the following text concisely, capturing the main points:",
    "fix_grammar": "Fix any grammar, spelling, and punctuation errors in the following text. Return only the corrected text:",
    "expand": "Expand the following text with more detail and context, maintaining the original meaning:",
    "improve": "Improve the clarity, tone, and overall quality of the following text:",
    "shorten": "Shorten the following text while keeping the essential information:",
}

@router.post("/quick-action")
async def quick_action(request: QuickActionRequest):
    """Execute a quick AI action (summarize, fix grammar, etc.) with streaming response"""

    # Validate action
    if request.action not in ACTION_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action: {request.action}. Available actions: {list(ACTION_PROMPTS.keys())}"
        )

    # Get the prompt for this action
    action_prompt = ACTION_PROMPTS[request.action]
    full_prompt = f"{action_prompt}\n\n{request.text}"

    # Generate with streaming
    async def stream_action():
        try:
            async for chunk in generate_chapter(full_prompt, ""):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_action(), media_type="text/event-stream")
