import json
import logging
import datetime
import re
from typing import Dict, Any, Optional
from google.generativeai import GenerativeModel
from .gemini_parser_service import GeminiResumeParser

logger = logging.getLogger(__name__)

class AISuggestionService:
    """
    AI service for generating job descriptions and resume suggestions
    
    Optimized for consistent and accurate results with:
    - Low temperature (0.1) for deterministic responses
    - Moderate top_p (0.8) for focused but not overly restrictive output
    - Single candidate generation for consistency
    - Extended token limits for complete responses
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash", temperature: float = 0.1, top_p: float = 0.8):
        """
        Initialize the AI Suggestion Service
        
        Args:
            api_key: Gemini API key (if not provided, will use environment variable)
            model_name: Gemini model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = GeminiResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.model = self.parser.model
        self.temperature = temperature
        self.top_p = top_p
    
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
            
        # Update the model's generation config
        self.model.generation_config.temperature = self.temperature
        self.model.generation_config.top_p = self.top_p
        logger.info(f"Updated generation parameters: temperature={self.temperature}, top_p={self.top_p}")
    
    def get_generation_settings(self) -> Dict[str, float]:
        """Get current generation parameter settings"""
        return {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "model_name": self.parser.model_name
        }

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
            logger.info(f"Generating job description with temperature={self.temperature}, top_p={self.top_p}")
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
        
        # Debug the resume structure first
        debug_info = self.debug_resume_structure(resume_data)
        logger.info(f"Resume structure debug info:\n{debug_info}")
        
        resume_text = self._format_resume_for_comparison(resume_data)
        if not target_experience:
            target_experience = self._analyze_experience_level(resume_data)

        prompt = f"""
        You are an expert resume consultant and recruiter.  
        Compare the following resume with the job description and provide actionable, ready-to-use rewritten improvements.

        CRITICAL RULES - NEVER VIOLATE:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations).
        - NEVER omit any section - if no suggestions exist, return empty strings/arrays but keep the section.
        - ALWAYS include ALL required sections: professionalSummary, skills, workExperience, projects, education, certifications.
        - For each section, include: existing content, suggested rewritten version, and recommendations.
        - Ensure rewrites include strong action verbs, quantified achievements, and relevant keywords from the JD.
        - Tailor rewrites to {target_experience} level.
        - Never leave placeholders like "improve wording" — always provide final rewritten text.
        - ALWAYS provide a numeric overallScore between 0-100 (never "NA", "N/A", or text).
        
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

        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overallScore": 75,
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
                    "rewrite": "",
                    "recommendations": [""]
                }},
                "certifications": {{
                    "existing": [""],
                    "rewrite": "",
                    "recommendations": [""]
                }}
            }},
            "topRecommendations": [
                "Actionable step 1",
                "Actionable step 2",
                "Actionable step 3"
            ]
        }}
        
        REMEMBER: 
        - NEVER omit sections - return empty values instead of missing sections!
        - overallScore MUST be a number between 0-100, never "NA" or text!
        """

        try:
            logger.info(f"Comparing resume with JD using temperature={self.temperature}, top_p={self.top_p}")
            response = self.model.generate_content(prompt)
            
            # Log raw response for debugging
            logger.info(f"🔍 Raw Gemini response length: {len(response.text)} characters")
            logger.debug(f"🔍 Raw Gemini response: {response.text}")
            
            # Check if score exists in raw response
            if 'overallScore' in response.text:
                logger.info("✅ 'overallScore' found in raw response")
            else:
                logger.warning("⚠️ 'overallScore' NOT found in raw response")
            
            cleaned_response = self._clean_gemini_response(response.text)
            logger.info(f"🔍 Cleaned response length: {len(cleaned_response)} characters")
            logger.debug(f"🔍 Cleaned response: {cleaned_response}")
            
            # Check if score exists in cleaned response
            if 'overallScore' in cleaned_response:
                logger.info("✅ 'overallScore' found in cleaned response")
            else:
                logger.warning("⚠️ 'overallScore' NOT found in cleaned response")
            
            # Check if cleaning removed important sections
            if "workExperience" in response.text and "workExperience" not in cleaned_response:
                logger.warning("⚠️ WARNING: workExperience section was removed during cleaning!")
            if "sectionSuggestions" in response.text and "sectionSuggestions" not in cleaned_response:
                logger.warning("⚠️ WARNING: sectionSuggestions was removed during cleaning!")
            if "overallScore" in response.text and "overallScore" not in cleaned_response:
                logger.error("🚨 CRITICAL: overallScore was removed during cleaning!")
            
            ai_response = json.loads(cleaned_response)
            
            # Enforce schema compliance - ensure all required sections are present
            ai_response = self._enforce_schema_compliance(ai_response, resume_data)
            
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
        logger.info(f"🔍 Starting resume formatting with data keys: {list(resume_data.keys())}")
        logger.info(f"🔍 Resume data structure overview:")
        for key, value in resume_data.items():
            if isinstance(value, list):
                logger.info(f"   {key}: List with {len(value)} items")
            elif isinstance(value, dict):
                logger.info(f"   {key}: Dict with keys {list(value.keys())}")
            else:
                logger.info(f"   {key}: {type(value)} - {str(value)[:100]}{'...' if len(str(value)) > 100 else ''}")
        
        logger.info(f"🔍 Full resume data: {resume_data}")
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
            experience_data = resume_data['experience']
            logger.info(f"Processing experience data: {type(experience_data)} - {experience_data}")
            
            if isinstance(experience_data, list) and experience_data:
                for i, job in enumerate(experience_data):
                    logger.info(f"Processing job {i+1}: {type(job)} - {job}")
                    
                    # Handle different possible field names
                    role = job.get('role', job.get('title', job.get('jobTitle', 'N/A')))
                    company = job.get('company', job.get('employer', job.get('organization', 'N/A')))
                    start_date = job.get('startDate', job.get('start', job.get('from', 'N/A')))
                    end_date = job.get('endDate', job.get('end', job.get('to', job.get('current', 'Present'))))
                    location = job.get('location', job.get('city', job.get('place', 'N/A')))
                    description = job.get('description', job.get('responsibilities', job.get('duties', 'N/A')))
                    
                    formatted_parts.append(f"\nJob {i+1}: {role} at {company}")
                    formatted_parts.append(f"Duration: {start_date} - {end_date}")
                    if location and location != 'N/A':
                        formatted_parts.append(f"Location: {location}")
                    if description and description != 'N/A':
                        # Handle both string and list descriptions
                        if isinstance(description, list):
                            desc_text = '; '.join([str(item).strip() for item in description if item and str(item).strip()])
                        else:
                            desc_text = str(description).strip()
                        if desc_text:
                            formatted_parts.append(f"Description: {desc_text}")
                    
                    # Add any additional fields that might be present
                    for key, value in job.items():
                        if key not in ['role', 'title', 'jobTitle', 'company', 'employer', 'organization', 
                                     'startDate', 'start', 'from', 'endDate', 'end', 'to', 'current',
                                     'location', 'city', 'place', 'description', 'responsibilities', 'duties']:
                            if value and str(value).strip() and str(value).strip() != 'N/A':
                                formatted_parts.append(f"{key.title()}: {value}")
            else:
                logger.warning(f"Experience data is not a valid list: {type(experience_data)}")
                formatted_parts.append("No valid experience data found")
        else:
            # Check for alternative experience keys
            experience_found = False
            for exp_key in ['work_experience', 'workExperience', 'employment', 'jobs', 'career']:
                if exp_key in resume_data:
                    logger.info(f"Found experience under alternative key '{exp_key}': {resume_data[exp_key]}")
                    # Recursively format with the alternative key
                    temp_data = {'experience': resume_data[exp_key]}
                    formatted_parts.append("\nWork Experience:")
                    # Reuse the experience formatting logic
                    exp_data = resume_data[exp_key]
                    if isinstance(exp_data, list) and exp_data:
                        for i, job in enumerate(exp_data):
                            role = job.get('role', job.get('title', job.get('jobTitle', 'N/A')))
                            company = job.get('company', job.get('employer', job.get('organization', 'N/A')))
                            start_date = job.get('startDate', job.get('start', job.get('from', 'N/A')))
                            end_date = job.get('endDate', job.get('end', job.get('to', job.get('current', 'Present'))))
                            location = job.get('location', job.get('city', job.get('place', 'N/A')))
                            description = job.get('description', job.get('responsibilities', job.get('duties', 'N/A')))
                            
                            formatted_parts.append(f"\nJob {i+1}: {role} at {company}")
                            formatted_parts.append(f"Duration: {start_date} - {end_date}")
                            if location and location != 'N/A':
                                formatted_parts.append(f"Location: {location}")
                            if description and description != 'N/A':
                                if isinstance(description, list):
                                    desc_text = '; '.join([str(item).strip() for item in description if item and str(item).strip()])
                                else:
                                    desc_text = str(description).strip()
                                if desc_text:
                                    formatted_parts.append(f"Description: {desc_text}")
                    experience_found = True
                    break
            
            if not experience_found:
                logger.warning("No experience section found in resume data")
                formatted_parts.append("\nWork Experience:\nNo experience section found")

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
            logger.info("🔍 Analyzing experience level from resume data")
            
            # Check for experience in multiple possible locations
            experience = None
            experience_keys = ['experience', 'work_experience', 'workExperience', 'employment', 'jobs', 'career']
            
            for key in experience_keys:
                if key in resume_data:
                    experience = resume_data[key]
                    logger.info(f"✅ Found experience data under key '{key}': {type(experience)}")
                    break
            
            if not experience:
                logger.warning("❌ No experience data found in any expected location")
                return "Entry level"

            if not isinstance(experience, list) or not experience:
                logger.warning(f"❌ Experience data is not a valid list: {type(experience)}")
                return "Entry level"

            total_years = 0
            current_year = datetime.datetime.now().year
            import re

            logger.info(f"📊 Processing {len(experience)} experience entries")

            for i, exp in enumerate(experience):
                logger.info(f"   Job {i+1}: {exp}")
                
                start_date = exp.get('startDate', exp.get('start', exp.get('from', '')))
                end_date = exp.get('endDate', exp.get('end', exp.get('to', exp.get('current', ''))))

                start_year, end_year = None, current_year
                if start_date:
                    year_match = re.search(r'(\d{4})', str(start_date))
                    if year_match:
                        start_year = int(year_match.group(1))
                        logger.info(f"     Start year: {start_year}")
                if end_date and str(end_date).lower() not in ['present', 'current', '']:
                    year_match = re.search(r'(\d{4})', str(end_date))
                    if year_match:
                        end_year = int(year_match.group(1))
                        logger.info(f"     End year: {end_year}")

                if start_year:
                    years_in_role = max(0, end_year - start_year)
                    years_in_role = min(years_in_role, 10)  # cap outliers
                    total_years += years_in_role
                    logger.info(f"     Years in role: {years_in_role}")

            logger.info(f"📊 Total calculated experience: {total_years} years")

            if total_years <= 2:
                level = "Entry level"
            elif total_years <= 4:
                level = "Mid level"
            else:
                level = "Senior level"
                
            logger.info(f"🎯 Determined experience level: {level}")
            return level

        except Exception as e:
            logger.warning(f"❌ Error analyzing experience level: {str(e)}")
            return "Mid level"

    def _clean_gemini_response(self, response_text: str) -> str:
        """Clean Gemini API response to extract valid JSON"""
        import re
        import json
        
        logger.info(f"🧹 Cleaning Gemini response of {len(response_text)} characters")
        
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
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON from markdown block: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON from markdown block is invalid")
        
        # Try to find any JSON object in the text
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            # Validate the extracted JSON
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON object: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Extracted JSON object is invalid")
        
        # If the entire response looks like JSON, try to clean it
        if response_text.startswith('{') and response_text.endswith('}'):
            # Try to fix common JSON issues
            cleaned = self._fix_common_json_issues(response_text)
            try:
                parsed = json.loads(cleaned)
                logger.info(f"✅ Successfully cleaned and parsed JSON: {len(cleaned)} characters")
                return cleaned
            except json.JSONDecodeError:
                logger.warning("❌ Cleaned JSON is still invalid")
        
        # If all else fails, try to extract and fix the JSON
        logger.warning("⚠️ All JSON extraction methods failed, attempting recovery")
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

    def _enforce_schema_compliance(self, ai_response: Dict[str, Any], resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces schema compliance for the AI response.
        Ensures all required sections are present, even if the AI skips them.
        """
        logger.info("🔒 Enforcing schema compliance for AI response")
        logger.info(f"🔍 AI response keys: {list(ai_response.keys())}")
        logger.info(f"🔍 AI response overallScore: {ai_response.get('overallScore', 'NOT_FOUND')}")
        logger.info(f"🔍 AI response type: {type(ai_response.get('overallScore', 'NOT_FOUND'))}")
        
        # Define the complete required schema structure
        required_sections = {
            "sectionSuggestions": {
                "professionalSummary": {"existing": "", "rewrite": "", "recommendations": [""]},
                "skills": {"existing": [], "rewrite": [], "recommendations": [""]},
                "workExperience": [],
                "projects": [],
                "education": {"existing": [], "rewrite": "", "recommendations": [""]},
                "certifications": {"existing": [], "rewrite": "", "recommendations": [""]}
            },
            "overallScore": 0,
            "analysisTimestamp": "",
            "topRecommendations": [""]
        }
        
        # Ensure top-level structure exists
        for key, default_value in required_sections.items():
            if key not in ai_response:
                ai_response[key] = default_value
                logger.warning(f"🔒 Enforced missing top-level section: {key}")
        
        # Ensure sectionSuggestions structure exists
        if "sectionSuggestions" not in ai_response:
            ai_response["sectionSuggestions"] = required_sections["sectionSuggestions"]
            logger.warning("🔒 Enforced missing sectionSuggestions structure")
        
        # Validate and fix the overall score
        original_score = ai_response.get("overallScore", 0)
        logger.info(f"🔍 Original overall score: {original_score} (type: {type(original_score)})")
        
        validated_score = self._validate_overall_score(original_score)
        ai_response["overallScore"] = validated_score
        
        logger.info(f"✅ Validated overall score: {validated_score} (type: {type(validated_score)})")
        
        # Validate and fix the analysis timestamp
        ai_response["analysisTimestamp"] = self._validate_timestamp(ai_response.get("analysisTimestamp", ""))
        
        # Enforce each section with fallback to original resume data
        ai_response["sectionSuggestions"] = self._enforce_section_compliance(
            ai_response["sectionSuggestions"], 
            resume_data
        )
        
        # Final validation - ensure score is never "NA" or invalid
        final_score = ai_response.get("overallScore", 0)
        logger.info(f"🔍 Final score before validation: '{final_score}' (type: {type(final_score)})")
        
        if isinstance(final_score, str) and final_score.strip().upper() in ['NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE']:
            logger.error(f"🚨 CRITICAL: Score still 'NA' after validation: '{final_score}', forcing to 0")
            ai_response["overallScore"] = 0
        elif not isinstance(final_score, (int, float)) or final_score < 0 or final_score > 100:
            logger.error(f"🚨 CRITICAL: Invalid score after validation: '{final_score}' (type: {type(final_score)}), forcing to 0")
            ai_response["overallScore"] = 0
        
        # AGGRESSIVE OVERRIDE: Force any remaining "NA" values to be 0
        if str(ai_response.get("overallScore", "")).strip().upper() in ['NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE']:
            logger.error(f"🚨 AGGRESSIVE OVERRIDE: Score still contains 'NA': '{ai_response.get('overallScore')}', forcing to 0")
            ai_response["overallScore"] = 0
        
        logger.info(f"🔍 Final validated score: {ai_response['overallScore']} (type: {type(ai_response['overallScore'])})")
        
        # If score is still 0 (default), calculate a reasonable score based on resume completeness
        if ai_response['overallScore'] == 0:
            calculated_score = self._calculate_resume_score(resume_data)
            ai_response['overallScore'] = calculated_score
            logger.info(f"🔄 Calculated fallback score based on resume completeness: {calculated_score}")
        
        # FINAL CHECK: Ensure the score is absolutely never "NA"
        if str(ai_response['overallScore']).strip().upper() in ['NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE']:
            logger.error(f"🚨 FINAL OVERRIDE: Score still 'NA' at the very end: '{ai_response['overallScore']}', forcing to 50")
            ai_response['overallScore'] = 50
        
        logger.info(f"🎯 ULTIMATE FINAL SCORE: {ai_response['overallScore']} (type: {type(ai_response['overallScore'])})")
        logger.info("✅ Schema compliance enforcement completed")
        return ai_response
    
    def _enforce_section_compliance(self, section_suggestions: Dict[str, Any], resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforces compliance for individual sections, with fallback to original resume data.
        """
        # Handle workExperience section specifically
        if "workExperience" not in section_suggestions or not section_suggestions["workExperience"]:
            logger.warning("🔒 WorkExperience section missing or empty, creating from original resume data")
            section_suggestions["workExperience"] = self._create_experience_fallback(resume_data)
        
        # Handle other sections
        section_defaults = {
            "professionalSummary": {"existing": "", "rewrite": "", "recommendations": [""]},
            "skills": {"existing": [], "rewrite": [], "recommendations": [""]},
            "projects": [],
            "education": {"existing": [], "rewrite": "", "recommendations": [""]},
            "certifications": {"existing": [], "rewrite": "", "recommendations": [""]}
        }
        
        for section_name, default_structure in section_defaults.items():
            if section_name not in section_suggestions:
                section_suggestions[section_name] = default_structure
                logger.warning(f"🔒 Enforced missing section: {section_name}")
            elif isinstance(section_suggestions[section_name], dict):
                # Ensure all required keys exist
                for key, default_value in default_structure.items():
                    if key not in section_suggestions[section_name]:
                        section_suggestions[section_name][key] = default_value
                        logger.warning(f"🔒 Enforced missing key in {section_name}: {key}")
            elif isinstance(section_suggestions[section_name], list) and not section_suggestions[section_name]:
                # For empty lists, provide at least one item
                if section_name == "projects":
                    section_suggestions[section_name] = self._create_projects_fallback(resume_data)
                elif section_name == "workExperience":
                    section_suggestions[section_name] = self._create_experience_fallback(resume_data)
            elif isinstance(section_suggestions[section_name], dict) and not section_suggestions[section_name].get('existing'):
                # For empty dicts, populate with original data
                if section_name == "education":
                    section_suggestions[section_name] = self._create_education_fallback(resume_data)
                elif section_name == "certifications":
                    section_suggestions[section_name] = self._create_certifications_fallback(resume_data)
        
        return section_suggestions
    
    def _create_experience_fallback(self, resume_data: Dict[str, Any]) -> list:
        """
        Creates a fallback workExperience section from the original resume data.
        This ensures the experience section is never missing.
        """
        fallback_experience = []
        
        # Check for experience in multiple possible locations
        experience_data = None
        for exp_key in ['experience', 'work_experience', 'workExperience', 'employment', 'jobs', 'career']:
            if exp_key in resume_data:
                experience_data = resume_data[exp_key]
                break
        
        if experience_data and isinstance(experience_data, list) and experience_data:
            logger.info(f"🔒 Creating experience fallback from {len(experience_data)} original entries")
            for job in experience_data:
                fallback_item = {
                    "role": job.get('role', job.get('title', job.get('jobTitle', 'N/A'))),
                    "existing": self._extract_job_description(job),
                    "rewrite": "",  # AI will fill this
                    "recommendations": [""]  # AI will fill this
                }
                fallback_experience.append(fallback_item)
        else:
            logger.warning("🔒 No original experience data found, creating empty fallback")
            fallback_experience = [{"role": "", "existing": "", "rewrite": "", "recommendations": [""]}]
        
        return fallback_experience
    
    def _create_projects_fallback(self, resume_data: Dict[str, Any]) -> list:
        """
        Creates a fallback projects section from the original resume data.
        This ensures the projects section is never missing.
        """
        fallback_projects = []
        
        # Check for projects in multiple possible locations
        projects_data = None
        for proj_key in ['projects', 'project_experience', 'projectExperience']:
            if proj_key in resume_data:
                projects_data = resume_data[proj_key]
                break
        
        if projects_data and isinstance(projects_data, list) and projects_data:
            logger.info(f"🔒 Creating projects fallback from {len(projects_data)} original entries")
            for project in projects_data:
                project_parts = []
                
                # Only add fields that have actual data
                name = project.get('name', project.get('title', ''))
                if name and name.strip():
                    project_parts.append(name)
                
                description = self._extract_project_description(project)
                if description and description.strip() and description != "No description provided":
                    project_parts.append(description)
                
                if project_parts:
                    existing_text = ' - '.join(project_parts)
                else:
                    existing_text = "Project details available but not formatted"
                
                fallback_item = {
                    "name": name if name and name.strip() else "Project",
                    "existing": existing_text,
                    "rewrite": "",  # AI will fill this
                    "recommendations": [""]  # AI will fill this
                }
                fallback_projects.append(fallback_item)
        else:
            logger.warning("🔒 No original projects data found, creating empty fallback")
            fallback_projects = [{"name": "", "existing": "", "rewrite": "", "recommendations": [""]}]
        
        return fallback_projects

    def _create_education_fallback(self, resume_data: Dict[str, Any]) -> dict:
        """
        Creates a fallback education section from the original resume data.
        This ensures the education section is never missing.
        """
        # Check for education in multiple possible locations
        education_data = None
        for edu_key in ['education', 'educational_background', 'educationalBackground']:
            if edu_key in resume_data:
                education_data = resume_data[edu_key]
                break
        
        if education_data and isinstance(education_data, list) and education_data:
            logger.info(f"🔒 Creating education fallback from {len(education_data)} original entries")
            # Create a formatted string from all education entries
            education_texts = []
            for edu in education_data:
                edu_parts = []
                
                # Only add fields that have actual data
                degree = edu.get('degree', edu.get('title', ''))
                if degree and degree.strip():
                    edu_parts.append(degree)
                
                institution = edu.get('institution', edu.get('school', ''))
                if institution and institution.strip():
                    if edu_parts:
                        edu_parts.append(f"from {institution}")
                    else:
                        edu_parts.append(institution)
                
                start_date = edu.get('startDate', edu.get('from', ''))
                end_date = edu.get('endDate', edu.get('to', ''))
                if start_date and start_date.strip() and end_date and end_date.strip():
                    edu_parts.append(f"({start_date} - {end_date})")
                elif start_date and start_date.strip():
                    edu_parts.append(f"({start_date})")
                
                grade = edu.get('grade', '')
                if grade and grade.strip():
                    edu_parts.append(f"Grade: {grade}")
                
                description = edu.get('description', '')
                if description and description.strip():
                    edu_parts.append(description)
                
                if edu_parts:
                    edu_text = ' '.join(edu_parts)
                    education_texts.append(edu_text)
            
            if education_texts:
                existing_text = '; '.join(education_texts)
            else:
                existing_text = "Education details available but not formatted"
        else:
            logger.warning("🔒 No original education data found, creating empty fallback")
            existing_text = "No education information provided"
        
        return {
            "existing": [existing_text],
            "rewrite": "",  # AI will fill this
            "recommendations": [""]  # AI will fill this
        }

    def _create_certifications_fallback(self, resume_data: Dict[str, Any]) -> dict:
        """
        Creates a fallback certifications section from the original resume data.
        This ensures the certifications section is never missing.
        """
        # Check for certifications in multiple possible locations
        certifications_data = None
        for cert_key in ['certifications', 'professional_certifications', 'professionalCertifications']:
            if cert_key in resume_data:
                certifications_data = resume_data[cert_key]
                break
        
        if certifications_data and isinstance(certifications_data, list) and certifications_data:
            logger.info(f"🔒 Creating certifications fallback from {len(certifications_data)} original entries")
            # Create a formatted string from all certification entries
            cert_texts = []
            for cert in certifications_data:
                cert_parts = []
                
                # Only add fields that have actual data
                cert_name = cert.get('certificateName', cert.get('title', ''))
                if cert_name and cert_name.strip():
                    cert_parts.append(cert_name)
                
                org_name = cert.get('institueName', cert.get('organization', ''))
                if org_name and org_name.strip():
                    if cert_parts:
                        cert_parts.append(f"from {org_name}")
                    else:
                        cert_parts.append(org_name)
                
                issue_date = cert.get('issueDate', '')
                if issue_date and issue_date.strip():
                    cert_parts.append(f"Issued: {issue_date}")
                
                expiry_date = cert.get('expiryDate', '')
                if expiry_date and expiry_date.strip():
                    cert_parts.append(f"Expires: {expiry_date}")
                
                credential_id = cert.get('credentialId', '')
                if credential_id and credential_id.strip():
                    cert_parts.append(f"ID: {credential_id}")
                
                description = cert.get('description', '')
                if description and description.strip():
                    cert_parts.append(description)
                
                if cert_parts:
                    cert_text = ' - '.join(cert_parts)
                    cert_texts.append(cert_text)
            
            if cert_texts:
                existing_text = '; '.join(cert_texts)
            else:
                existing_text = "Certification details available but not formatted"
        else:
            logger.warning("🔒 No original certifications data found, creating empty fallback")
            existing_text = "No certifications provided"
        
        return {
            "existing": [existing_text],
            "rewrite": "",  # AI will fill this
            "recommendations": [""]  # AI will fill this
        }

    def _extract_job_description(self, job: Dict[str, Any]) -> str:
        """
        Extracts job description from various possible field names.
        """
        description_fields = ['description', 'responsibilities', 'duties', 'summary', 'achievements']
        
        for field in description_fields:
            if field in job and job[field]:
                desc = job[field]
                if isinstance(desc, list):
                    return '; '.join([str(item).strip() for item in desc if item and str(item).strip()])
                elif isinstance(desc, str) and desc.strip():
                    return desc.strip()
        
        return "No description provided"

    def _extract_project_description(self, project: Dict[str, Any]) -> str:
        """
        Extracts project description from various possible field names.
        """
        description_fields = ['description', 'summary', 'achievements']
        
        for field in description_fields:
            if field in project and project[field]:
                desc = project[field]
                if isinstance(desc, list):
                    return '; '.join([str(item).strip() for item in desc if item and str(item).strip()])
                elif isinstance(desc, str) and desc.strip():
                    return desc.strip()
        
        return "No description provided"

    def _extract_education_description(self, edu: Dict[str, Any]) -> str:
        """
        Extracts education description from various possible field names.
        """
        description_fields = ['description', 'summary']
        
        for field in description_fields:
            if field in edu and edu[field]:
                desc = edu[field]
                if isinstance(desc, list):
                    return '; '.join([str(item).strip() for item in desc if item and str(item).strip()])
                elif isinstance(desc, str) and desc.strip():
                    return desc.strip()
        
        return "No description provided"

    def _extract_certification_description(self, cert: Dict[str, Any]) -> str:
        """
        Extracts certification description from various possible field names.
        """
        description_fields = ['description', 'summary']
        
        for field in description_fields:
            if field in cert and cert[field]:
                desc = cert[field]
                if isinstance(desc, list):
                    return '; '.join([str(item).strip() for item in desc if item and str(item).strip()])
                elif isinstance(desc, str) and desc.strip():
                    return desc.strip()
        
        return "No description provided"

    def debug_resume_structure(self, resume_data: Dict[str, Any]) -> str:
        """
        Debug method to inspect resume data structure and identify issues
        
        Args:
            resume_data: Resume data dictionary
            
        Returns:
            Debug information as string
        """
        debug_info = []
        debug_info.append("🔍 RESUME DATA STRUCTURE DEBUG")
        debug_info.append("=" * 50)
        
        # Show all top-level keys
        debug_info.append(f"📋 Top-level keys found: {list(resume_data.keys())}")
        
        # Check for experience-related keys
        experience_keys = []
        for key in resume_data.keys():
            if any(exp_term in key.lower() for exp_term in ['experience', 'work', 'employment', 'job', 'career']):
                experience_keys.append(key)
        
        debug_info.append(f"🎯 Experience-related keys: {experience_keys}")
        
        # Detailed inspection of experience data
        if 'experience' in resume_data:
            exp_data = resume_data['experience']
            debug_info.append(f"\n💼 Experience data type: {type(exp_data)}")
            debug_info.append(f"💼 Experience data length: {len(exp_data) if isinstance(exp_data, list) else 'Not a list'}")
            debug_info.append(f"💼 Experience data content: {exp_data}")
            
            if isinstance(exp_data, list) and exp_data:
                debug_info.append(f"\n📝 First job details:")
                first_job = exp_data[0]
                debug_info.append(f"   Job type: {type(first_job)}")
                debug_info.append(f"   Job keys: {list(first_job.keys()) if isinstance(first_job, dict) else 'Not a dict'}")
                debug_info.append(f"   Job content: {first_job}")
        else:
            debug_info.append("\n❌ No 'experience' key found")
            
            # Check alternative keys
            for alt_key in ['work_experience', 'workExperience', 'employment', 'jobs', 'career']:
                if alt_key in resume_data:
                    debug_info.append(f"✅ Found alternative key: '{alt_key}'")
                    alt_data = resume_data[alt_key]
                    debug_info.append(f"   Data type: {type(alt_data)}")
                    debug_info.append(f"   Data length: {len(alt_data) if isinstance(alt_data, list) else 'Not a list'}")
                    debug_info.append(f"   Data content: {alt_data}")
        
        # Show sample of other sections
        debug_info.append(f"\n📚 Other sections found:")
        for key, value in resume_data.items():
            if key not in ['experience', 'work_experience', 'workExperience', 'employment', 'jobs', 'career']:
                if isinstance(value, list):
                    debug_info.append(f"   {key}: List with {len(value)} items")
                elif isinstance(value, dict):
                    debug_info.append(f"   {key}: Dict with keys {list(value.keys())}")
                else:
                    debug_info.append(f"   {key}: {type(value)} - {str(value)[:100]}{'...' if len(str(value)) > 100 else ''}")
        
        return "\n".join(debug_info)

    def _validate_overall_score(self, score: Any) -> int:
        """
        Validates and ensures the overall score is a number between 0 and 100.
        If it's "NA", "N/A", or an invalid type, it defaults to 0.
        """
        # Handle string variations of "NA"
        if isinstance(score, str):
            score_str = score.strip().upper()
            if score_str in ['NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE']:
                logger.warning(f"⚠️ 'NA' score detected: '{score}', defaulting to 0.")
                return 0
        
        try:
            score_int = int(score)
            return max(0, min(100, score_int))
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid overall score '{score}' detected, defaulting to 0.")
            return 0

    def _validate_timestamp(self, timestamp: str) -> str:
        """
        Validates and ensures the timestamp is in a valid ISO format.
        If it's not, it defaults to the current UTC timestamp.
        """
        try:
            datetime.datetime.fromisoformat(timestamp)
            return timestamp
        except (ValueError, TypeError):
            logger.warning(f"⚠️ Invalid timestamp '{timestamp}' detected, defaulting to current UTC timestamp.")
            return datetime.datetime.utcnow().isoformat() + "Z"

    def _calculate_resume_score(self, resume_data: Dict[str, Any]) -> int:
        """
        Calculates a default score based on the completeness of the resume data.
        This is a heuristic and might need adjustment based on specific criteria.
        """
        score = 0
        total_possible_points = 100
        
        # Check for basic details
        if 'basic_details' in resume_data and resume_data['basic_details'].get('fullName') and resume_data['basic_details'].get('professionalTitle'):
            score += 10
        if 'email' in resume_data['basic_details'] and resume_data['basic_details']['email']:
            score += 5
        if 'phone' in resume_data['basic_details'] and resume_data['basic_details']['phone']:
            score += 5
        if 'location' in resume_data['basic_details'] and resume_data['basic_details']['location']:
            score += 5
        if 'linkedin' in resume_data['basic_details'] and resume_data['basic_details']['linkedin']:
            score += 10

        # Check for summary
        if 'summary' in resume_data and resume_data['summary']:
            score += 15

        # Check for skills
        if 'skills' in resume_data and isinstance(resume_data['skills'], dict):
            if resume_data['skills'].get('technical') or resume_data['skills'].get('soft') or resume_data['skills'].get('programming') or resume_data['skills'].get('tools'):
                score += 15
            else:
                score += 5 # Penalize if no skills listed
        elif 'skills' in resume_data and isinstance(resume_data['skills'], list):
            if resume_data['skills']:
                score += 10
            else:
                score += 5 # Penalize if no skills listed

        # Check for experience
        if 'experience' in resume_data and isinstance(resume_data['experience'], list) and resume_data['experience']:
            score += 20
            for job in resume_data['experience']:
                if job.get('role') and job.get('company') and job.get('startDate') and job.get('endDate'):
                    score += 5
                elif job.get('role') or job.get('company'):
                    score += 2
                elif job.get('startDate') or job.get('endDate'):
                    score += 1

        # Check for education