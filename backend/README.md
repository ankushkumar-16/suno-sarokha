# Suno Sarokha — Backend
# AI-powered anti-scam copilot API

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
cd backend
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs: http://localhost:8000/docs

## Endpoints

### Analysis
- `POST /api/v1/analyze` — Analyze text for scam signals (JSON response)
- `POST /api/v1/analyze/stream` — Streaming analysis with progress events
- `POST /api/v1/transcribe` — Audio transcription (Whisper stub)

### Upload
- `POST /api/v1/upload/audio` — Upload audio file
- `POST /api/v1/upload/screenshot` — Upload screenshot
- `GET /api/v1/upload/entities/extract?text=...` — Extract entities from text

### Health
- `GET /health` — Health check
- `GET /` — Root info
