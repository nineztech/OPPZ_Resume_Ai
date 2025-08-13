# Resume Parse Service

This service provides resume parsing functionality using FastAPI and various Python libraries.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the service:
```bash
python run.py
```

The service will start on `http://localhost:8000`

## API Endpoints

- `POST /parse` - Parse a resume file and return structured data
- `POST /parse-sections` - Extract text sections from a resume
- `GET /` - Health check

## Supported File Types

- PDF (.pdf)
- DOCX (.docx)
- TXT (.txt)

## Response Format

The `/parse` endpoint returns:
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["Python", "JavaScript"],
    "education": [...],
    "experience": [...],
    "text": "raw text content"
  }
}
```
