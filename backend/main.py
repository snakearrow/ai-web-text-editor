from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from routes import templates, quick_actions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting editor backend...")

    # Validate LLM configuration
    if settings.LLM_PROVIDER == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("LLM_PROVIDER is set to 'openai' but OPENAI_API_KEY is not configured in .env")
    elif settings.LLM_PROVIDER == "openrouter":
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("LLM_PROVIDER is set to 'openrouter' but OPENROUTER_API_KEY is not configured in .env")
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}. Must be 'openai' or 'openrouter'")

    print(f"✓ Using LLM provider: {settings.LLM_PROVIDER}")
    yield
    # Shutdown
    print("Shutting down editor backend...")

app = FastAPI(title="Editor Backend", lifespan=lifespan)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(templates.router, prefix="/api", tags=["templates"])
app.include_router(quick_actions.router, prefix="/api", tags=["quick-actions"])

@app.get("/health")
async def health():
    return {"status": "ok"}
