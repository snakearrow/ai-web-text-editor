from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from routes import templates, quick_actions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting editor backend...")
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
