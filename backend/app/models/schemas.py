import pydantic
from pydantic import BaseModel, Field

# Request models
class AnalysisRequest(BaseModel):
    """Input for scam analysis"""
    content: str = Field(..., description="WhatsApp text or transcribed audio text")
    media_type: str = Field(default="text", description="text, audio_transcript, screenshot_text")
    metadata: dict = Field(default_factory=dict, description="Extra context: phone numbers, UPI IDs, etc.")

class AudioUploadRequest(BaseModel):
    """Audio file upload request (metadata only, file via multipart)"""
    filename: str
    content_type: str

class ScreenshotUploadRequest(BaseModel):
    """Screenshot upload request (metadata only)"""
    filename: str
    content_type: str
    extracted_text: str = Field(default="", description="OCR extracted text if available")

# Response models
class RiskSignal(BaseModel):
    """A detected scam signal"""
    signal: str
    description: str
    severity: str = Field(default="medium", description="low, medium, high, critical")

class RiskResult(BaseModel):
    """Full risk analysis result"""
    risk_score: int = Field(..., ge=0, le=100, description="0-100 risk score")
    risk_level: str = Field(..., description="safe, low, medium, high, critical")
    scam_type: str = Field(default="unknown", description="impersonation, otp_scam, digital_arrest, investment_scam, phishing, unknown")
    is_likely_scam: bool = Field(..., description="Quick boolean for UI")
    
    summary: str = Field(default="", description="Plain language explanation")
    signals: list[RiskSignal] = Field(default_factory=list, description="Detected red flags")
    extracted_entities: dict = Field(default_factory=dict, description="UPI IDs, phone numbers, amounts, names extracted")
    
    safe_actions: list[str] = Field(default_factory=list, description="3 tailored actions for user")
    warning_text: str = Field(default="", description="Hindi/English warning message to display/speak")
    evidence_report: dict = Field(default_factory=dict, description="Structured report for download")

class AudioTranscript(BaseModel):
    """Whisper transcription result"""
    text: str
    language: str = "unknown"
    duration_seconds: float = 0.0
    segments: list = Field(default_factory=list)

class AnalysisStatus(BaseModel):
    """Streaming analysis status for UI"""
    step: str
    message: str
    progress: int = Field(default=0, ge=0, le=100)
