import io
import pdfplumber
from pdfminer.high_level import extract_text
from docx import Document
from .section_parser import split_into_sections
import base64

def extract_text_from_resume(filename, file_bytes):
    # Extract raw text from file
    if filename.endswith(".pdf"):
        raw_text = ""
        
        # Method 1: Try pdfplumber
        try:
            print("DEBUG: Trying pdfplumber extraction...")
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text_parts = []
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                        print(f"DEBUG: Page {page_num + 1} extracted {len(page_text)} characters")
                    else:
                        print(f"DEBUG: Page {page_num + 1} extracted no text")
                raw_text = '\n'.join(text_parts)
                print(f"DEBUG: pdfplumber extracted {len(raw_text)} total characters")
        except Exception as e:
            print(f"DEBUG: pdfplumber failed: {str(e)}")
            raw_text = ""
        
        # Method 2: If pdfplumber failed or extracted nothing, try pdfminer
        if not raw_text.strip():
            try:
                print("DEBUG: Trying pdfminer extraction...")
                raw_text = extract_text(io.BytesIO(file_bytes))
                print(f"DEBUG: pdfminer extracted {len(raw_text)} characters")
            except Exception as e:
                print(f"DEBUG: pdfminer failed: {str(e)}")
                raw_text = ""
        
        # Method 3: If both failed, try with different parameters
        if not raw_text.strip():
            try:
                print("DEBUG: Trying pdfminer with different parameters...")
                # Try with different encoding and layout analysis
                raw_text = extract_text(io.BytesIO(file_bytes), codec='utf-8')
                print(f"DEBUG: pdfminer with parameters extracted {len(raw_text)} characters")
            except Exception as e:
                print(f"DEBUG: pdfminer with parameters failed: {str(e)}")
                raw_text = ""
        
        # Method 4: If all text extraction failed, try OCR (for image-based PDFs)
        if not raw_text.strip():
            try:
                print("DEBUG: Trying OCR extraction...")
                raw_text = extract_text_with_ocr(file_bytes)
                print(f"DEBUG: OCR extracted {len(raw_text)} characters")
            except Exception as e:
                print(f"DEBUG: OCR failed: {str(e)}")
                raw_text = ""
                
    elif filename.endswith(".docx"):
        try:
            doc = Document(io.BytesIO(file_bytes))
            raw_text = "\n".join([para.text for para in doc.paragraphs])
            print(f"DEBUG: docx extracted {len(raw_text)} characters")
        except Exception as e:
            print(f"DEBUG: docx extraction failed: {str(e)}")
            raw_text = ""
    else:
        return {"error": "Unsupported file format"}
    
    # Debug: Print first few lines of extracted text
    print("DEBUG: Extracted text (first 10 lines):")
    lines = raw_text.split('\n')
    for i, line in enumerate(lines[:10]):
        print(f"Line {i}: '{line}'")
    print(f"DEBUG: Total text length: {len(raw_text)} characters")
    
    # If no text was extracted, return error
    if not raw_text.strip():
        return {"error": "Could not extract text from the file. The file might be image-based or corrupted."}
    
    # Parse into sections
    sections = split_into_sections(raw_text)
    
    # Return structured data
    return {
        "raw_text": raw_text,
        "sections": sections
    }

def extract_text_with_ocr(file_bytes):
    """Extract text from PDF using OCR"""
    try:
        import fitz  # PyMuPDF
        from PIL import Image
        import pytesseract
        import cv2
        import numpy as np
        
        # Open PDF with PyMuPDF
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            
            # Convert page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher resolution
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            img = Image.open(io.BytesIO(img_data))
            
            # Convert to OpenCV format
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            # Preprocess image for better OCR
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding to get better text recognition
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(thresh, config='--psm 6')
            
            if text.strip():
                text_parts.append(text)
                print(f"DEBUG: OCR Page {page_num + 1} extracted {len(text)} characters")
            else:
                print(f"DEBUG: OCR Page {page_num + 1} extracted no text")
        
        pdf_document.close()
        return '\n'.join(text_parts)
        
    except ImportError:
        print("DEBUG: OCR libraries not available. Install pytesseract, PyMuPDF, and opencv-python")
        return ""
    except Exception as e:
        print(f"DEBUG: OCR extraction failed: {str(e)}")
        return ""


