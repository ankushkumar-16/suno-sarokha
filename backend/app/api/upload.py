"""Audio and screenshot upload endpoints"""
import aiofiles
import logging
import re
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.config import settings
from app.models.schemas import AudioUploadRequest, ScreenshotUploadRequest

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
    "audio/ogg", "audio/flac", "audio/m4a", "audio/aac",
    "audio/x-m4a", "audio/x-wav"
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
}

def sanitize_filename(filename: str) -> str:
    """Remove dangerous chars from filename"""
    safe = re.sub(r'[^\w\-_.]', '_', filename)
    return safe[:100]

def extract_entities(text: str) -> dict:
    """Extract phone numbers, UPI IDs, amounts, URLs from text"""
    entities = {}
    
    # Phone numbers (Indian format)
    phones = re.findall(r'(?:\+91|0)?[6-9]\d{9}', text)
    if phones:
        entities["phone_numbers"] = list(set(phones))
    
    # UPI IDs (typically name@bank or numeric@bank)
    upi = re.findall(r'[\w\.\-]+@[\w\.]+', text)
    upi_filtered = [u for u in upi if len(u.split('@')[-1]) >= 3]
    if upi_filtered:
        entities["upi_ids"] = upi_filtered[:5]
    
    # Amounts in ₹
    amounts = re.findall(r'₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:only|rupees|rs\.?,?\s*|\b)', text, re.IGNORECASE)
    if not amounts:
        amounts = re.findall(r'(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:₹|rupees|rs\.?,?\s*|\b)', text, re.IGNORECASE)
    if amounts:
        entities["amounts"] = [a.replace(",", "") for a in amounts]
    
    # URLs
    urls = re.findall(r'https?://[^\s]+', text)
    if urls:
        entities["urls"] = urls[:5]
    
    # Email addresses
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if emails:
        entities["emails"] = emails[:5]
    
    return entities

@router.post("/upload/audio", tags=["Upload"])
async def upload_audio(
    file: UploadFile = File(...),
    metadata: str = Form(default="{}")
):
    """Upload audio file for scam analysis"""
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio type: {file.content_type}. Allowed: {list(ALLOWED_AUDIO_TYPES)}"
        )
    
    filename = sanitize_filename(file.filename or "audio.wav")
    file_path = settings.upload_dir / filename
    
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    logger.info(f"Audio uploaded: {filename} ({len(content)} bytes)")
    
    return {
        "filename": filename,
        "size_bytes": len(content),
        "content_type": file.content_type,
        "path": str(file_path.relative_to(settings.upload_dir.parent)),
        "message": "Audio uploaded successfully. Ready for transcription."
    }

@router.post("/upload/screenshot", tags=["Upload"])
async def upload_screenshot(
    file: UploadFile = File(...),
    extracted_text: str = Form(default=""),
    metadata: str = Form(default="{}")
):
    """Upload screenshot (scam message screenshot)"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type}. Allowed: {list(ALLOWED_IMAGE_TYPES)}"
        )
    
    filename = sanitize_filename(file.filename or "screenshot.jpg")
    file_path = settings.upload_dir / filename
    
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    logger.info(f"Screenshot uploaded: {filename} ({len(content)} bytes)")
    
    return {
        "filename": filename,
        "size_bytes": len(content),
        "content_type": file.content_type,
        "extracted_text": extracted_text or "(OCR pending)",
        "path": str(file_path.relative_to(settings.upload_dir.parent)),
        "message": "Screenshot uploaded. OCR and analysis ready."
    }

@router.get("/upload/entities/extract", tags=["Upload"])
async def extract_entities_from_text(text: str):
    """Extract phone numbers, UPI IDs, amounts from text"""
    return {"entities": extract_entities(text)}
