# app.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from parser.extractor import parse_resume
from parser.resume_parser import extract_text_from_resume

app = FastAPI(title="Resume Parser Service")

# CORS (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        parsed = parse_resume(contents, file.filename)
        return JSONResponse(content={
            "success": True,
            "data": parsed
        })
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/parse-sections")
async def parse_sections(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = extract_text_from_resume(file.filename, contents)
        
        if "error" in result:
            return JSONResponse(content={"error": result["error"]}, status_code=400)
        
        return JSONResponse(content={
            "filename": file.filename,
            "sections": result["sections"]
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "Resume Parser is running"}
