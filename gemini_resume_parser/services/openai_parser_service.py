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
        Parse resume text using OpenAI API with format detection
        
        Args:
            resume_text: Raw resume text
            custom_prompt: Custom prompt template (optional)
            
        Returns:
            Parsed resume data as dictionary
        """
        try:
            # Detect resume format and prepare appropriate prompt
            resume_type = self._detect_resume_format(resume_text)
            logger.info(f"Detected resume type: {resume_type}")
            
            # Prepare prompt based on detected format
            prompt = self._prepare_prompt(resume_text, custom_prompt, resume_type)
            
            # Generate content using OpenAI
            logger.info("Sending request to OpenAI API")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an advanced resume parsing system that handles all types of resumes including academic, professional, student, and non-standard formats. Extract structured data from resume text and return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                top_p=self.top_p,
                max_tokens=4000
            )
            
            # Parse response
            parsed_data = self._parse_response(response.choices[0].message.content)
            
            # Enforce schema compliance with format-specific handling
            parsed_data = self._enforce_schema_compliance(parsed_data, resume_type)
            
            logger.info("✅ Resume parsing completed successfully")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Failed to parse resume text: {str(e)}")
            raise

    def _detect_resume_format(self, resume_text: str) -> str:
        """Detect the type of resume format"""
        text_lower = resume_text.lower()
        
        # Academic/Student resume indicators
        academic_indicators = [
            'course:', 'research project:', 'thesis:', 'academic project',
            'master of science', 'bachelor of science', 'phd', 'graduate',
            'relevant coursework', 'coursework:', 'academic background',
            'education and credentials', 'student', 'university project'
        ]
        
        # Professional resume indicators
        professional_indicators = [
            'work experience', 'employment history', 'professional experience',
            'career history', 'job experience', 'employment:', 'work history',
            'years of experience', 'professional background', 'career'
        ]
        
        # Count indicators
        academic_score = sum(1 for indicator in academic_indicators if indicator in text_lower)
        professional_score = sum(1 for indicator in professional_indicators if indicator in text_lower)
        
        # Determine format
        if academic_score > professional_score:
            return "academic"
        elif professional_score > academic_score:
            return "professional"
        else:
            return "mixed"
    
    def _prepare_prompt(self, resume_text: str, custom_prompt: Optional[str] = None, resume_type: str = "mixed") -> str:
        """Prepare the prompt for resume parsing based on detected format"""
        if custom_prompt:
            return custom_prompt.format(resume_text=resume_text)
        
        # Add format-specific instructions to the base template
        format_instructions = ""
        if resume_type == "academic":
            format_instructions = """
            **ACADEMIC RESUME DETECTED**
            - Focus on extracting academic projects, coursework, and research
            - Map "COURSE:" sections to projects, not experience
            - Include relevant coursework in education descriptions
            - Handle incomplete academic dates gracefully
            """
        elif resume_type == "professional":
            format_instructions = """
            **PROFESSIONAL RESUME DETECTED**
            - Focus on work experience and professional achievements
            - Distinguish between technical skills and communication languages
            - Extract complete employment history
            """
        else:
            format_instructions = """
            **MIXED FORMAT RESUME DETECTED**
            - Handle both academic and professional sections
            - Distinguish between course projects and work experience
            - Extract all available information from both formats
            """
        
        base_template = OpenAIConfig.DEFAULT_PROMPT_TEMPLATE
        enhanced_template = base_template + format_instructions
        
        return enhanced_template.format(resume_text=resume_text)

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

    def _enforce_schema_compliance(self, parsed_data: Dict[str, Any], resume_type: str = "mixed") -> Dict[str, Any]:
        """Enforce schema compliance for parsed resume data with format-specific handling"""
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
        
        # Apply format-specific processing
        parsed_data = self._apply_format_specific_processing(parsed_data, resume_type)
        
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
    
    def _apply_format_specific_processing(self, parsed_data: Dict[str, Any], resume_type: str) -> Dict[str, Any]:
        """Apply format-specific processing to parsed data"""
        logger.info(f"Applying {resume_type} format-specific processing")
        
        if resume_type == "academic":
            # For academic resumes, ensure projects are properly categorized
            if "experience" in parsed_data and isinstance(parsed_data["experience"], list):
                # Move academic projects from experience to projects
                academic_projects = []
                professional_experience = []
                
                for exp in parsed_data["experience"]:
                    if isinstance(exp, dict):
                        # Check if this is actually an academic project
                        company = exp.get("company", "").lower()
                        position = exp.get("position", "").lower()
                        
                        if any(keyword in company or keyword in position for keyword in 
                               ["course", "university", "research", "thesis", "academic", "project"]):
                            # Convert to project format
                            academic_projects.append({
                                "id": exp.get("id", f"project-{len(academic_projects)}"),
                                "name": exp.get("position", exp.get("company", "")),
                                "techStack": exp.get("description", ""),
                                "startDate": exp.get("startDate", ""),
                                "endDate": exp.get("endDate", ""),
                                "description": exp.get("description", ""),
                                "link": ""
                            })
                        else:
                            professional_experience.append(exp)
                
                # Update the sections
                parsed_data["experience"] = professional_experience
                if "projects" not in parsed_data:
                    parsed_data["projects"] = []
                parsed_data["projects"].extend(academic_projects)
                
                logger.info(f"Moved {len(academic_projects)} academic projects from experience to projects")
        
        # Handle name extraction issues
        if "basicDetails" in parsed_data and "fullName" in parsed_data["basicDetails"]:
            full_name = parsed_data["basicDetails"]["fullName"]
            if full_name and len(full_name.split()) < 2:
                # Try to extract name from other parts of the resume
                logger.warning(f"Incomplete name detected: {full_name}")
                # Try to fix common name issues
                improved_name = self._improve_name_extraction(full_name, parsed_data)
                if improved_name != full_name:
                    parsed_data["basicDetails"]["fullName"] = improved_name
                    logger.info(f"Improved name extraction: {full_name} -> {improved_name}")
        
        return parsed_data
    
    def _improve_name_extraction(self, current_name: str, parsed_data: Dict[str, Any]) -> str:
        """Improve name extraction by analyzing the resume content"""
        import re
        
        # Common patterns for split names
        if len(current_name.split()) == 1 and current_name.isupper():
            # This might be a split name like "STRM" from "S T R M"
            # Look for patterns in the original text or other fields
            
            # Check if there are other name fragments
            if "basicDetails" in parsed_data:
                email = parsed_data["basicDetails"].get("email", "")
                if email:
                    # Extract name from email
                    email_name = email.split("@")[0]
                    if "." in email_name:
                        parts = email_name.split(".")
                        if len(parts) >= 2:
                            return f"{parts[0].title()} {parts[1].title()}"
        
        # Handle common name patterns
        name_patterns = [
            r'^([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\s+(.+)$',  # S T R M NAME
            r'^([A-Z]+)\s+(.+)$',  # STRM NAME
            r'^(.+)\s+([A-Z]+)$',  # NAME STRM
        ]
        
        for pattern in name_patterns:
            match = re.match(pattern, current_name.strip())
            if match:
                groups = match.groups()
                if len(groups) >= 2:
                    # Try to reconstruct a proper name
                    if len(groups[0]) <= 4 and groups[0].isupper():
                        # This looks like initials or abbreviation
                        return f"{groups[0]} {groups[1]}"
                    else:
                        return f"{groups[0]} {groups[1]}"
        
        return current_name

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
                        "issueDate": cert.get("issueDate", cert.get("startDate", cert.get("start_date", ""))),
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
                # Convert flat array to categorized object only if no categories exist
                # This preserves the original categorization from the AI response
                skills_obj = {}
                for skill in parsed_data["skills"]:
                    if isinstance(skill, str) and skill.strip():
                        # If skills come as a flat list, put them in "Other Tools" as fallback
                        # This should rarely happen with the updated prompt
                        category = "Other Tools"
                        if category not in skills_obj:
                            skills_obj[category] = []
                        skills_obj[category].append(skill)
                parsed_data["skills"] = skills_obj
            elif not isinstance(parsed_data["skills"], dict):
                # If skills is not a dict or list, initialize as empty dict
                parsed_data["skills"] = {}
            # If skills is already a dict (categorized), keep it as is - this preserves original categories
        
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
