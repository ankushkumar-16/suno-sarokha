import logging
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="AI-powered anti-scam copilot for Indian families",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # CORS for frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Static files for uploads
    if settings.upload_dir.exists():
        app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    
    # Include routers
    from app.api import analysis, health, upload
    
    app.include_router(health.router, tags=["Health"])
    app.include_router(upload.router, prefix=settings.api_prefix, tags=["Upload"])
    app.include_router(analysis.router, prefix=settings.api_prefix, tags=["Analysis"])
    
    @app.get("/")
    async def root():
        return {
            "name": settings.app_name,
            "status": "running",
            "docs": "/docs",
            "tagline": "Pehle verify karo, phir pay karo"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": "0.1.0"}
    
    return app

app = create_app()
