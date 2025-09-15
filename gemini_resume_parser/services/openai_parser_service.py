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
        
        # Define required sections with default values - using frontend naming conventions
        required_sections = {
            "basicDetails": {
                "fullName": "",
                "professionalTitle": "",
                "phone": "",
                "email": "",
                "location": "",
                "website": "",
                "github": "",
                "linkedin": "",
                "profilePicture": ""
            },
            "summary": "",
            "objective": "",
            "skills": {},
            "education": [],
            "experience": [],
            "projects": [],
            "certifications": [],
            "languages": [],
            "activities": [],
            "references": [],
            "customSections": []
        }
        
        # Map old field names to new frontend format
        parsed_data = self._map_to_frontend_format(parsed_data)
        
        # Ensure all required sections exist
        for section, default_value in required_sections.items():
            if section not in parsed_data:
                parsed_data[section] = default_value
                logger.warning(f"Added missing section: {section}")
        
        # Ensure basicDetails has all required fields
        if "basicDetails" in parsed_data:
            for field, default_value in required_sections["basicDetails"].items():
                if field not in parsed_data["basicDetails"]:
                    parsed_data["basicDetails"][field] = default_value
                    logger.warning(f"Added missing basicDetails field: {field}")
        
        logger.info("Schema compliance enforcement completed")
        return parsed_data

    def _map_to_frontend_format(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map parsed data to frontend naming conventions"""
        logger.info("Mapping data to frontend format")
        
        # Handle basicDetails mapping
        if "basic_details" in parsed_data:
            basic_details = parsed_data["basic_details"]
            parsed_data["basicDetails"] = {
                "fullName": basic_details.get("full_name", basic_details.get("name", "")),
                "professionalTitle": basic_details.get("professional_title", ""),
                "phone": basic_details.get("phone", ""),
                "email": basic_details.get("email", ""),
                "location": basic_details.get("location", ""),
                "website": basic_details.get("website", ""),
                "github": basic_details.get("github", ""),
                "linkedin": basic_details.get("linkedin", ""),
                "profilePicture": basic_details.get("profilePicture", "")
            }
            # Remove old basic_details
            del parsed_data["basic_details"]
        
        # Handle education mapping
        if "education" in parsed_data and isinstance(parsed_data["education"], dict):
            # Convert single education object to array
            edu = parsed_data["education"]
            parsed_data["education"] = [{
                "id": f"edu-{hash(str(edu))}",
                "institution": edu.get("institution", ""),
                "degree": edu.get("degree", ""),
                "year": edu.get("end_date", edu.get("year", "")),
                "description": edu.get("description", ""),
                "grade": edu.get("grade", ""),
                "location": edu.get("location", "")
            }]
        elif "education" in parsed_data and isinstance(parsed_data["education"], list):
            # Ensure each education item has the correct structure
            for i, edu in enumerate(parsed_data["education"]):
                if isinstance(edu, dict):
                    parsed_data["education"][i] = {
                        "id": edu.get("id", f"edu-{i}"),
                        "institution": edu.get("institution", ""),
                        "degree": edu.get("degree", ""),
                        "year": edu.get("end_date", edu.get("year", "")),
                        "description": edu.get("description", ""),
                        "grade": edu.get("grade", ""),
                        "location": edu.get("location", "")
                    }
        
        # Handle experience mapping
        if "experience" in parsed_data and isinstance(parsed_data["experience"], list):
            for i, exp in enumerate(parsed_data["experience"]):
                if isinstance(exp, dict):
                    parsed_data["experience"][i] = {
                        "id": exp.get("id", f"exp-{i}"),
                        "company": exp.get("company", ""),
                        "position": exp.get("role", exp.get("position", "")),
                        "startDate": exp.get("start_date", exp.get("startDate", "")),
                        "endDate": exp.get("end_date", exp.get("endDate", "")),
                        "description": exp.get("description", ""),
                        "location": exp.get("location", "")
                    }
        
        # Handle projects mapping
        if "projects" in parsed_data and isinstance(parsed_data["projects"], list):
            for i, project in enumerate(parsed_data["projects"]):
                if isinstance(project, dict):
                    # Convert tech stack to string if it's an array
                    tech_stack = project.get("tech_stack", project.get("technologies", ""))
                    if isinstance(tech_stack, list):
                        tech_stack = ", ".join(tech_stack)
                    
                    parsed_data["projects"][i] = {
                        "id": project.get("id", f"project-{i}"),
                        "name": project.get("name", ""),
                        "techStack": tech_stack,
                        "startDate": project.get("start_date", project.get("startDate", "")),
                        "endDate": project.get("end_date", project.get("endDate", "")),
                        "description": project.get("description", ""),
                        "link": project.get("link", "")
                    }
        
        # Handle certifications mapping
        if "certifications" in parsed_data and isinstance(parsed_data["certifications"], list):
            for i, cert in enumerate(parsed_data["certifications"]):
                if isinstance(cert, dict):
                    parsed_data["certifications"][i] = {
                        "id": cert.get("id", f"cert-{i}"),
                        "certificateName": cert.get("certificateName", cert.get("certificate_name", cert.get("name", ""))),
                        "link": cert.get("link", ""),
                        "startDate": cert.get("startDate", cert.get("start_date", "")),
                        "endDate": cert.get("endDate", cert.get("end_date", "")),
                        "instituteName": cert.get("instituteName", cert.get("institute_name", cert.get("institueName", cert.get("issuer", ""))))
                    }
        
        # Handle languages mapping
        if "languages" in parsed_data and isinstance(parsed_data["languages"], list):
            for i, lang in enumerate(parsed_data["languages"]):
                if isinstance(lang, dict):
                    parsed_data["languages"][i] = {
                        "name": lang.get("name", ""),
                        "proficiency": lang.get("proficiency", lang.get("profeciency", ""))
                    }
        
        # Handle activities mapping
        if "activities" in parsed_data and isinstance(parsed_data["activities"], list):
            for i, activity in enumerate(parsed_data["activities"]):
                if isinstance(activity, dict):
                    parsed_data["activities"][i] = {
                        "id": activity.get("id", f"activity-{i}"),
                        "title": activity.get("title", ""),
                        "description": activity.get("description", "")
                    }
        
        # Handle references mapping
        if "references" in parsed_data and isinstance(parsed_data["references"], list):
            for i, ref in enumerate(parsed_data["references"]):
                if isinstance(ref, dict):
                    parsed_data["references"][i] = {
                        "id": ref.get("id", f"ref-{i}"),
                        "name": ref.get("name", ""),
                        "title": ref.get("title", ""),
                        "company": ref.get("company", ""),
                        "phone": ref.get("phone", ""),
                        "email": ref.get("email", ""),
                        "relationship": ref.get("relationship", "")
                    }
        
        # Ensure skills is an object (categorized format)
        if "skills" in parsed_data:
            if isinstance(parsed_data["skills"], list):
                # Convert flat array to categorized object
                skills_obj = {}
                for skill in parsed_data["skills"]:
                    if isinstance(skill, str) and skill.strip():
                        # Categorize skill (simplified categorization)
                        category = "Other Tools"
                        if any(tech in skill.lower() for tech in ["python", "java", "javascript", "sql"]):
                            category = "Languages"
                        elif any(tech in skill.lower() for tech in ["tableau", "power bi", "excel"]):
                            category = "Analytics"
                        elif any(tech in skill.lower() for tech in ["aws", "azure", "gcp"]):
                            category = "Cloud"
                        
                        if category not in skills_obj:
                            skills_obj[category] = []
                        skills_obj[category].append(skill)
                parsed_data["skills"] = skills_obj
            elif not isinstance(parsed_data["skills"], dict):
                parsed_data["skills"] = {}
        
        logger.info("Frontend format mapping completed")
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
