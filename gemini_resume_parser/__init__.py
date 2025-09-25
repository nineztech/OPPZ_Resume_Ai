"""
OpenAI Resume Parser Package

A Python package for parsing resumes using OpenAI's GPT API.
Provides intelligent resume parsing with structured output.
"""

__version__ = "1.0.0"
__author__ = "OPPZ Resume AI Team"

from services.openai_parser_service import OpenAIResumeParser
from utils.pdf_extractor import DocumentExtractor
from config.config import OpenAIConfig

__all__ = [
    "OpenAIResumeParser",
    "DocumentExtractor", 
    "OpenAIConfig"
]
