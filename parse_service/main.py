from fastapi import FastAPI, UploadFile, File
from parser.resume_parser import extract_text_from_resume

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Resume Parser Service is Running"}

@app.post("/upload/")
async def upload_resume(file: UploadFile = File(...)):
    content = await file.read()
    result = extract_text_from_resume(file.filename, content)
    
    if "error" in result:
        return {"error": result["error"]}
    
    return {
        "filename": file.filename,
        "sections": result["sections"]
    }
