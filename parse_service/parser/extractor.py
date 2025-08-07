# parser/extractor.py

import io
import tempfile
import pdfplumber
from docx import Document
from pyresparser import ResumeParser

def extract_text_from_pdf_bytes(b):
    text = []
    with pdfplumber.open(io.BytesIO(b)) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text() or '')
    return '\n'.join(text)

def extract_text_from_docx_bytes(b):
    doc = Document(io.BytesIO(b))
    return '\n'.join(p.text for p in doc.paragraphs)

def parse_resume(file_bytes, filename):
    ext = filename.split('.')[-1].lower()
    
    # Write to temp file because ResumeParser only works with file path
    with tempfile.NamedTemporaryFile(suffix='.'+ext, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp.flush()
        tmpname = tmp.name

    try:
        data = ResumeParser(tmpname).get_extracted_data()
    except Exception as e:
        # Fallback basic text extraction
        if ext == 'pdf':
            data = { 'text': extract_text_from_pdf_bytes(file_bytes) }
        elif ext == 'docx':
            data = { 'text': extract_text_from_docx_bytes(file_bytes) }
        else:
            data = { 'text': '' }

    return {
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("mobile_number"),
        "skills": data.get("skills", []),
        "education": data.get("education", []),
        "experience": data.get("experience", []),
        "text": data.get("text", None)  # optional full raw text
    }
