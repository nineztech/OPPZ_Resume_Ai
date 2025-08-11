"""
Gemini Resume Parser Package

A Python package for parsing resumes using Google's Gemini AI API.
Provides intelligent resume parsing with structured output.
"""

__version__ = "1.0.0"
__author__ = "OPPZ Resume AI Team"

from services.gemini_parser_service import GeminiResumeParser
from utils.pdf_extractor import DocumentExtractor
from config.config import GeminiConfig

__all__ = [
    "GeminiResumeParser",
    "DocumentExtractor", 
    "GeminiConfig"
]
