import json
import logging
import datetime
from typing import Dict, Any, Optional
from google.generativeai import GenerativeModel
from .gemini_parser_service import GeminiResumeParser

logger = logging.getLogger(__name__)

class AISuggestionService:
    """AI service for generating job descriptions and resume suggestions"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        """
        Initialize the AI Suggestion Service
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
        """
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name)
        self.model = self.parser.model
    
    def generate_job_description(self, sector: str, country: str, designation: str, resume_data: Optional[Dict[str, Any]] = None, experience_level: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a job description tailored to the role, sector, country, and experience level.
        If experience_level not provided, infer it from resume_data.
        """
        # Infer experience level if not provided
        if experience_level:
            target_experience = experience_level
        elif resume_data:
            target_experience = self._analyze_experience_level(resume_data)
        else:
            target_experience = "Mid level"

        prompt = f"""
        You are an expert global job market analyst and HR recruiter.

        TASK: Create a **realistic, ATS-friendly job description (JD)** for the role of "{designation}" in the {sector} sector for {country}.
        The JD must reflect exactly the **{target_experience}** career stage of the candidate.

        Rules for accuracy:
        - Use {target_experience} as the baseline: responsibilities, skills, and salary must match this level.
        - Responsibilities should reflect realistic scope:
            - Entry = more learning/support
            - Mid = independent execution
            - Senior = leadership/strategy
        - Salary range must be realistic for {country} and {target_experience}.
        - Keep phrasing professional, concise, and specific to {sector} norms in {country}.
        - Avoid fluff, buzzwords, or generic filler text.
        - Base details on aggregated insights from LinkedIn, Glassdoor, Indeed, and Fortune 500 job postings in {country}.
        - Tailor keywords for ATS parsing.

        Output ONLY valid JSON in this schema:
        {{
            "jobTitle": "Exact job title",
            "experienceLevel": "{target_experience}",
            "salaryRange": "Realistic salary range in {country} for {target_experience}",
            "jobSummary": "2-3 paragraph professional summary tailored to {target_experience}",
            "keyResponsibilities": [
                "Responsibility 1",
                "Responsibility 2",
                "Responsibility 3",
                "Responsibility 4",
                "Responsibility 5"
            ],
            "requiredSkills": {{
                "technical": ["Skill 1", "Skill 2"],
                "soft": ["Skill 1", "Skill 2"],
                "programming": ["Language 1", "Language 2"],
                "tools": ["Tool 1", "Tool 2"]
            }},
            "educationalRequirements": [
                "Bachelor's degree in relevant field",
                "Additional certifications preferred"
            ],
            "benefits": [
                "Competitive salary",
                "Health insurance",
                "Professional development"
            ]
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            cleaned_response = self._clean_gemini_response(response.text)
            return json.loads(cleaned_response)
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse Gemini JSON response for job description: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to generate job description: {str(e)}")
            raise

    
    def compare_resume_with_jd(self, resume_data: Dict[str, Any], job_description: str, target_experience: Optional[str] = None) -> Dict[str, Any]:
        """
        Compare resume with job description and generate actionable improvement suggestions.
        Includes rewritten sections ready to be pasted into the resume.
        """
        logger.info(f"Starting resume comparison with data keys: {list(resume_data.keys())}")
        logger.info(f"Skills data in resume: {resume_data.get('skills', 'NOT_FOUND')}")
        
        resume_text = self._format_resume_for_comparison(resume_data)
        if not target_experience:
            target_experience = self._analyze_experience_level(resume_data)

        prompt = f"""
        You are an expert resume consultant and recruiter.  
        Compare the following resume with the job description and provide actionable, ready-to-use rewritten improvements.

        Rules:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations).
        - For each section (Summary, Skills, Work Experience, Projects, etc.), include:
            - Existing content
            - Suggested rewritten version (ready to replace in the resume)
            - Recommendations (why this rewrite is better)
        - Ensure rewrites include strong action verbs, quantified achievements, and relevant keywords from the JD.
        - Tailor rewrites to {target_experience} level.
        - Never leave placeholders like "improve wording" — always provide final rewritten text.
        
        CRITICAL SKILLS RULES:
        - For skills section: ONLY suggest skills that can be added to EXISTING categories shown in the resume.
        - Do NOT create new category objects or suggest new skill categories.
        - Only add missing skills to existing categories (e.g., if "Java" is missing from "Programming Languages", add it there).
        - If a skill doesn't fit any existing category, do NOT suggest it.
        - Focus on enhancing existing skill categories with relevant missing skills from the job description.
        - Format skills as "Category: skill1, skill2, skill3" where Category must exist in the resume.
        - Example: If resume has "Programming Languages" category and job needs "Python", suggest "Programming Languages: Python"
        - Do NOT suggest "New Category: skills" - only use existing categories.

        RESUME DATA:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        Output schema:
        {{
            "overallScore": 0,
            "analysisTimestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "sectionSuggestions": {{
                "professionalSummary": {{
                    "existing": "",
                    "rewrite": "",
                    "recommendations": [""]
                }},
                "skills": {{
                    "existing": [""],
                    "rewrite": [""],
                    "recommendations": [""]
                }},
                "workExperience": [
                    {{
                        "role": "",
                        "existing": "",
                        "rewrite": "",
                        "recommendations": [""]
                    }}
                ],
                "projects": [
                    {{
                        "name": "",
                        "existing": "",
                        "rewrite": "",
                        "recommendations": [""]
                    }}
                ],
                "education": {{
                    "existing": [""],
                    "rewrite": [""],
                    "recommendations": [""]
                }},
                "certifications": {{
                    "existing": [""],
                    "rewrite": [""],
                    "recommendations": [""]
                }}
            }},
            "topRecommendations": [
                "Actionable step 1",
                "Actionable step 2",
                "Actionable step 3"
            ]
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            cleaned_response = self._clean_gemini_response(response.text)
            ai_response = json.loads(cleaned_response)
            
            # Validate that skills suggestions only reference existing categories
            if 'sectionSuggestions' in ai_response and 'skills' in ai_response['sectionSuggestions']:
                skills_suggestions = ai_response['sectionSuggestions']['skills']
                if 'rewrite' in skills_suggestions and isinstance(skills_suggestions['rewrite'], list):
                    # Get existing categories from resume data
                    existing_categories = []
                    if isinstance(resume_data.get('skills'), dict):
                        existing_categories = list(resume_data['skills'].keys())
                    
                    # Filter skills suggestions to only include existing categories
                    if existing_categories:
                        filtered_rewrite = []
                        for skill_line in skills_suggestions['rewrite']:
                            if isinstance(skill_line, str) and ':' in skill_line:
                                category = skill_line.split(':')[0].strip()
                                if category in existing_categories:
                                    filtered_rewrite.append(skill_line)
                                    logger.info(f"Keeping skill suggestion for existing category: {category}")
                                else:
                                    logger.warning(f"Filtering out skill suggestion for non-existing category: {category}")
                            else:
                                # Single skill without category, keep it
                                filtered_rewrite.append(skill_line)
                        
                        skills_suggestions['rewrite'] = filtered_rewrite
                        logger.info(f"Filtered skills suggestions to {len(filtered_rewrite)} items for existing categories")
            
            return ai_response
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse Gemini JSON response: {str(json_error)}")
            logger.error(f"Raw response: {cleaned_response}")
            raise Exception(f"Invalid JSON response from AI: {str(json_error)}")
        except Exception as e:
            logger.error(f"Failed to compare resume with job description: {str(e)}")
            raise

    
    def _format_resume_for_comparison(self, resume_data: Dict[str, Any]) -> str:
        """Format resume data into a readable text format for comparison"""
        logger.info(f"Formatting resume data with keys: {list(resume_data.keys())}")
        logger.info(f"Resume data structure: {resume_data}")
        formatted_parts = []

        if 'basic_details' in resume_data:
            basic = resume_data['basic_details']
            formatted_parts.append(f"Name: {basic.get('fullName', basic.get('name', 'N/A'))}")
            formatted_parts.append(f"Professional Title: {basic.get('professionalTitle', basic.get('title', 'N/A'))}")
            formatted_parts.append(f"Email: {basic.get('email', 'N/A')}")
            formatted_parts.append(f"Phone: {basic.get('phone', 'N/A')}")
            formatted_parts.append(f"Location: {basic.get('location', 'N/A')}")
            formatted_parts.append(f"LinkedIn: {basic.get('linkedin', 'N/A')}")

        if 'summary' in resume_data:
            formatted_parts.append(f"\nSummary:\n{resume_data['summary']}")

        # Check for skills in multiple possible locations
        skills_found = False
        skills_data = None
        
        # Try different possible keys for skills
        for skill_key in ['skills', 'technical_skills', 'technicalSkills', 'expertise', 'competencies']:
            if skill_key in resume_data:
                skills_data = resume_data[skill_key]
                logger.info(f"Found skills under key '{skill_key}': {type(skills_data)} - {skills_data}")
                skills_found = True
                break
        
        # Also check if skills might be nested under a different structure
        if not skills_found:
            for key in resume_data.keys():
                if 'skill' in key.lower() or 'tech' in key.lower() or 'expertise' in key.lower():
                    potential_skills = resume_data[key]
                    if potential_skills and (isinstance(potential_skills, (list, dict, str))):
                        logger.info(f"Found potential skills under key '{key}': {type(potential_skills)} - {potential_skills}")
                        skills_data = potential_skills
                        skills_found = True
                        break
        
        if skills_found and skills_data:
            logger.info(f"Processing skills data: {type(skills_data)} - {skills_data}")
            
            if isinstance(skills_data, list) and skills_data:
                # Filter out empty strings and None values
                valid_skills = [skill for skill in skills_data if skill and str(skill).strip()]
                if valid_skills:
                    formatted_parts.append(f"\nSkills:\n{', '.join(valid_skills)}")
                else:
                    formatted_parts.append(f"\nSkills:\nNo valid skills found")
            elif isinstance(skills_data, dict):
                skill_text = []
                existing_categories = []
                for category, skill_list in skills_data.items():
                    logger.info(f"Processing skill category '{category}': {type(skill_list)} - {skill_list}")
                    if isinstance(skill_list, list) and skill_list:
                        # Filter out empty strings and None values
                        valid_skills = [skill for skill in skill_list if skill and str(skill).strip()]
                        if valid_skills:
                            skill_text.append(f"{category}: {', '.join(valid_skills)}")
                            existing_categories.append(category)
                    elif isinstance(skill_list, str) and skill_list.strip():
                        skill_text.append(f"{category}: {skill_list}")
                        existing_categories.append(category)
                
                if skill_text:
                    formatted_parts.append(f"\nSkills:\n{'; '.join(skill_text)}")
                    # Add information about existing categories for AI to work with
                    formatted_parts.append(f"\nExisting Skill Categories: {', '.join(existing_categories)}")
                else:
                    formatted_parts.append(f"\nSkills:\nNo skills listed")
            elif isinstance(skills_data, str) and skills_data.strip():
                formatted_parts.append(f"\nSkills:\n{skills_data}")
            else:
                formatted_parts.append(f"\nSkills:\nNo skills listed")
        else:
            formatted_parts.append(f"\nSkills:\nNo skills section found")

        if 'experience' in resume_data:
            formatted_parts.append("\nWork Experience:")
            for job in resume_data['experience']:
                formatted_parts.append(f"\n{job.get('role', job.get('title', 'N/A'))} at {job.get('company', 'N/A')}")
                formatted_parts.append(f"Duration: {job.get('startDate', 'N/A')} - {job.get('endDate', 'N/A')}")
                formatted_parts.append(f"Location: {job.get('location', 'N/A')}")
                if 'description' in job:
                    formatted_parts.append(f"Description: {job.get('description', 'N/A')}")

        if 'education' in resume_data:
            formatted_parts.append("\nEducation:")
            for edu in resume_data['education']:
                formatted_parts.append(f"\n{edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')}")
                formatted_parts.append(f"Duration: {edu.get('startDate', 'N/A')} - {edu.get('endDate', 'N/A')}")
                formatted_parts.append(f"Grade: {edu.get('grade', 'N/A')}")
                if 'description' in edu:
                    formatted_parts.append(f"Description: {edu.get('description', 'N/A')}")

        if 'certifications' in resume_data:
            formatted_parts.append("\nCertifications:")
            for cert in resume_data['certifications']:
                if isinstance(cert, dict):
                    formatted_parts.append(f"• {cert.get('certificateName', 'N/A')} from {cert.get('institueName', 'N/A')}")
                else:
                    formatted_parts.append(f"• {cert}")

        if 'projects' in resume_data:
            formatted_parts.append("\nProjects:")
            for project in resume_data['projects']:
                formatted_parts.append(f"\n{project.get('name', project.get('title', 'N/A'))}")
                formatted_parts.append(f"Description: {project.get('description', 'N/A')}")
                if 'techStack' in project:
                    formatted_parts.append(f"Tech Stack: {project.get('techStack', 'N/A')}")

        formatted_text = "\n".join(formatted_parts)
        logger.info(f"Final formatted resume text:\n{formatted_text}")
        
        # Log the existing skill categories for debugging
        if skills_found and isinstance(skills_data, dict):
            existing_categories = list(skills_data.keys())
            logger.info(f"Available skill categories for AI suggestions: {existing_categories}")
        
        return formatted_text

    
    def _analyze_experience_level(self, resume_data: Dict[str, Any]) -> str:
        """Analyze resume data to determine experience level"""
        try:
            experience = resume_data.get('experience', [])
            if not experience:
                return "Entry level"

            total_years = 0
            current_year = datetime.datetime.now().year
            import re

            for exp in experience:
                start_date = exp.get('startDate', '')
                end_date = exp.get('endDate', '')

                start_year, end_year = None, current_year
                if start_date:
                    year_match = re.search(r'(\d{4})', str(start_date))
                    if year_match:
                        start_year = int(year_match.group(1))
                if end_date and str(end_date).lower() not in ['present', 'current', '']:
                    year_match = re.search(r'(\d{4})', str(end_date))
                    if year_match:
                        end_year = int(year_match.group(1))

                if start_year:
                    years_in_role = max(0, end_year - start_year)
                    years_in_role = min(years_in_role, 10)  # cap outliers
                    total_years += years_in_role

            if total_years <= 2:
                return "Entry level"
            elif total_years <= 4:
                return "Mid level"
            else:
                return "Senior level"

        except Exception as e:
            logger.warning(f"Error analyzing experience level: {str(e)}")
            return "Mid level"

    def _clean_gemini_response(self, response_text: str) -> str:
        """Clean Gemini API response to extract valid JSON"""
        import re
        import json
        
        # Remove markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "")
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "")

        response_text = response_text.strip()
        
        # Try to find JSON content within markdown blocks first
        json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            # Validate the extracted JSON
            try:
                json.loads(json_content)
                return json_content
            except json.JSONDecodeError:
                pass
        
        # Try to find any JSON object in the text
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            # Validate the extracted JSON
            try:
                json.loads(json_content)
                return json_content
            except json.JSONDecodeError:
                pass
        
        # If the entire response looks like JSON, try to clean it
        if response_text.startswith('{') and response_text.endswith('}'):
            # Try to fix common JSON issues
            cleaned = self._fix_common_json_issues(response_text)
            try:
                json.loads(cleaned)
                return cleaned
            except json.JSONDecodeError:
                pass
        
        # If all else fails, try to extract and fix the JSON
        return self._extract_and_fix_json(response_text)
    
    def _fix_common_json_issues(self, json_text: str) -> str:
        """Fix common JSON formatting issues"""
        # Remove any trailing commas before closing brackets/braces
        json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
        
        # Fix missing quotes around property names
        json_text = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_text)
        
        # Fix single quotes to double quotes
        json_text = json_text.replace("'", '"')
        
        # Remove any control characters
        json_text = ''.join(char for char in json_text if ord(char) >= 32 or char in '\n\r\t')
        
        return json_text
    
    def _extract_and_fix_json(self, text: str) -> str:
        """Extract JSON from text and attempt to fix it"""
        import re
        
        # Find the largest potential JSON object
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        if matches:
            # Sort by length to get the largest match
            largest_match = max(matches, key=len)
            
            # Try to fix common issues
            fixed = self._fix_common_json_issues(largest_match)
            
            # Validate
            try:
                json.loads(fixed)
                return fixed
            except json.JSONDecodeError:
                pass
        
        # If we can't extract valid JSON, return a minimal valid structure
        logger.warning("Could not extract valid JSON from AI response, returning fallback structure")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'