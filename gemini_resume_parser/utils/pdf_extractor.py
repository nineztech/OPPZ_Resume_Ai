import os
import pdfplumber
import docx2txt
from typing import Optional, Union
from pathlib import Path

class DocumentExtractor:
    """Utility class for extracting text from various document formats (PDF, DOCX, TXT)"""
    
    @staticmethod
    def extract_text_from_pdf(file_path: Union[str, Path]) -> str:
        """
        Extract text from PDF file using pdfplumber
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text as string
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file is not a valid PDF
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_path.suffix.lower() != '.pdf':
            raise ValueError(f"File must be a PDF: {file_path}")
        
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    else:
                        text += f"[Page {page_num + 1} - No text extracted]\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_path: Union[str, Path]) -> str:
        """
        Extract text from DOCX file using docx2txt
        
        Args:
            file_path: Path to the DOCX file
            
        Returns:
            Extracted text as string
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file is not a valid DOCX or extraction fails
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_path.suffix.lower() != '.docx':
            raise ValueError(f"File must be a DOCX: {file_path}")
        
        try:
            text = docx2txt.process(str(file_path))
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_path: Union[str, Path]) -> str:
        """
        Extract text from plain text file
        
        Args:
            file_path: Path to the text file
            
        Returns:
            File content as string
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise ValueError(f"Failed to read text file: {str(e)}")
    
    @staticmethod
    def extract_text(file_path: Union[str, Path]) -> str:
        """
        Extract text from file based on its extension
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text as string
        """
        file_path = Path(file_path)
        extension = file_path.suffix.lower()
        
        if extension == '.pdf':
            return DocumentExtractor.extract_text_from_pdf(file_path)
        elif extension == '.docx':
            return DocumentExtractor.extract_text_from_docx(file_path)
        elif extension == '.txt':
            return DocumentExtractor.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {extension}")
    
    @staticmethod
    def validate_file(file_path: Union[str, Path]) -> bool:
        """
        Validate if file exists and is supported
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if file is valid, False otherwise
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            return False
        
        extension = file_path.suffix.lower()
        supported_formats = ['.pdf', '.docx', '.txt']
        
        return extension in supported_formats

