"""Background services — transcription, OCR, external APIs"""
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── Whisper transcription (stub — integrate real Whisper in production) ──
async def transcribe_audio_file(file_path: str) -> dict:
    """
    Transcribe audio file using Whisper.
    Production: integrate whisper.cpp or OpenAI Whisper API.
    """
    logger.info(f"Transcribe requested for: {file_path}")
    
    # Stub implementation
    return {
        "text": "Transcription not yet integrated. Connect Whisper for Hindi/English audio.",
        "language": "pending",
        "duration_seconds": 0.0,
    }

# ─── OCR for screenshots ──────────────────────────────────────────────────
async def extract_text_from_screenshot(file_path: str) -> str:
    """
    Extract text from screenshot using OCR.
    Production: integrate Tesseract or Google Vision API.
    """
    logger.info(f"OCR requested for: {file_path}")
    
    # Stub
    return "(OCR not yet integrated — connect Tesseract or Google Vision)"

# ─── External API helpers ─────────────────────────────────────────────────
async def check_phone_number_reputation(phone: str) -> dict:
    """Check if phone number is flagged in scam databases"""
    # TODO: Integrate with Truecaller API or Indian scam databases
    return {"phone": phone, "reported": False, "source": "not_integrated"}

async def generate_voice_warning(text: str, lang: str = "hi") -> bytes:
    """Generate voice warning audio (TTS)"""
    # TODO: Integrate TTS engine (e.g., gTTS, local TTS)
    logger.info(f"TTS requested: {lang} — {text[:50]}...")
    return b"(TTS not yet integrated)"
