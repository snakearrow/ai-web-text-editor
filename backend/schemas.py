from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime

class DataSource(BaseModel):
    id: str
    name: str
    pythonInterface: str
    parameters: Dict[str, Any] = {}

class Chapter(BaseModel):
    id: str
    title: str
    dataSourceId: str
    prompt: str
    status: str = "pending"
    generatedContent: Optional[str] = None
    generatedAt: Optional[datetime] = None

class TipTapNode(BaseModel):
    type: str
    attrs: Optional[Dict[str, Any]] = None
    content: Optional[List[Any]] = None
    text: Optional[str] = None

class TipTapDocument(BaseModel):
    type: str = "doc"
    content: List[TipTapNode]

class Template(BaseModel):
    type: str = "template"
    name: str
    description: Optional[str] = None
    version: str = "1.0"
    dataSources: List[DataSource]
    chapters: List[Chapter]
    document: TipTapDocument

class GenerateChapterRequest(BaseModel):
    templateId: str
    chapterId: str

class GenerateChapterResponse(BaseModel):
    chapterId: str
    status: str
    content: Optional[str] = None
    error: Optional[str] = None

class QuickActionRequest(BaseModel):
    action: str  # "summarize", "fix_grammar", "expand", etc.
    text: str
