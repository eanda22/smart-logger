import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import exercises, sessions, templates

app = FastAPI(title="Smart Logger API", version="1.0.0")

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(exercises.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(templates.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
