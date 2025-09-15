import json
import logging
from typing import Dict, Any, Optional, Union
from pathlib import Path

from openai import OpenAI

from config.config import OpenAIConfig
from utils.pdf_extractor import DocumentExtractor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIResumeParser:
    """Main service class for parsing resumes using OpenAI API"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None, temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the OpenAI Resume Parser
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.api_key = api_key or OpenAIConfig.OPENAI_API_KEY
        self.model_name = model_name or OpenAIConfig.OPENAI_MODEL
        
        # Validate configuration
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        # Initialize OpenAI client
        try:
            self.client = OpenAI(api_key=self.api_key)
            self.model = self.client  # Add model attribute for compatibility
            self.temperature = temperature
            self.top_p = top_p
            logger.info(f"OpenAI client initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {str(e)}")
            raise

    def parse_resume_from_file(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Parse resume from file using OpenAI API
        
        Args:
            file_path: Path to resume file (PDF, DOCX, or TXT)
            
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
        Parse resume text using OpenAI API
        
        Args:
            resume_text: Raw resume text
            custom_prompt: Custom prompt template (optional)
            
        Returns:
            Parsed resume data as dictionary
        """
        try:
            # Prepare prompt
            prompt = self._prepare_prompt(resume_text, custom_prompt)
            
            # Generate content using OpenAI
            logger.info("Sending request to OpenAI API")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a professional resume parsing system. Extract structured data from resume text and return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=4000
            )
            
            # Parse response
            parsed_data = self._parse_response(response.choices[0].message.content)
            
            # Enforce schema compliance
            parsed_data = self._enforce_schema_compliance(parsed_data)
            
            logger.info("✅ Resume parsing completed successfully")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Failed to parse resume text: {str(e)}")
            raise

    def _prepare_prompt(self, resume_text: str, custom_prompt: Optional[str] = None) -> str:
        """Prepare the prompt for resume parsing"""
        if custom_prompt:
            return custom_prompt.format(resume_text=resume_text)
        
        return OpenAIConfig.DEFAULT_PROMPT_TEMPLATE.format(resume_text=resume_text)

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse OpenAI response and extract JSON"""
        try:
            # Clean the response text
            cleaned_response = self._clean_response(response_text)
            
            # Parse JSON
            parsed_data = json.loads(cleaned_response)
            logger.info("Successfully parsed JSON response")
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            logger.error(f"Raw response: {response_text}")
            raise ValueError(f"Invalid JSON response from AI: {str(e)}")

    def _clean_response(self, response_text: str) -> str:
        """Clean OpenAI response to extract valid JSON"""
        import re
        
        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")

        response_text = response_text.strip()
        
        # Try to find JSON content within markdown blocks
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                json.loads(json_content)
                return json_content
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object in the text
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            try:
                json.loads(json_content)
                return json_content
            except json.JSONDecodeError:
                pass
        
        # If response starts and ends with braces, use as is
        if response_text.startswith('{') and response_text.endswith('}'):
            try:
                json.loads(response_text)
                return response_text
            except json.JSONDecodeError:
                pass
        
        logger.warning("Could not extract valid JSON from AI response")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'

    def _enforce_schema_compliance(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enforce schema compliance for parsed resume data"""
        logger.info("Enforcing schema compliance")
        
        # Define required sections with default values
        required_sections = {
            "basic_details": {
                "name": "",
                "professional_title": "",
                "phone": "",
                "email": "",
                "location": "",
                "website": "",
                "github": "",
                "linkedin": ""
            },
            "summary": "",
            "skills": [],
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": [],
            "languages": [],
            "references": [],
            "other": []
        }
        
        # Ensure all required sections exist
        for section, default_value in required_sections.items():
            if section not in parsed_data:
                parsed_data[section] = default_value
                logger.warning(f"Added missing section: {section}")
        
        # Ensure basic_details has all required fields
        if "basic_details" in parsed_data:
            for field, default_value in required_sections["basic_details"].items():
                if field not in parsed_data["basic_details"]:
                    parsed_data["basic_details"][field] = default_value
                    logger.warning(f"Added missing basic_details field: {field}")
        
        logger.info("Schema compliance enforcement completed")
        return parsed_data

    def update_generation_parameters(self, temperature: float = None, top_p: float = None):
        """
        Update generation parameters for more consistent results
        
        Args:
            temperature: New temperature value (0.0 = deterministic, 1.0 = creative)
            top_p: New top_p value (0.0 = focused, 1.0 = diverse)
        """
        if temperature is not None:
            self.temperature = temperature
        if top_p is not None:
            self.top_p = top_p
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")

    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.model_name
        }
