import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Suno Suraksha - AI Anti-Scam Copilot"
    debug: bool = True
    api_prefix: str = "/api/v1"
    
    # Whisper settings (local inference)
    whisper_model: str = "base"  # tiny, base, small, medium, large
    whisper_language: str = "hi"  # Hindi primary
    
    # Risk engine
    default_risk_threshold: int = 50  # 0-100, above = suspicious
    
    # Storage (local filesystem for MVP)
    upload_dir: Path = Path(__file__).parent.parent / "uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure upload directory exists
settings.upload_dir.mkdir(parents=True, exist_ok=True)
