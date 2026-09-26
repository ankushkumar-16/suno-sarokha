"""Scam analysis API — risk engine + LLM analysis"""
import logging
import re
import time
from typing import Generator
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import (
    AnalysisRequest, RiskResult, AudioTranscript, AnalysisStatus,
    RiskSignal, AudioUploadRequest
)
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Scam signal patterns ────────────────────────────────────────────────
SCAM_PATTERNS = {
    "urgency_fear": {
        "regex": r'(?:jal\d+\s*(?:bao|ki|ka)|emergency|urgent|abhi|tumhari\s*jaan\s*hai|biye\s*ho\s*raha\s*hai|accident|hospital|police\s* bulletin|cyber\s*crime\s*cell|seizure|arrest|ja|e\s*havel\s*lock)',
        "signal": "Urgency / Fear tactic",
        "description": "Scammers create panic to bypass rational thinking. Words like 'emergency', 'urgent', 'Jaldi karo' are red flags.",
        "severity": "critical"
    },
    "dont_call_verify": {
        "regex": r'(?:phone\s*pe\s*call\s*mat\s*karo|igno(?:re|re)\s*call|kisi\s*se\s*batana\s*mat|secret\s*razi| chup\s*raho| didi\s*behen\s*bhai\s*se\s*batana\s*mat\s*ho\s*taha|do\s*not\s*call|call\s*mat\s*karna|phone\s*pe\s*bataye\s*ge\s*nahi)',
        "signal": "Don't call / keep secret",
        "description": "Scammers instruct victims NOT to call anyone or tell anyone — classic isolation tactic.",
        "severity": "critical"
    },
    "upi_payment_request": {
        "regex": r'(?:UPI\s*ID|upi\s*id|pay\s*via\s*UPI|upi\s*se\s*transfer| bhille\s*pe\s*pay|kro\s*upi\s*se| bde\s*pe\s*pay|kro\s*se\s*abhi| bde\s*se\s*abhi)',
        "signal": "UPI payment request",
        "description": "Direct request to send money via UPI. Any unsolicited UPI request is suspicious.",
        "severity": "high"
    },
    "otp_verification_request": {
        "regex": r'(?:OTP|one\s*time\s*password|verification\s*(?:code|pin)|OTP\s*bhejo| OTP\s*do| code\s*bhejo| pin\s*bhejo| don\'t\s*share\s*OTP| OTP\s*share\s*mat\s*ko)',
        "signal": "OTP / Verification code request",
        "description": "Anyone asking for OTP is definitely a scammer. Banks never ask for OTP over call/message.",
        "severity": "critical"
    },
    "impersonation_family": {
        "regex": r'(?:papa|beta|beta\s*ji|meri\s*jaan|beti|bet\u00ef|meri\s*larki|meri\s*larki|meri\s*beti|mere\s*baap|mera\s*bhai|mere\s*behen|mere\s*chacha|mere\s*mamu|mere\s*chachi|meri\s*maa|mere\s*papa|beta\s*ji| beti\s*ji)',
        "signal": "Family impersonation indicators",
        "description": "Message uses family relationship terms — common in 'son/daughter in trouble' voice note scams.",
        "severity": "high"
    },
    "amount_creds": {
        "regex": r'(?:₹|rupees|rs\.?)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)|(\d{1,3}(?:,\d{3})*)\s*(?:₹|rupees|rs\.?)',
        "signal": "Money amount mentioned",
        "description": "Specific monetary amount requested — confirms this is a payment scam attempt.",
        "severity": "medium"
    },
    "digital_arrest_language": {
        "regex": r'(?:digital\s*arrest|cyber\s*crime\s*cell|police\s*action|summon|seizure| bail\s*amount| court\s*case| FIR\s* register| crime\s*branch| cyber\s*cell\s*bulletin| Delhi\s*Police\s*cyber| Mumbai\s*Police\s*cyber)',
        "signal": "Digital arrest / Police impersonation",
        "description": "Fake police / cyber cell claiming you're under arrest — classic digital arrest scam.",
        "severity": "critical"
    },
    "investment_double_money": {
        "regex": r'(?:double|2x|3x|4x|5x|sikud|sikud\s*ka\s*mandate|investment\s*return|guaranteed\s*return|10x|20x| profit\s*guaranteed|pan\s*sikh\s*doge)',
        "signal": "Investment double-money scheme",
        "description": "Promises of guaranteed high returns — Ponzi / investment scam signal.",
        "severity": "high"
    },
}

# ─── Risk scoring engine ──────────────────────────────────────────────────
def calculate_risk(text: str) -> dict:
    """Analyze text for scam signals and return risk assessment"""
    text_lower = text.lower()
    text_clean = re.sub(r'[^\w\s₹@]', ' ', text_lower)
    
    detected_signals = []
    total_weight = 0
    
    for key, pattern in SCAM_PATTERNS.items():
        matches = re.findall(pattern["regex"], text_clean, re.IGNORECASE)
        if matches:
            weight = {"critical": 30, "high": 20, "medium": 10, "low": 5}[pattern["severity"]]
            total_weight += weight
            
            detected_signals.append(RiskSignal(
                signal=pattern["signal"],
                description=pattern["description"],
                severity=pattern["severity"]
            ))
    
    # Normalize score: max possible = sum of all critical/high = ~180, cap at 100
    raw_score = min(total_weight, 100)
    
    # Additional heuristic: very short message with money request
    if len(text.strip()) < 80 and re.search(r'(?:₹|rupees|pay|send|transfer)', text_lower):
        raw_score = min(raw_score + 10, 100)
    
    if raw_score >= 70:
        level = "high"
    elif raw_score >= 50:
        level = "medium"
    elif raw_score >= 30:
        level = "low"
    else:
        level = "safe"
    
    return {
        "risk_score": raw_score,
        "risk_level": level,
        "is_likely_scam": raw_score >= settings.default_risk_threshold,
        "signals": detected_signals,
    }

def match_scam_type(risk_data: dict, text: str) -> str:
    """Classify the type of scam based on signals"""
    signals = [s.signal.lower() for s in risk_data["signals"]]
    signals_str = " ".join(signals)
    text_lower = text.lower()
    
    if any("digital arrest" in s or "police impersonation" in s for s in signals):
        return "digital_arrest"
    if any("otp" in s for s in signals) or re.search(r'otp', text_lower):
        return "otp_scam"
    if any("impersonation" in s for s in signals) or any(family in text_lower for family in ["papa", "beta", "beti", "maa", "bhai", "behen"]):
        return "impersonation"
    if any("investment" in s for s in signals):
        return "investment_scam"
    if any("phishing" in s.lower() for s in signals) or re.search(r'(?:http|https)://', text):
        return "phishing"
    if risk_data["is_likely_scam"]:
        return "unknown_scam"
    return "unknown"

def generate_safe_actions(risk_data: dict, scam_type: str) -> list[str]:
    """Generate 3 tailored safe actions for the user"""
    actions = []
    
    if risk_data["risk_score"] < settings.default_risk_threshold:
        return [
            "Yeh message shakki hone ka karan nahi hai — par kisi bhi financial request ko independently verify karna hamesha safe rehta hai.",
            "Kisi bhi payment se pehle, recipient ko unke saved number par call karke confirm karo.",
            "Scam report karna chahein to National Cyber Crime helpline: 1930"
        ]
    
    actions.append("Payment ruko: Abhi koi paise na bhejo, koi OTP na share karo, koi personal info na de.")
    
    if scam_type == "impersonation":
        actions.append("Pehle verify karo: Is number/voice note ko sender ke saath direct confirm karo — saved contact number par call karo, neye diye gaye number par nahi.")
    elif scam_type == "digital_arrest":
        actions.append("Police/cyber cell ka darr mat khana: Asli police aapko call/message ke through arrest nahi karti. Local police station call karo verify karne ke liye.")
    elif scam_type == "otp_scam":
        actions.append("OTP kabhi share mat karna: Koi bhi legitimate organization OTP nahi mangti. Account ke security settings check karo.")
    elif scam_type == "investment_scam":
        actions.append("Investment investigate karo: SEBI registered company hai ya nahi — SEBI website se verify karo first. Guaranteed returns = always scam.")
    else:
        actions.append("Sender verify karo: Unke saved/known number se contact karo. Message forward karke kisi trusted friend/family ko dikhaao.")
    
    actions.append("Evidence save karo: Screenshot, number, UPI ID, timestamps save karo. Cybercrime complaint ke liye bahut useful hoga.")
    
    return actions

def generate_warning(hindi: bool = True) -> str:
    """Generate warning message in Hindi or English"""
    if hindi:
        return (
            "⚠️ SUNNO: YEH SAF SHAYAD EK SCAM HO.\n\n"
            "Koi bhi paise transfer mat karo, koi OTP share mat karo, "
            "koi personal details mat dein.\n\n"
            "Pehle verify karo — sender ko unke saved/known number par call karke confirm karo.\n\n"
            "Agar yaqeen nahi hai, to message ko kisi trusted family member/friend ko dikhakar unka opinion lo.\n\n"
            "⚠️ याद रखें: असली警察(पुलिस) आपको कॉल/मैसेज से अर레스트 नहीं करती।"
        )
    else:
        return (
            "⚠️ WARNING: This message shows signs of a potential scam.\n\n"
            "Do NOT send money, do NOT share OTP, do NOT share personal details.\n\n"
            "Verify first — call the sender on their known/saved number to confirm.\n\n"
            "If unsure, share with a trusted family member or friend before acting.\n\n"
            "Remember: Real police never arrest via call or message."
        )

def generate_evidence_report(risk_data: dict, scam_type: str, text: str, metadata: dict = None) -> dict:
    """Generate structured fraud evidence report for download"""
    from datetime import datetime
    
    return {
        "report_title": "Suno Suraksha — Fraud Evidence Summary",
        "generated_at": datetime.now().isoformat(),
        "risk_assessment": {
            "risk_score": risk_data["risk_score"],
            "risk_level": risk_data["risk_level"],
            "is_suspicious": risk_data["is_likely_scam"],
            "scam_type": scam_type,
        },
        "red_flags": [
            {
                "signal": sig.signal,
                "severity": sig.severity,
                "description": sig.description,
            }
            for sig in risk_data["signals"]
        ],
        "content_analyzed": {
            "text_preview": (text[:200] + "...") if len(text) > 200 else text,
            "word_count": len(text.split()),
        },
        "extracted_details": metadata or {},
        "recommended_safe_actions": generate_safe_actions(risk_data, scam_type),
        "warning_message": generate_warning(hindi=True),
        "next_steps": [
            "Is report ko cybercrime complaint ke saath attach karo",
            "Sender number/UPI ID ko block karo if confirmed scam",
            "Family members ko alert karo agar financial loss ka risk hai",
            "National Cyber Crime helpline: 1930",
        ],
    }

# ─── API Endpoints ────────────────────────────────────────────────────────
@router.post("/analyze", response_model=RiskResult, tags=["Analysis"])
async def analyze_scam(request: AnalysisRequest):
    """
    Analyze text for scam signals and return risk assessment.
    
    Accepts WhatsApp message text, transcribed audio, or OCR text from screenshot.
    """
    if not request.content or len(request.content.strip()) < 3:
        raise HTTPException(status_code=400, detail="Content too short for analysis")
    
    logger.info(f"Analyzing content ({len(request.content)} chars, type={request.media_type})")
    
    # Run risk engine
    risk_data = calculate_risk(request.content)
    scam_type = match_scam_type(risk_data, request.content)
    actions = generate_safe_actions(risk_data, scam_type)
    warning = generate_warning(hindi=True)
    evidence = generate_evidence_report(risk_data, scam_type, request.content, request.metadata)
    
    # Extract entities from content
    import re
    entities = {}
    # Phone numbers
    phones = re.findall(r'(?:\+91|0)?[6-9]\d{9}', request.content)
    if phones:
        entities["phone_numbers"] = list(set(phones))
    # UPI IDs
    upi = re.findall(r'[\w\.\-]+@[\w\.]+', request.content)
    upi_filtered = [u for u in upi if len(u.split('@')[-1]) >= 3]
    if upi_filtered:
        entities["upi_ids"] = upi_filtered[:5]
    # Amounts
    amounts = re.findall(r'(?:₹|INR|\bRs\.?\s*)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)', request.content, re.IGNORECASE)
    if amounts:
        entities["amounts_inr"] = [a.replace(",", "") for a in amounts]
    
    return RiskResult(
        risk_score=risk_data["risk_score"],
        risk_level=risk_data["risk_level"],
        scam_type=scam_type,
        is_likely_scam=risk_data["is_likely_scam"],
        summary=f"{risk_data['risk_level'].upper()} RISK DETECTED: {len(risk_data['signals'])} red flag(s) identified. "
                f"{'Likely a scam. Do not proceed with payment.' if risk_data['is_likely_scam'] else 'Not clearly a scam, but verify before acting.'}",
        signals=risk_data["signals"],
        extracted_entities=entities,
        safe_actions=actions,
        warning_text=warning,
        evidence_report=evidence,
    )

@router.post("/analyze/stream", tags=["Analysis"])
async def analyze_scam_stream(request: AnalysisRequest):
    """
    Streaming analysis — returns progress updates as analysis runs.
    Useful for UI that wants to show 'AI checking...' steps.
    """
    if not request.content or len(request.content.strip()) < 3:
        raise HTTPException(status_code=400, detail="Content too short for analysis")
    
    async def event_stream() -> Generator[str, None, None]:
        steps = [
            ("reading_message", "Reading your message...", 10),
            ("detecting_patterns", "Detecting scam patterns...", 30),
            ("checking_entities", "Checking phone numbers, UPI IDs, amounts...", 50),
            ("analyzing_risk", "Analyzing risk level...", 70),
            ("preparing_actions", "Preparing safety actions...", 90),
            ("complete", "Analysis complete", 100),
        ]
        
        for step_name, message, progress in steps:
            yield f"data: {AnalysisStatus(step=step_name, message=message, progress=progress).model_dump_json()}\n\n"
            await __import__('asyncio').sleep(0.3)
        
        # Final result
        risk_data = calculate_risk(request.content)
        scam_type = match_scam_type(risk_data, request.content)
        actions = generate_safe_actions(risk_data, scam_type)
        
        result = RiskResult(
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            scam_type=scam_type,
            is_likely_scam=risk_data["is_likely_scam"],
            summary=f"Analysis complete. Risk: {risk_data['risk_level']} ({risk_data['risk_score']}/100)",
            signals=risk_data["signals"],
            extracted_entities={},
            safe_actions=actions,
            warning_text=generate_warning(hindi=True),
            evidence_report={},
        )
        yield f"data: {result.model_dump_json()}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@router.post("/transcribe", response_model=AudioTranscript, tags=["Analysis"])
async def transcribe_audio(request: AudioUploadRequest):
    """
    Placeholder for Whisper transcription.
    In production, integrate OpenAI Whisper or a local whisper.cpp instance.
    For MVP, returns simulated result — swap with real Whisper call.
    """
    # TODO: Integrate whisper.cpp or OpenAI Whisper API
    # Example:
    # import whisper
    # model = whisper.load_model(settings.whisper_model)
    # result = model.transcribe(file_path, language=settings.whisper_language)
    
    return AudioTranscript(
        text="(Whisper transcription not yet integrated — in production, audio transcript would appear here)",
        language="pending",
        duration_seconds=0.0,
        segments=[]
    )

@router.post("/transcribe/stream", tags=["Analysis"])
async def transcribe_audio_stream(request: AudioUploadRequest):
    """Streaming transcription status (placeholder for MVP)"""
    async def stream():
        for progress, msg in [
            (10, "Loading Whisper model..."),
            (30, "Starting transcription..."),
            (60, "Processing audio..."),
            (90, "Finalizing transcript..."),
            (100, "Done"),
        ]:
            yield f"data: {{\"step\": \"transcribing\", \"message\": \"{msg}\", \"progress\": {progress}}}\n\n"
            await __import__('asyncio').sleep(0.5)
        yield f"data: {{\"text\": \"(transcription pending)\", \"language\": \"pending\"}}\n\n"
    
    return StreamingResponse(stream(), media_type="text/event-stream")
