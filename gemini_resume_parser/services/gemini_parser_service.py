import json
import logging
from typing import Dict, Any, Optional, Union
from pathlib import Path

from google.generativeai import configure, GenerativeModel
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from config.config import GeminiConfig
from utils.pdf_extractor import DocumentExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiResumeParser:
    """Main service class for parsing resumes using Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize the Gemini Resume Parser
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
        """
        self.api_key = api_key or GeminiConfig.GEMINI_API_KEY
        self.model_name = model_name or GeminiConfig.GEMINI_MODEL
        
        # Validate configuration
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure Gemini
        try:
            configure(api_key=self.api_key)
            self.model = GenerativeModel(self.model_name)
            logger.info(f"Initialized Gemini model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {str(e)}")
            raise
    
    def parse_resume_from_file(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Parse resume from file using Gemini API
        
        Args:
            file_path: Path to the resume file
            
        Returns:
            Parsed resume data as dictionary
        """
        try:
            # Extract text from file
            logger.info(f"Extracting text from file: {file_path}")
            resume_text = DocumentExtractor.extract_text(file_path)
            
            if not resume_text.strip():
                raise ValueError("No text extracted from file")
            
            # Parse the extracted text
            return self.parse_resume_text(resume_text)
            
        except Exception as e:
            logger.error(f"Failed to parse resume from file {file_path}: {str(e)}")
            raise
    
    def parse_resume_text(self, resume_text: str, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse resume text using Gemini API
        
        Args:
            resume_text: Raw resume text
            custom_prompt: Custom prompt template (optional)
            
        Returns:
            Parsed resume data as dictionary
        """
        try:
            # Prepare prompt
            prompt = self._prepare_prompt(resume_text, custom_prompt)
            
            # Generate content using Gemini
            logger.info("Sending request to Gemini API")
            response = self.model.generate_content(
                prompt,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            # Parse response
            parsed_data = self._parse_gemini_response(response.text)
            
            logger.info("Successfully parsed resume using Gemini API")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Failed to parse resume text with Gemini: {str(e)}")
            raise
    
    def _prepare_prompt(self, resume_text: str, custom_prompt: Optional[str] = None) -> str:
        """
        Prepare the prompt for Gemini API
        
        Args:
            resume_text: Raw resume text
            custom_prompt: Custom prompt template
            
        Returns:
            Formatted prompt string
        """
        if custom_prompt:
            prompt_template = custom_prompt
        else:
            prompt_template = GeminiConfig.DEFAULT_PROMPT_TEMPLATE
        
        return prompt_template.format(resume_text=resume_text)
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse the response from Gemini API
        
        Args:
            response_text: Raw response text from Gemini
            
        Returns:
            Parsed data as dictionary
        """
        try:
            # Clean the response text
            cleaned_response = self._clean_gemini_response(response_text)
            
            # Try to parse as JSON
            try:
                parsed_data = json.loads(cleaned_response)
                return parsed_data
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse JSON response: {str(e)}")
                
                # Try to extract JSON from markdown code blocks
                cleaned_response = self._extract_json_from_markdown(cleaned_response)
                try:
                    parsed_data = json.loads(cleaned_response)
                    return parsed_data
                except json.JSONDecodeError:
                    raise ValueError("Failed to parse Gemini response as valid JSON")
                    
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            raise
    
    def _clean_gemini_response(self, response_text: str) -> str:
        """
        Clean the response text from Gemini API
        
        Args:
            response_text: Raw response text
            
        Returns:
            Cleaned response text
        """
        # Remove markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")
        
        return response_text.strip()
    
    def _extract_json_from_markdown(self, text: str) -> str:
        """
        Extract JSON content from markdown formatted text
        
        Args:
            text: Markdown formatted text
            
        Returns:
            Extracted JSON string
        """
        # Look for JSON content between code blocks
        import re
        
        # Pattern to match JSON content
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, text, re.DOTALL)
        
        if match:
            return match.group(1)
        
        # If no code blocks, try to find JSON object
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, text, re.DOTALL)
        
        if match:
            return match.group(1)
        
        return text
    
    def get_model_info(self) -> Dict[str, str]:
        """
        Get information about the current Gemini model
        
        Returns:
            Dictionary with model information
        """
        return {
            "model_name": self.model_name,
            "api_key_configured": bool(self.api_key),
            "model_initialized": hasattr(self, 'model')
        }
