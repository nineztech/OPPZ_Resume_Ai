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
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash", temperature: float = 0.3, top_p: float = 0.8):
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
        
        # Set consistent parameters for reliable output
        self.set_consistent_parameters()
    
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
            "model_name": self.parser.model_name
        }

    def set_consistent_parameters(self):
        """
        Set parameters optimized for consistent AI suggestion results.
        Uses moderate temperature and focused top_p for balanced output.
        """
        self.update_generation_parameters(temperature=0.3, top_p=0.8)
        logger.info("🎯 Set consistent parameters for deterministic AI suggestions")

    def generate_job_description(self, sector: str, country: str, designation: str, resume_data: Optional[Dict[str, Any]] = None, experience_level: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a job description tailored to the role, sector, country, and experience level.
        If experience_level not provided, infer it from resume_data.
        """
        # Ensure consistent parameters for reliable output
        self.set_consistent_parameters()
        
        # Infer experience level if not provided
        if experience_level:
            target_experience = experience_level
            logger.info(f"🎯 Using provided experience level: {target_experience}")
        elif resume_data:
            logger.info(f"🎯 generate_job_description: Calling _analyze_experience_level with resume_data")
            logger.info(f"🎯 generate_job_description: resume_data type: {type(resume_data)}")
            logger.info(f"🎯 generate_job_description: resume_data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'N/A'}")
            target_experience = self._analyze_experience_level(resume_data)
            logger.info(f"🎯 generate_job_description: Analyzed experience level from resume: {target_experience}")
        else:
            # If no resume data is provided, use a more intelligent default
            # Instead of always defaulting to "Mid level", analyze the context
            target_experience = self._get_intelligent_default_experience(sector, designation)
            logger.info(f"🎯 Using intelligent default experience level: {target_experience}")

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
            generation_config = {
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": 40,
                "max_output_tokens": 8192,
                "candidate_count": 1
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)
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
        # Ensure consistent parameters for reliable output
        self.set_consistent_parameters()
        
        logger.info(f"Starting resume comparison with data keys: {list(resume_data.keys())}")
        logger.info(f"Skills data in resume: {resume_data.get('skills', 'NOT_FOUND')}")
        
        # Debug the resume structure first
        debug_info = self.debug_resume_structure(resume_data)
        logger.info(f"Resume structure debug info:\n{debug_info}")
        
        resume_text = self._format_resume_for_comparison(resume_data)
        if not target_experience:
            logger.info(f"🎯 compare_resume_with_jd: Calling _analyze_experience_level with resume_data")
            logger.info(f"🎯 compare_resume_with_jd: resume_data type: {type(resume_data)}")
            logger.info(f"🎯 compare_resume_with_jd: resume_data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'N/A'}")
            target_experience = self._analyze_experience_level(resume_data)
            logger.info(f"🎯 compare_resume_with_jd: Analyzed experience level from resume: {target_experience}")

        prompt = f"""
        You are an expert resume consultant and recruiter.  
        Compare the following resume with the job description and provide actionable, ready-to-use rewritten improvements.

        CRITICAL RULES - NEVER VIOLATE:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations,no errors).
        - NEVER omit any section - if no suggestions exist, return empty strings/arrays but keep the section.
        - ALWAYS include ALL required sections: professionalSummary, skills, workExperience, projects, education, certifications.
        - For each section, include: existing content, suggested rewritten version, and recommendations.
        - Ensure rewrites include strong action verbs, quantified achievements, and relevant keywords from the JD.
        - Tailor rewrites to {target_experience} level.
        - Never leave placeholders like "improve wording" — always provide final rewritten text.
        - ALWAYS provide a numeric overallScore between 0-100 (never "NA", "N/A", or text).
        - NEVER use "NA", "N/A", "None", "Null", "Unknown", or similar placeholder values - use empty strings or appropriate defaults instead.
        - NO REPETITIONS: Avoid repeating the Same Words or Sentences in different sections. Instead use synonyms or different words to avoid repetition.
        - SPELLING & GRAMMAR: Ensure all rewritten content has perfect spelling, grammar, and professional language.
    
        OVERALL SCORE CALCULATION RULES:
        - Calculate overallScore based on how well the resume matches the job description requirements
        - Score 90-100: Excellent match - resume perfectly aligns with JD requirements, strong keywords, relevant experience
        - Score 80-89: Very good match - resume mostly aligns with JD, minor improvements needed
        - Score 70-79: Good match - resume has potential but needs significant improvements to align with JD
        - Score 60-69: Fair match - resume has some relevant elements but major improvements needed
        - Score 50-59: Poor match - resume lacks many JD requirements, substantial improvements needed
        - Score 0-49: Very poor match - resume significantly misaligned with JD requirements
        
        REPETITION RULES:
        - Do NOT repeat strong action verbs (e.g., "implemented", "developed", "managed").
        - one strong action verb can be used only once in whole resume whole parsed data and also cannot be used in creating something new or in rewrite. IT IS MANDATORY !IMPORTANT please implement this PRIOR
        - Use synonyms or varied verbs to avoid repetition while keeping professional tone.
        - Repetition of common stopwords (e.g., "the", "a", "and", "is", "to") is ALLOWED and should not be flagged.
        - If multiple sentences start the same way (e.g., "I developed A. I developed B."), MERGE them into a single professionally framed sentence (e.g., "I developed A and B.").
        
        SPELLING & GRAMMAR RULES:
        - All rewritten content MUST have perfect spelling, grammar, and punctuation.
        - Ensure sentences are professionally framed and concise.
        - Avoid informal language, filler words, or awkward phrasing.
        - Merge repetitive sentence structures into smooth, grammatically correct sentences.
        - Maintain consistent tense (use past tense for completed work, present tense for ongoing responsibilities).
        - Always use professional, business-appropriate language.

        SCORING FACTORS TO CONSIDER:
        - Skills alignment: How well do resume skills match JD requirements?
        - Experience relevance: Does work experience align with job responsibilities?
        - Keyword matching: Are important JD keywords present in resume?
        - Quantified achievements: Does resume show measurable results?
        - Professional summary: Does it effectively communicate value proposition?
        - Education/certifications: Do they meet JD requirements?
        - Overall presentation: Is resume well-structured and professional?
        
        CRITICAL SKILLS RULES:
        - For skills section: ONLY suggest skills that can be added to EXISTING categories shown in the resume.
        - Do NOT create new category objects or suggest new skill categories.
        - Only add missing skills to existing categories (e.g., if "Java" is missing from "Programming Languages", add it there).
        - If a skill doesn't fit any existing category, do NOT suggest it.
        - Focus on enhancing existing skill categories with relevant missing skills from the job description.
        - In the "rewrite" field: ONLY include categories that have NEW skills to add, and ONLY list the NEW skills (not existing ones).
        - Format skills as "Category: new_skill1, new_skill2" where Category must exist in the resume and skills are NEW additions only.
        - Example: If resume has "Programming Languages: Java, Python" and job needs "JavaScript", suggest "Programming Languages: JavaScript" (not "Programming Languages: Java, Python, JavaScript").
        - If a category has no new skills to add, do NOT include that category in the rewrite at all.
        - Do NOT suggest "New Category: skills" - only use existing categories.

        CRITICAL PROJECTS RULES:
        - If NO projects exist in the resume, create exactly 2 dummy projects that match the job description requirements.
        - Each dummy project must have: name, existing (empty), rewrite (detailed project description), and recommendations.
        - Dummy projects should be relevant to the job role and demonstrate skills mentioned in the job description.
        - If projects DO exist, enhance their descriptions in the "rewrite" field to better match the job description.
        - Project descriptions should include: technologies used, achievements, impact, and relevance to the target role.
        - Use strong action verbs and quantified results where possible.
        - Ensure project names and descriptions align with the {target_experience} level and job requirements.

        RESUME DATA:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overallScore": <calculate_dynamic_score_based_on_resume_jd_match>,
            "analysisTimestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "sectionSuggestions": {{
                "professionalSummary": {{
                    "existing": "",
                    "rewrite": "",
                    "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]
                }},
                "skills": {{
                    "existing": [""],
                    "rewrite": [""],
                    "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]
                }},
                "workExperience": [
                    {{
                        "role": "",
                        "existing": "",
                        "rewrite": "",
                        "recommendations": ["Quantify achievements with specific numbers and percentages", "Use strong action verbs to start each bullet point", "Highlight leadership and team collaboration examples", "Include relevant technologies and tools used"]
                    }}
                ],
                "projects": [
                    {{
                        "name": "",
                        "existing": "",
                        "rewrite": "",
                        "recommendations": ["Enhance project description with specific technologies used", "Add quantified results and achievements", "Include project duration and team size", "Highlight relevant skills gained"]
                    }}
                ],
                "education": {{
                    "existing": [""],
                    "rewrite": "",
                    "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]
                }},
                "certifications": {{
                    "existing": [""],
                    "rewrite": "",
                    "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]
                }}
            }},
            "topRecommendations": [
                "Review and enhance your professional summary with relevant keywords",
                "Add technical skills that match the job description requirements",
                "Quantify achievements in work experience with specific numbers and results"
            ]
        }}
        
        REMEMBER: 
        - NEVER omit sections - return empty values instead of missing sections!
        - overallScore MUST be a number between 0-100, never "NA" or text!
        """

        try:
            logger.info(f"Comparing resume with JD using temperature={self.temperature}, top_p={self.top_p}")
            logger.info(f"🔍 Starting AI response generation...")
            generation_config = {
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": 40,
                "max_output_tokens": 8192,
                "candidate_count": 1
            }
            response = self.model.generate_content(prompt, generation_config=generation_config)
            
            # Check if the response was blocked or filtered
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'finish_reason') and candidate.finish_reason == 2:
                    logger.error("🚨 Gemini response was blocked/filtered (finish_reason=2)")
                    logger.error("🚨 Creating fallback response due to content filtering")
                    # Create a comprehensive fallback response
                    ai_response = self._create_comprehensive_fallback_response(resume_data, job_description, target_experience)
                    logger.warning("⚠️ Using comprehensive fallback response due to content filtering")
                    return ai_response
            
            # Check if response.text is accessible and not empty
            try:
                response_text = response.text
                if not response_text or not response_text.strip():
                    logger.error("🚨 Gemini response is empty or None")
                    logger.error("🚨 Creating fallback response due to empty response")
                    # Create a comprehensive fallback response
                    ai_response = self._create_comprehensive_fallback_response(resume_data, job_description, target_experience)
                    logger.warning("⚠️ Using comprehensive fallback response due to empty response")
                    return ai_response
            except Exception as text_error:
                logger.error(f"🚨 Error accessing response.text: {str(text_error)}")
                logger.error("🚨 This usually indicates the response was blocked or filtered")
                logger.error("🚨 Creating fallback response due to response access error")
                # Create a comprehensive fallback response
                ai_response = self._create_comprehensive_fallback_response(resume_data, job_description, target_experience)
                logger.warning("⚠️ Using comprehensive fallback response due to response access error")
                return ai_response
            
            # Log raw response for debugging
            logger.info(f"🔍 Raw Gemini response length: {len(response_text)} characters")
            logger.debug(f"🔍 Raw Gemini response: {response_text}")
            
            # Check if score exists in raw response
            if 'overallScore' in response_text:
                logger.info("✅ 'overallScore' found in raw response")
            else:
                logger.warning("⚠️ 'overallScore' NOT found in raw response")
            
            # Check for key sections in raw response
            key_sections = ['sectionSuggestions', 'workExperience', 'skills', 'projects', 'education', 'certifications']
            for section in key_sections:
                if section in response_text:
                    logger.info(f"✅ '{section}' found in raw response")
                    # Show context around the section
                    section_pos = response_text.find(section)
                    if section_pos > 0:
                        context_start = max(0, section_pos - 50)
                        context_end = min(len(response_text), section_pos + 100)
                        context = response_text[context_start:context_end]
                        logger.info(f"   Context around '{section}': {context}")
                else:
                    logger.warning(f"⚠️ '{section}' NOT found in raw response")
            
            # Check for overallScore in raw response
            if 'overallScore' in response_text:
                score_pos = response_text.find('overallScore')
                if score_pos > 0:
                    context_start = max(0, score_pos - 30)
                    context_end = min(len(response_text), score_pos + 50)
                    score_context = response_text[context_start:context_end]
                    logger.info(f"   Context around 'overallScore': {score_context}")
            
            cleaned_response = self._clean_gemini_response(response_text)
            logger.info(f"🔍 Cleaned response length: {len(cleaned_response)} characters")
            logger.debug(f"🔍 Cleaned response: {cleaned_response}")
            
            # Check if score exists in cleaned response
            if 'overallScore' in cleaned_response:
                logger.info("✅ 'overallScore' found in cleaned response")
            else:
                logger.warning("⚠️ 'overallScore' NOT found in cleaned response")
            
            # Check if cleaning removed important sections
            if "workExperience" in response_text and "workExperience" not in cleaned_response:
                logger.warning("⚠️ WARNING: workExperience section was removed during cleaning!")
            if "sectionSuggestions" in response_text and "sectionSuggestions" not in cleaned_response:
                logger.warning("⚠️ WARNING: sectionSuggestions was removed during cleaning!")
            if "overallScore" in response_text and "overallScore" not in cleaned_response:
                logger.error("🚨 CRITICAL: overallScore was removed during cleaning!")
            
            # Log the first 200 characters of cleaned response for debugging
            logger.info(f"🔍 First 200 chars of cleaned response: {cleaned_response[:200]}")
            logger.info(f"🔍 Last 200 chars of cleaned response: {cleaned_response[-200:]}")
            
            # Check if the response contains the expected structure
            expected_keys = ['overallScore', 'sectionSuggestions', 'workExperience', 'skills']
            missing_keys = [key for key in expected_keys if key not in cleaned_response]
            
            # Initialize present_keys to avoid reference error
            present_keys = []
            for key in ['existing', 'rewrite', 'recommendations', 'overallScore', 'sectionSuggestions', 'workExperience', 'skills', 'projects', 'education', 'certifications']:
                if key in cleaned_response:
                    present_keys.append(key)
            
            if missing_keys:
                logger.warning(f"⚠️ Missing expected keys in cleaned response: {missing_keys}")
                logger.warning(f"⚠️ This suggests the JSON extraction is incomplete")
                
                logger.info(f"🔍 Keys actually present in cleaned response: {present_keys}")
                
                # If we only have fragment keys, this is a problem
                if set(present_keys).issubset({'existing', 'rewrite', 'recommendations'}):
                    logger.error("🚨 CRITICAL: Only fragment keys found - JSON extraction is incomplete!")
                    logger.error("🚨 The system extracted only a portion of the response instead of the complete structure")
            else:
                logger.info(f"✅ All expected keys found in cleaned response")
            
            # Check if the response is incomplete (only fragment keys)
            if set(present_keys).issubset({'existing', 'rewrite', 'recommendations'}):
                logger.error("🚨 Detected incomplete JSON response - attempting recovery...")
                
                # Try to extract the complete response again with more aggressive methods
                logger.info("🔄 Attempting aggressive JSON recovery...")
                recovered_response = self._aggressive_json_recovery(response_text)
                
                if recovered_response and recovered_response != cleaned_response:
                    logger.info(f"🔄 Recovered response length: {len(recovered_response)} characters")
                    cleaned_response = recovered_response
                    
                    # Re-check the keys
                    present_keys = []
                    for key in ['existing', 'rewrite', 'recommendations', 'overallScore', 'sectionSuggestions', 'workExperience', 'skills', 'projects', 'education', 'certifications']:
                        if key in cleaned_response:
                            present_keys.append(key)
                    
                    logger.info(f"🔍 Keys after recovery: {present_keys}")
            
            # Additional check for incomplete JSON structure
            if 'sectionSuggestions' in cleaned_response and not cleaned_response.strip().startswith('{"overallScore"'):
                logger.info("🔍 Detected potentially incomplete JSON structure, attempting to fix...")
                fixed_response = self._detect_and_fix_incomplete_json(cleaned_response)
                if fixed_response != cleaned_response:
                    logger.info(f"🔄 Fixed incomplete JSON structure: {len(fixed_response)} characters")
                    cleaned_response = fixed_response
            
            try:
                ai_response = json.loads(cleaned_response)
                logger.info(f"✅ Successfully parsed JSON response with {len(cleaned_response)} characters")
            except json.JSONDecodeError as json_error:
                logger.error(f"🚨 Failed to parse cleaned JSON response: {str(json_error)}")
                logger.error(f"🚨 Cleaned response that failed: {cleaned_response}")
                
                # Try to extract a valid JSON portion
                logger.info("🔄 Attempting to extract valid JSON portion...")
                valid_json = self._extract_and_fix_json(cleaned_response)
                
                try:
                    ai_response = json.loads(valid_json)
                    logger.info(f"✅ Successfully parsed extracted JSON: {len(valid_json)} characters")
                except json.JSONDecodeError as second_error:
                    logger.error(f"🚨 Even extracted JSON failed: {str(second_error)}")
                    # Create a minimal fallback response
                    ai_response = {
                        "overallScore": 0,  # Will be calculated dynamically
                        "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                        "sectionSuggestions": {
                            "professionalSummary": {"existing": "", "rewrite": "", "recommendations": [""]},
                            "skills": {"existing": [], "rewrite": [], "recommendations": [""]},
                            "workExperience": [],
                            "projects": [],
                            "education": {"existing": [], "rewrite": "", "recommendations": [""]},
                            "certifications": {"existing": [], "rewrite": "", "recommendations": [""]}
                        },
                        "topRecommendations": [""]
                    }
                    logger.warning("⚠️ Using fallback response structure")
            
            # Enforce schema compliance - ensure all required sections are present
            logger.info(f"🔍 Starting schema compliance enforcement...")
            try:
                ai_response = self._enforce_schema_compliance(ai_response, resume_data, job_description)
                logger.info(f"✅ Schema compliance enforcement completed")
            except Exception as e:
                logger.error(f"🚨 Error during schema compliance enforcement: {str(e)}")
                logger.error(f"🚨 AI response type: {type(ai_response)}")
                logger.error(f"🚨 AI response keys: {list(ai_response.keys()) if isinstance(ai_response, dict) else 'Not a dict'}")
                raise
            
            # Log the structure of the parsed AI response
            logger.info(f"🔍 Parsed AI response structure:")
            logger.info(f"   - Keys: {list(ai_response.keys())}")
            logger.info(f"   - overallScore: {ai_response.get('overallScore', 'NOT_FOUND')}")
            if 'sectionSuggestions' in ai_response:
                section_keys = list(ai_response['sectionSuggestions'].keys())
                logger.info(f"   - sectionSuggestions keys: {section_keys}")
                
                # Log the structure of each section
                try:
                    for section_name, section_data in ai_response['sectionSuggestions'].items():
                        if isinstance(section_data, dict):
                            section_data_keys = list(section_data.keys())
                            logger.info(f"   - {section_name} section keys: {section_data_keys}")
                        elif isinstance(section_data, list):
                            logger.info(f"   - {section_name} section: List with {len(section_data)} items")
                        else:
                            logger.info(f"   - {section_name} section: {type(section_data)}")
                except Exception as e:
                    logger.error(f"🚨 Error iterating over sectionSuggestions: {str(e)}")
                    logger.error(f"🚨 sectionSuggestions type: {type(ai_response['sectionSuggestions'])}")
                    raise
            else:
                logger.warning("⚠️ No sectionSuggestions in AI response")
            
            # Validate that skills suggestions only reference existing categories and remove duplicate skills
            if 'sectionSuggestions' in ai_response and 'skills' in ai_response['sectionSuggestions']:
                skills_suggestions = ai_response['sectionSuggestions']['skills']
                if 'rewrite' in skills_suggestions and isinstance(skills_suggestions['rewrite'], list):
                    # Get existing categories and skills from resume data
                    existing_categories = []
                    existing_skills = set()
                    
                    # Handle different skills data structures
                    skills_data = resume_data.get('skills')
                    if isinstance(skills_data, dict):
                        existing_categories = list(skills_data.keys())
                        # Extract all existing skills from each category
                        for category, skill_list in skills_data.items():
                            if isinstance(skill_list, list):
                                for skill in skill_list:
                                    if skill and str(skill).strip():
                                        existing_skills.add(str(skill).strip().lower())
                            elif isinstance(skill_list, str) and skill_list.strip():
                                existing_skills.add(skill_list.strip().lower())
                    elif isinstance(skills_data, list):
                        # If skills is a flat list, treat all skills as uncategorized
                        existing_skills = set()
                        for skill in skills_data:
                            if skill and str(skill).strip():
                                existing_skills.add(str(skill).strip().lower())
                        logger.info(f"Skills data is a list with {len(existing_skills)} unique skills")
                    elif isinstance(skills_data, str):
                        # If skills is a string, split and add to existing skills
                        existing_skills = set()
                        if skills_data.strip():
                            skills_list = [skill.strip() for skill in skills_data.split(',') if skill.strip()]
                            existing_skills.update([skill.lower() for skill in skills_list])
                        logger.info(f"Skills data is a string with {len(existing_skills)} unique skills")
                    else:
                        logger.warning(f"Unexpected skills data type: {type(skills_data)}")
                    
                    # Filter skills suggestions to only include existing categories and remove duplicate skills
                    if existing_categories or existing_skills:
                        filtered_rewrite = []
                        
                        # Create a map of existing skills per category for better tracking
                        existing_skills_per_category = {}
                        if isinstance(skills_data, dict):
                            for category, skill_list in skills_data.items():
                                category_skills = set()
                                if isinstance(skill_list, list):
                                    for skill in skill_list:
                                        if skill and str(skill).strip():
                                            category_skills.add(str(skill).strip().lower())
                                elif isinstance(skill_list, str) and skill_list.strip():
                                    category_skills.add(skill_list.strip().lower())
                                existing_skills_per_category[category] = category_skills
                        
                        for skill_line in skills_suggestions['rewrite']:
                            if isinstance(skill_line, str) and ':' in skill_line:
                                # Handle categorized skills (e.g., "Technical: Python, Java")
                                category = skill_line.split(':')[0].strip()
                                if existing_categories and category in existing_categories:
                                    # Extract skills from this line and check for duplicates
                                    skills_part = skill_line.split(':', 1)[1].strip()
                                    if skills_part:
                                        # Split skills by comma and filter out existing ones
                                        individual_skills = [skill.strip() for skill in skills_part.split(',') if skill.strip()]
                                        new_skills = []
                                        
                                        # Get existing skills for this specific category
                                        category_existing_skills = existing_skills_per_category.get(category, set())
                                        
                                        for skill in individual_skills:
                                            # Check if skill exists in this specific category
                                            if skill.lower() not in category_existing_skills:
                                                new_skills.append(skill)
                                                logger.info(f"Adding new skill to {category}: {skill}")
                                            else:
                                                logger.info(f"Filtering out duplicate skill: {skill} (already exists in {category})")
                                        
                                        # Only add the category line if there are actually new skills to add
                                        if new_skills:
                                            new_skill_line = f"{category}: {', '.join(new_skills)}"
                                            filtered_rewrite.append(new_skill_line)
                                            logger.info(f"Including {category} in rewrite with {len(new_skills)} new skills: {', '.join(new_skills)}")
                                        else:
                                            logger.info(f"Excluding {category} from rewrite - no new skills to add")
                                    else:
                                        # Empty skills part, skip this line
                                        logger.info(f"Skipping {category} - no skills specified")
                                elif not existing_categories:
                                    # No categories defined, treat as uncategorized skills
                                    skills_part = skill_line.split(':', 1)[1].strip()
                                    if skills_part:
                                        individual_skills = [skill.strip() for skill in skills_part.split(',') if skill.strip()]
                                        new_skills = []
                                        for skill in individual_skills:
                                            if skill.lower() not in existing_skills:
                                                new_skills.append(skill)
                                            else:
                                                logger.info(f"Filtering out duplicate skill: {skill} (already exists)")
                                        
                                        if new_skills:
                                            new_skill_line = f"{category}: {', '.join(new_skills)}"
                                            filtered_rewrite.append(new_skill_line)
                                            logger.info(f"Keeping skill suggestion for category with new skills: {category}")
                                        else:
                                            logger.info(f"Excluding {category} from rewrite - no new skills to add")
                                else:
                                    logger.warning(f"Filtering out skill suggestion for non-existing category: {category}")
                            else:
                                # Single skill without category, check if it already exists
                                if isinstance(skill_line, str) and skill_line.strip():
                                    skill_name = skill_line.strip()
                                    if skill_name.lower() not in existing_skills:
                                        filtered_rewrite.append(skill_line)
                                        logger.info(f"Keeping single skill suggestion: {skill_name}")
                                    else:
                                        logger.info(f"Filtering out duplicate skill: {skill_name}")
                        
                        skills_suggestions['rewrite'] = filtered_rewrite
                        logger.info(f"Filtered skills suggestions to {len(filtered_rewrite)} items, removing duplicates from existing data")
            
            # FINAL NA VALIDATION: Double-check that no "NA" values exist anywhere in the response
            logger.info(f"🔍 Starting final NA validation...")
            ai_response = self._final_na_validation(ai_response)
            logger.info(f"✅ Final NA validation completed")
            
            return ai_response
        except json.JSONDecodeError as json_error:
            logger.error(f"🚨 Failed to parse Gemini JSON response: {str(json_error)}")
            logger.error(f"🚨 Raw response: {cleaned_response}")
            
            # Try to create a fallback response instead of raising an error
            logger.info("🔄 JSON parsing failed, creating fallback response...")
            try:
                fallback_response = self._create_comprehensive_fallback_response(resume_data, job_description, target_experience or "Mid level")
                logger.info("✅ Fallback response created successfully after JSON parsing failure")
                return fallback_response
            except Exception as fallback_error:
                logger.error(f"🚨 Fallback response creation also failed: {str(fallback_error)}")
                # Return a minimal emergency response
                emergency_response = {
                    "overallScore": 50,
                    "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "sectionSuggestions": {
                        "professionalSummary": {"existing": "", "rewrite": "", "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]},
                        "skills": {"existing": [], "rewrite": [], "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]},
                        "workExperience": [{"role": "", "existing": "", "rewrite": "", "recommendations": ["Quantify achievements with specific numbers and percentages", "Use strong action verbs to start each bullet point", "Highlight leadership and team collaboration examples", "Include relevant technologies and tools used"]}],
                        "projects": [{"name": "", "existing": "", "rewrite": "", "recommendations": ["Enhance project description with specific technologies used", "Add quantified results and achievements", "Include project duration and team size", "Highlight relevant skills gained"]}],
                        "education": {"existing": [], "rewrite": "", "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]},
                        "certifications": {"existing": [], "rewrite": "", "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]}
                    },
                    "topRecommendations": ["Review and enhance your resume sections", "Add relevant skills and experience", "Quantify achievements with specific results"]
                }
                logger.warning("⚠️ Using emergency minimal response after JSON parsing failure")
                return emergency_response
        except Exception as e:
            logger.error(f"🚨 Critical error in compare_resume_with_jd: {str(e)}")
            logger.error(f"🚨 Error type: {type(e).__name__}")
            logger.error(f"🚨 Resume data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'Not a dict'}")
            logger.error(f"🚨 Job description length: {len(job_description) if job_description else 'None'}")
            
            # Create a comprehensive fallback response for any critical error
            logger.info("🔄 Creating emergency fallback response due to critical error...")
            try:
                fallback_response = self._create_comprehensive_fallback_response(resume_data, job_description, target_experience or "Mid level")
                logger.info("✅ Emergency fallback response created successfully")
                return fallback_response
            except Exception as fallback_error:
                logger.error(f"🚨 Even fallback response creation failed: {str(fallback_error)}")
                # Return a minimal emergency response
                emergency_response = {
                    "overallScore": 50,
                    "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "sectionSuggestions": {
                        "professionalSummary": {"existing": "", "rewrite": "", "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]},
                        "skills": {"existing": [], "rewrite": [], "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]},
                        "workExperience": [{"role": "", "existing": "", "rewrite": "", "recommendations": ["Quantify achievements with specific numbers and percentages", "Use strong action verbs to start each bullet point", "Highlight leadership and team collaboration examples", "Include relevant technologies and tools used"]}],
                        "projects": [{"name": "", "existing": "", "rewrite": "", "recommendations": ["Enhance project description with specific technologies used", "Add quantified results and achievements", "Include project duration and team size", "Highlight relevant skills gained"]}],
                        "education": {"existing": [], "rewrite": "", "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]},
                        "certifications": {"existing": [], "rewrite": "", "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]}
                    },
                    "topRecommendations": ["Review and enhance your resume sections", "Add relevant skills and experience", "Quantify achievements with specific results"]
                }
                logger.warning("⚠️ Using emergency minimal response")
                return emergency_response

    
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
                    
                    # Ensure job is a dictionary, skip if not
                    if not isinstance(job, dict):
                        logger.warning(f"Job {i+1} is not a dictionary (type: {type(job)}), skipping: {job}")
                        continue
                    
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
                            # Ensure job is a dictionary, skip if not
                            if not isinstance(job, dict):
                                logger.warning(f"Alternative experience job {i+1} is not a dictionary (type: {type(job)}), skipping: {job}")
                                continue
                            
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
                # Ensure edu is a dictionary, skip if not
                if not isinstance(edu, dict):
                    logger.warning(f"Education item is not a dictionary (type: {type(edu)}), skipping: {edu}")
                    continue
                    
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
                # Ensure project is a dictionary, skip if not
                if not isinstance(project, dict):
                    logger.warning(f"Project item is not a dictionary (type: {type(project)}), skipping: {project}")
                    continue
                    
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
        """Analyze resume level from resume data"""
        try:
            import traceback
            # Add call counter to track multiple calls
            if not hasattr(self, '_experience_analysis_call_count'):
                self._experience_analysis_call_count = 0
            self._experience_analysis_call_count += 1
            
            logger.info(f"🔍 Analyzing experience level from resume data (Call #{self._experience_analysis_call_count})")
            logger.info("📋 Analysis Strategy: Summary-first, then date-based fallback")
            logger.info(f"📋 Called from: {traceback.extract_stack()[-2].name if len(traceback.extract_stack()) > 1 else 'Unknown'}")
            logger.info(f"📋 resume_data type: {type(resume_data)}")
            logger.info(f"📋 resume_data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'N/A'}")
            
            # Validate input data type
            if not isinstance(resume_data, dict):
                logger.error(f"❌ Invalid resume_data type: {type(resume_data)}. Expected dict, got {type(resume_data)}")
                logger.error(f"❌ resume_data content: {resume_data}")
                # Try to handle string input (might be JSON string)
                if isinstance(resume_data, str):
                    try:
                        import json
                        resume_data = json.loads(resume_data)
                        logger.info("✅ Successfully parsed string resume_data as JSON")
                    except json.JSONDecodeError:
                        logger.error("❌ Failed to parse string resume_data as JSON")
                        return "Mid level"  # Default fallback
                else:
                    logger.error("❌ Cannot handle non-dict, non-string resume_data")
                    return "Mid level"  # Default fallback
            
            # First, check summary for explicit experience statements
            summary_text = resume_data.get('summary', '')
            if summary_text:
                logger.info(f"📝 Summary text available: {summary_text[:100]}{'...' if len(summary_text) > 100 else ''}")
            else:
                logger.info("📝 No summary text available")
            
            summary_experience = self._extract_experience_from_summary(resume_data)
            if summary_experience:
                logger.info(f"✅ Found explicit experience in summary: {summary_experience} years")
                logger.info(f"🎯 Using summary-based experience analysis instead of date-based analysis")
                return self._map_experience_to_level(summary_experience)
            
            logger.info("📝 No explicit experience found in summary, falling back to date-based analysis")
            
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
                # Instead of defaulting to Entry level, analyze other indicators
                return self._analyze_experience_from_other_indicators(resume_data)

            if not isinstance(experience, list) or not experience:
                logger.warning(f"❌ Experience data is not a valid list: {type(experience)}")
                # Instead of defaulting to Entry level, analyze other indicators
                return self._analyze_experience_from_other_indicators(resume_data)

            total_years = 0
            current_year = datetime.datetime.now().year

            logger.info(f"📊 Processing {len(experience)} experience entries")

            # Check if this is primarily an internship/student resume
            is_internship_student = self._is_internship_student_resume(experience, resume_data)
            if is_internship_student:
                logger.info("🎓 Detected internship/student resume - using appropriate experience level")
                return "Entry level"
            
            for i, exp in enumerate(experience):
                logger.info(f"   Job {i+1}: {exp}")
                
                # Ensure exp is a dict before calling .get()
                if not isinstance(exp, dict):
                    logger.warning(f"⚠️ Job {i+1} is not a dict: {type(exp)} - {exp}")
                    continue
                
                start_date = exp.get('startDate', exp.get('start', exp.get('from', '')))
                end_date = exp.get('endDate', exp.get('end', exp.get('to', exp.get('current', ''))))

                start_year, end_year = None, current_year
                if start_date:
                    year_match = re.search(r'(\d{4})', str(start_date))
                    if year_match:
                        start_year = int(year_match.group(1))
                        logger.info(f"     Start year: {start_year}")
                        
                        # Handle future dates (internships, planned positions)
                        if start_year > current_year:
                            logger.info(f"     Future start date detected - likely internship/planned position")
                            # Don't add negative years, but mark as internship
                            continue
                if end_date and str(end_date).lower() not in ['present', 'current', '']:
                    year_match = re.search(r'(\d{4})', str(end_date))
                    if year_match:
                        end_year = int(year_match.group(1))
                        logger.info(f"     End year: {end_year}")

                if start_year and start_year <= current_year:
                    years_in_role = max(0, end_year - start_year)
                    years_in_role = min(years_in_role, 10)  # cap outliers
                    total_years += years_in_role
                    logger.info(f"     Years in role: {years_in_role}")

            logger.info(f"📊 Total calculated experience: {total_years} years")

            # Use the same mapping function for consistency
            level = self._map_experience_to_level(total_years)
            logger.info(f"🎯 Determined experience level: {level}")
            logger.info(f"📊 Experience Analysis Summary:")
            logger.info(f"   - Summary-based analysis: {'Yes' if summary_experience else 'No'}")
            logger.info(f"   - Date-based analysis: {'Yes' if not summary_experience else 'No'}")
            logger.info(f"   - Total years calculated: {total_years if not summary_experience else summary_experience}")
            logger.info(f"   - Final level: {level}")
            logger.info(f"📊 Call #{self._experience_analysis_call_count} completed successfully with level: {level}")
            return level

        except Exception as e:
            logger.warning(f"❌ Error analyzing experience level: {str(e)}")
            logger.warning(f"❌ resume_data type: {type(resume_data)}")
            logger.warning(f"❌ resume_data content: {str(resume_data)[:200]}")
            logger.warning(f"❌ Call #{self._experience_analysis_call_count} failed, falling back to indicators method")
            return self._analyze_experience_from_other_indicators(resume_data)
    
    def _is_internship_student_resume(self, experience: list, resume_data: Dict[str, Any]) -> bool:
        """
        Detect if this is primarily an internship/student resume based on various indicators.
        """
        try:
            logger.info("🔍 Checking if resume is internship/student focused")
            
            # Check for internship-related keywords in job titles
            internship_keywords = ['intern', 'internship', 'student', 'trainee', 'apprentice', 'junior']
            has_internship_role = False
            
            for exp in experience:
                if isinstance(exp, dict):
                    role = exp.get('role', exp.get('title', exp.get('jobTitle', '')).lower())
                    if any(keyword in role for keyword in internship_keywords):
                        has_internship_role = True
                        logger.info(f"🎓 Found internship role: {role}")
                        break
            
            # Check for education level and recent graduation
            education = resume_data.get('education', [])
            if isinstance(education, list) and education:
                for edu in education:
                    if isinstance(edu, dict):
                        degree = edu.get('degree', '').lower()
                        if any(level in degree for level in ['bachelor', 'bs', 'ba', 'btech', 'master', 'ms', 'ma']):
                            # Check if graduation is recent or in the future
                            end_date = edu.get('endDate', edu.get('to', ''))
                            if end_date:
                                year_match = re.search(r'(\d{4})', str(end_date))
                                if year_match:
                                    grad_year = int(year_match.group(1))
                                    current_year = datetime.datetime.now().year
                                    if grad_year >= current_year - 2:  # Recent graduate
                                        logger.info(f"🎓 Recent graduate detected: {grad_year}")
                                        return True
            
            # Check for future start dates (planned internships)
            current_year = datetime.datetime.now().year
            has_future_dates = False
            
            for exp in experience:
                if isinstance(exp, dict):
                    start_date = exp.get('startDate', exp.get('start', exp.get('from', '')))
                    if start_date:
                        year_match = re.search(r'(\d{4})', str(start_date))
                        if year_match:
                            start_year = int(year_match.group(1))
                            if start_year > current_year:
                                has_future_dates = True
                                logger.info(f"🎓 Future start date detected: {start_year}")
                                break
            
            # Check summary for student/internship indicators
            summary = resume_data.get('summary', '').lower()
            student_indicators = ['student', 'intern', 'internship', 'learning', 'studying', 'graduate', 'fresh']
            has_student_summary = any(indicator in summary for indicator in student_indicators)
            
            if has_student_summary:
                logger.info("🎓 Student indicators found in summary")
            
            # Determine if this is an internship/student resume
            is_internship_student = (has_internship_role or has_future_dates or has_student_summary)
            
            logger.info(f"🎓 Internship/Student resume detection: {is_internship_student}")
            logger.info(f"   - Has internship role: {has_internship_role}")
            logger.info(f"   - Has future dates: {has_future_dates}")
            logger.info(f"   - Has student summary: {has_student_summary}")
            
            return is_internship_student
            
        except Exception as e:
            logger.warning(f"❌ Error detecting internship/student resume: {str(e)}")
            return False
    
    def _analyze_experience_from_other_indicators(self, resume_data: Dict[str, Any]) -> str:
        """
        Analyze experience level from other resume indicators when direct experience data is not available.
        This provides a more intelligent fallback than just defaulting to Entry level.
        """
        try:
            logger.info("🔍 Analyzing experience level from other resume indicators")
            logger.info(f"🔍 resume_data type: {type(resume_data)}")
            logger.info(f"🔍 resume_data content: {str(resume_data)[:200]}")
            
            # Check for education level and completion date
            education_level = "bachelor"  # default
            education_completion_year = None
            
            if 'education' in resume_data and isinstance(resume_data['education'], list) and resume_data['education']:
                for edu in resume_data['education']:
                    if isinstance(edu, dict):
                        degree = edu.get('degree', '').lower()
                        if any(level in degree for level in ['phd', 'doctorate', 'doctoral']):
                            education_level = "phd"
                        elif any(level in degree for level in ['master', 'ms', 'ma', 'mba']):
                            education_level = "master"
                        elif any(level in degree for level in ['bachelor', 'bs', 'ba', 'btech']):
                            education_level = "bachelor"
                        
                        # Check completion date
                        end_date = edu.get('endDate', edu.get('to', ''))
                        if end_date:
                            import re
                            year_match = re.search(r'(\d{4})', str(end_date))
                            if year_match:
                                education_completion_year = int(year_match.group(1))
                                break
            
            # Check for certifications and professional achievements
            has_certifications = False
            has_projects = False
            
            if 'certifications' in resume_data and isinstance(resume_data['certifications'], list) and resume_data['certifications']:
                has_certifications = True
            
            if 'projects' in resume_data and isinstance(resume_data['projects'], list) and resume_data['projects']:
                has_projects = True
            
            # Check for skills complexity
            has_advanced_skills = False
            if 'skills' in resume_data:
                skills_data = resume_data['skills']
                if isinstance(skills_data, dict):
                    # Check for advanced technical skills
                    technical_skills = skills_data.get('technical', [])
                    programming_skills = skills_data.get('programming', [])
                    
                    advanced_indicators = [
                        'architecture', 'design patterns', 'microservices', 'distributed systems',
                        'machine learning', 'ai', 'artificial intelligence', 'data science',
                        'cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'devops',
                        'leadership', 'mentoring', 'team management', 'project management'
                    ]
                    
                    all_skills = []
                    if isinstance(technical_skills, list):
                        all_skills.extend([str(skill).lower() for skill in technical_skills if skill])
                    if isinstance(programming_skills, list):
                        all_skills.extend([str(skill).lower() for skill in programming_skills if skill])
                    
                    has_advanced_skills = any(indicator in skill for skill in all_skills for indicator in advanced_indicators)
            
            # Calculate years since education completion
            current_year = datetime.datetime.now().year
            years_since_education = 0
            if education_completion_year:
                years_since_education = current_year - education_completion_year
            
            # Determine experience level based on multiple factors
            experience_score = 0
            
            # Education level contribution
            if education_level == "phd":
                experience_score += 3
            elif education_level == "master":
                experience_score += 2
            elif education_level == "bachelor":
                experience_score += 1
            
            # Years since education contribution
            if years_since_education >= 5:
                experience_score += 3
            elif years_since_education >= 3:
                experience_score += 2
            elif years_since_education >= 1:
                experience_score += 1
            
            # Professional achievements contribution
            if has_certifications:
                experience_score += 1
            if has_projects:
                experience_score += 1
            if has_advanced_skills:
                experience_score += 2
            
            logger.info(f"📊 Experience analysis results:")
            logger.info(f"   Education level: {education_level}")
            logger.info(f"   Years since education: {years_since_education}")
            logger.info(f"   Has certifications: {has_certifications}")
            logger.info(f"   Has projects: {has_projects}")
            logger.info(f"   Has advanced skills: {has_advanced_skills}")
            logger.info(f"   Total experience score: {experience_score}")
            
            # Determine level based on score
            if experience_score <= 2:
                level = "Entry level"
            elif experience_score <= 4:
                level = "Mid level"
            else:
                level = "Senior level"
            
            logger.info(f"🎯 Determined experience level from indicators: {level}")
            logger.info(f"🔍 This fallback analysis was triggered because:")
            logger.info(f"   - Direct experience analysis failed or was incomplete")
            logger.info(f"   - resume_data type: {type(resume_data)}")
            logger.info(f"   - resume_data keys: {list(resume_data.keys()) if isinstance(resume_data, dict) else 'N/A'}")
            logger.info(f"📊 Fallback analysis completed with level: {level}")
            return level
            
        except Exception as e:
            logger.warning(f"❌ Error analyzing experience from indicators: {str(e)}")
            # As a last resort, return Mid level instead of Entry level
            return "Mid level"
    
    def _get_intelligent_default_experience(self, sector: str, designation: str) -> str:
        """
        Determine intelligent default experience level based on sector and designation context.
        This provides better defaults than always using "Mid level".
        """
        try:
            logger.info(f"🔍 Determining intelligent default experience for sector: {sector}, designation: {designation}")
            
            # Convert to lowercase for easier matching
            sector_lower = sector.lower()
            designation_lower = designation.lower()
            
            # Entry level indicators (typically junior positions)
            entry_level_indicators = [
                'junior', 'jr', 'entry', 'associate', 'assistant', 'trainee', 'intern',
                'graduate', 'fresher', 'new grad', 'recent graduate', 'student'
            ]
            
            # Senior level indicators (typically leadership/experienced positions)
            senior_level_indicators = [
                'senior', 'sr', 'lead', 'principal', 'architect', 'manager', 'director',
                'head', 'chief', 'vp', 'vice president', 'executive', 'expert', 'specialist'
            ]
            
            # Check designation for level indicators
            if any(indicator in designation_lower for indicator in entry_level_indicators):
                logger.info(f"🎯 Designation suggests Entry level: {designation}")
                return "Entry level"
            elif any(indicator in designation_lower for indicator in senior_level_indicators):
                logger.info(f"🎯 Designation suggests Senior level: {designation}")
                return "Senior level"
            
            # Check sector-specific patterns
            if any(tech_sector in sector_lower for tech_sector in ['technology', 'tech', 'software', 'it', 'information']):
                # Tech sector often requires more experience
                if 'junior' in designation_lower or 'entry' in designation_lower:
                    return "Entry level"
                elif 'senior' in designation_lower or 'lead' in designation_lower:
                    return "Senior level"
                else:
                    # Default to Mid level for tech sector
                    return "Mid level"
            
            elif any(creative_sector in sector_lower for creative_sector in ['design', 'creative', 'art', 'media', 'marketing']):
                # Creative sectors often have entry-level opportunities
                if 'senior' in designation_lower or 'lead' in designation_lower:
                    return "Senior level"
                else:
                    return "Mid level"
            
            elif any(management_sector in sector_lower for management_sector in ['management', 'consulting', 'strategy', 'business']):
                # Management/consulting often requires experience
                if 'junior' in designation_lower or 'associate' in designation_lower:
                    return "Mid level"
                else:
                    return "Senior level"
            
            # Default to Mid level for most other cases
            logger.info(f"🎯 Using default Mid level for sector: {sector}, designation: {designation}")
            return "Mid level"
            
        except Exception as e:
            logger.warning(f"❌ Error determining intelligent default experience: {str(e)}")
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
        
        # Try to find the complete JSON response by looking for the root structure
        # Look for responses that start with { and contain sectionSuggestions
        if 'sectionSuggestions' in response_text:
            logger.info("🔍 Found 'sectionSuggestions' in response, looking for complete JSON structure")
            
            # Find the opening brace before sectionSuggestions
            section_start = response_text.find('sectionSuggestions')
            if section_start > 0:
                # Look backwards for the opening brace
                brace_start = response_text.rfind('{', 0, section_start)
                if brace_start > 0:
                    # Extract from opening brace to the end
                    potential_complete = response_text[brace_start:]
                    logger.info(f"🔍 Found potential complete JSON starting at brace {brace_start}: {len(potential_complete)} characters")
                    
                    # Try to find the matching closing brace
                    brace_count = 0
                    end_pos = -1
                    for i, char in enumerate(potential_complete):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                    
                    if end_pos > 0:
                        complete_json = potential_complete[:end_pos]
                        logger.info(f"🔍 Extracted complete JSON with balanced braces: {len(complete_json)} characters")
                        
                        # Validate the extracted JSON
                        try:
                            parsed = json.loads(complete_json)
                            logger.info(f"✅ Successfully extracted complete JSON: {len(complete_json)} characters")
                            
                            # Validate the structure
                            if self._validate_json_structure(complete_json):
                                logger.info("✅ JSON structure validation passed")
                                return complete_json
                            else:
                                logger.warning("⚠️ JSON structure validation failed, trying to fix...")
                                try:
                                    fixed_json = self._fix_common_json_issues(complete_json)
                                    if self._validate_json_structure(fixed_json):
                                        logger.info("✅ Fixed JSON structure validation passed")
                                        return fixed_json
                                    else:
                                        logger.warning("⚠️ Fixed JSON still fails structure validation")
                                except Exception as fix_error:
                                    logger.warning(f"⚠️ Error fixing JSON: {str(fix_error)}")
                        except json.JSONDecodeError:
                            logger.warning("❌ Complete JSON extraction failed, trying to fix...")
                            try:
                                fixed_json = self._fix_common_json_issues(complete_json)
                                parsed = json.loads(fixed_json)
                                if self._validate_json_structure(fixed_json):
                                    logger.info("✅ Successfully fixed complete JSON with valid structure: {len(fixed_json)} characters")
                                    return fixed_json
                                else:
                                    logger.warning("⚠️ Fixed JSON has invalid structure")
                            except json.JSONDecodeError:
                                logger.warning("❌ Fixed complete JSON still invalid")
            
            # Method 2: Look for the overallScore and extract from there
            if 'overallScore' in response_text:
                logger.info("🔍 Found 'overallScore', looking for complete JSON structure from there")
                
                score_start = response_text.find('overallScore')
                if score_start > 0:
                    # Look backwards for the opening brace
                    brace_start = response_text.rfind('{', 0, score_start)
                    if brace_start > 0:
                        # Extract from opening brace to end
                        potential_from_score = response_text[brace_start:]
                        logger.info(f"🔍 Found potential JSON starting from overallScore: {len(potential_from_score)} characters")
                        
                        # Try to find the matching closing brace
                        brace_count = 0
                        end_pos = -1
                        for i, char in enumerate(potential_from_score):
                            if char == '{':
                                brace_count += 1
                            elif char == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_pos = i + 1
                                    break
                        
                        if end_pos > 0:
                            complete_from_score = potential_from_score[:end_pos]
                            logger.info(f"🔍 Extracted complete JSON from overallScore: {len(complete_from_score)} characters")
                            
                            # Validate the extracted JSON
                            try:
                                parsed = json.loads(complete_from_score)
                                logger.info(f"✅ Successfully extracted complete JSON from overallScore: {len(complete_from_score)} characters")
                                
                                # Validate the structure
                                if self._validate_json_structure(complete_from_score):
                                    logger.info("✅ JSON structure validation passed for overallScore extraction")
                                    return complete_from_score
                                else:
                                    logger.warning("⚠️ JSON structure validation failed for overallScore extraction")
                            except json.JSONDecodeError:
                                logger.warning("❌ overallScore JSON extraction failed")
            
            # Method 3: Try to reconstruct the complete structure from fragments
            logger.info("🔍 Attempting to reconstruct complete JSON structure from fragments")
            
            # Look for the main sections and try to reconstruct
            main_sections = ['professionalSummary', 'skills', 'workExperience', 'projects', 'education', 'certifications']
            found_sections = {}
            
            for section in main_sections:
                if section in response_text:
                    # Find the section content
                    section_start = response_text.find(section)
                    if section_start > 0:
                        # Look for the content after the section name
                        content_start = response_text.find('{', section_start)
                        if content_start > 0:
                            # Try to extract the section content
                            brace_count = 0
                            end_pos = -1
                            for i, char in enumerate(response_text[content_start:], content_start):
                                if char == '{':
                                    brace_count += 1
                                elif char == '}':
                                    brace_count -= 1
                                    if brace_count == 0:
                                        end_pos = i + 1
                                        break
                            
                            if end_pos > 0:
                                section_content = response_text[content_start:end_pos]
                                found_sections[section] = section_content
                                logger.info(f"🔍 Extracted {section} section: {len(section_content)} characters")
            
            if found_sections:
                # Try to reconstruct a complete response
                reconstructed = {
                    "overallScore": 0,  # Will be calculated dynamically
                    "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "sectionSuggestions": {},
                    "topRecommendations": ["Resume analysis completed with reconstructed data"]
                }
                
                # Add extracted sections
                for section_name, section_content in found_sections.items():
                    try:
                        # Try to parse the section content
                        section_data = json.loads(section_content)
                        reconstructed["sectionSuggestions"][section_name] = section_data
                    except:
                        # If parsing fails, create a basic structure
                        reconstructed["sectionSuggestions"][section_name] = {
                            "existing": "",
                            "rewrite": "",
                            "recommendations": [""]
                        }
                
                # Add missing sections with defaults
                for section in main_sections:
                    if section not in reconstructed["sectionSuggestions"]:
                        reconstructed["sectionSuggestions"][section] = {
                            "existing": "",
                            "rewrite": "",
                            "recommendations": [""]
                        }
                
                logger.info("✅ Fragment reconstruction completed")
                return json.dumps(reconstructed)
        
        # Try to find any JSON object in the text - use more specific pattern
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
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
                # Try to fix common issues
                try:
                    fixed_json = self._fix_common_json_issues(json_content)
                    parsed = json.loads(fixed_json)
                    logger.info(f"✅ Successfully fixed and parsed JSON: {len(fixed_json)} characters")
                    return fixed_json
                except json.JSONDecodeError:
                    logger.warning("❌ Fixed JSON is still invalid")
        
        # Try to find JSON with more flexible pattern
        json_pattern = r'(\{.*\})'
        match = re.search(json_pattern, response_text, re.DOTALL)
        if match:
            json_content = match.group(1).strip()
            # Validate the extracted JSON
            try:
                parsed = json.loads(json_content)
                logger.info(f"✅ Successfully extracted JSON with flexible pattern: {len(json_content)} characters")
                return json_content
            except json.JSONDecodeError:
                logger.warning("❌ Flexible JSON extraction failed")
        
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
        
        # Fix common Gemini response issues
        # Remove any text before the first {
        first_brace = json_text.find('{')
        if first_brace > 0:
            json_text = json_text[first_brace:]
            logger.info(f"🧹 Removed {first_brace} characters before first brace")
        
        # Remove any text after the last }
        last_brace = json_text.rfind('}')
        if last_brace > 0 and last_brace < len(json_text) - 1:
            json_text = json_text[:last_brace + 1]
            logger.info(f"🧹 Removed {len(json_text) - last_brace - 1} characters after last brace")
        
        # Fix common Gemini formatting issues
        json_text = re.sub(r'```json\s*', '', json_text)
        json_text = re.sub(r'```\s*', '', json_text)
        
        # Fix any remaining markdown artifacts
        json_text = re.sub(r'^[^{]*', '', json_text)
        json_text = re.sub(r'[^}]*$', '', json_text)
        
        # Ensure the structure is preserved - look for missing wrapper
        if 'sectionSuggestions' in json_text and not json_text.strip().startswith('{"overallScore"'):
            logger.info("🧹 Detected missing overallScore wrapper, attempting to preserve structure")
            
            # Check if we need to add the wrapper
            if not json_text.strip().startswith('{'):
                logger.warning("🧹 JSON doesn't start with {, this might cause issues")
        
        return json_text
    
    def _extract_and_fix_json(self, text: str) -> str:
        """Extract JSON from text and attempt to fix it"""
        import re
        
        logger.info(f"🔍 Attempting to extract and fix JSON from text of length {len(text)}")
        
        # Find the largest potential JSON object
        json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        if matches:
            # Sort by length to get the largest match
            largest_match = max(matches, key=len)
            logger.info(f"🔍 Found potential JSON object of length {len(largest_match)}")
            
            # Try to fix common issues
            fixed = self._fix_common_json_issues(largest_match)
            
            # Validate
            try:
                json.loads(fixed)
                logger.info(f"✅ Successfully extracted and fixed JSON: {len(fixed)} characters")
                return fixed
            except json.JSONDecodeError as e:
                logger.warning(f"❌ Fixed JSON still invalid: {str(e)}")
        
        # Try alternative extraction methods
        logger.info("🔍 Trying alternative JSON extraction methods")
        
        # Method 1: Find anything between { and }
        simple_pattern = r'(\{.*\})'
        simple_matches = re.findall(simple_pattern, text, re.DOTALL)
        if simple_matches:
            largest_simple = max(simple_matches, key=len)
            logger.info(f"🔍 Found simple JSON pattern of length {len(largest_simple)}")
            
            # Try to fix it
            fixed_simple = self._fix_common_json_issues(largest_simple)
            try:
                json.loads(fixed_simple)
                logger.info(f"✅ Successfully extracted and fixed simple JSON: {len(fixed_simple)} characters")
                return fixed_simple
            except json.JSONDecodeError:
                logger.warning("❌ Simple JSON extraction also failed")
        
        # Method 2: Look for specific sections that might be valid
        logger.info("🔍 Looking for specific valid JSON sections")
        
        # Try to find sectionSuggestions
        if 'sectionSuggestions' in text:
            start_idx = text.find('sectionSuggestions')
            if start_idx > 0:
                # Find the opening brace before sectionSuggestions
                brace_idx = text.rfind('{', 0, start_idx)
                if brace_idx > 0:
                    # Extract from opening brace to end
                    potential_json = text[brace_idx:]
                    logger.info(f"🔍 Found potential JSON starting with sectionSuggestions: {len(potential_json)} characters")
                    
                    # Try to fix and validate
                    fixed_section = self._fix_common_json_issues(potential_json)
                    try:
                        json.loads(fixed_section)
                        logger.info(f"✅ Successfully extracted sectionSuggestions JSON: {len(fixed_section)} characters")
                        return fixed_section
                    except json.JSONDecodeError:
                        logger.warning("❌ sectionSuggestions JSON extraction failed")
        
        # If we can't extract valid JSON, return a minimal valid structure
        logger.warning("Could not extract valid JSON from AI response, returning fallback structure")
        return '{"error": "Invalid JSON response", "message": "Could not parse AI response"}'

    def _enforce_schema_compliance(self, ai_response: Dict[str, Any], resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
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
                "professionalSummary": {"existing": "", "rewrite": "", "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]},
                "skills": {"existing": [], "rewrite": [], "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]},
                "workExperience": [],
                "projects": [],
                "education": {"existing": [], "rewrite": "", "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]},
                "certifications": {"existing": [], "rewrite": "", "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]}
            },
            "overallScore": 0,  # Will be calculated dynamically
            "analysisTimestamp": "",
            "topRecommendations": ["Review and enhance your professional summary", "Add relevant skills from the job description", "Quantify achievements in work experience", "Include relevant projects and certifications"]
        }
        
        # Ensure top-level structure exists
        try:
            for key, default_value in required_sections.items():
                if key not in ai_response:
                    ai_response[key] = default_value
                    logger.warning(f"🔒 Enforced missing top-level section: {key}")
        except Exception as e:
            logger.error(f"🚨 Error enforcing top-level structure: {str(e)}")
            logger.error(f"🚨 required_sections type: {type(required_sections)}")
            logger.error(f"🚨 ai_response type: {type(ai_response)}")
            raise
        
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
        score_str = str(ai_response.get("overallScore", "")).strip().upper()
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        if score_str in na_variations:
            logger.error(f"🚨 AGGRESSIVE OVERRIDE: Score still contains 'NA': '{ai_response.get('overallScore')}', forcing to 0")
            ai_response["overallScore"] = 0
        
        logger.info(f"🔍 Final validated score: {ai_response['overallScore']} (type: {type(ai_response['overallScore'])})")
        
        # If score is still 0 (default), calculate a reasonable score based on resume completeness and job description match
        if ai_response['overallScore'] == 0:
            calculated_score = self._calculate_dynamic_score_with_jd(resume_data, job_description)
            ai_response['overallScore'] = calculated_score
            logger.info(f"🔄 Calculated dynamic fallback score based on resume-JD match: {calculated_score}")
        
        # FINAL CHECK: Ensure the score is absolutely never "NA"
        final_score_str = str(ai_response['overallScore']).strip().upper()
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        if final_score_str in na_variations:
            logger.error(f"🚨 FINAL OVERRIDE: Score still 'NA' at the very end: '{ai_response['overallScore']}', forcing to 50")
            ai_response['overallScore'] = 50
        
        # ULTIMATE NA CLEANUP: Clean any remaining "NA" values in all sections
        ai_response = self._clean_all_na_values(ai_response)
        
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
            "professionalSummary": {"existing": "", "rewrite": "", "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]},
            "skills": {"existing": [], "rewrite": [], "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]},
            "projects": [],
            "education": {"existing": [], "rewrite": "", "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]},
            "certifications": {"existing": [], "rewrite": "", "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]}
        }
        
        try:
            for section_name, default_structure in section_defaults.items():
                if section_name not in section_suggestions:
                    section_suggestions[section_name] = default_structure
                    logger.warning(f"🔒 Enforced missing section: {section_name}")
                elif isinstance(section_suggestions[section_name], dict):
                    # Ensure all required keys exist - but only if default_structure is also a dict
                    if isinstance(default_structure, dict):
                        try:
                            for key, default_value in default_structure.items():
                                if key not in section_suggestions[section_name]:
                                    section_suggestions[section_name][key] = default_value
                                    logger.warning(f"🔒 Enforced missing key in {section_name}: {key}")
                        except Exception as e:
                            logger.error(f"🚨 Error enforcing keys in section {section_name}: {str(e)}")
                            logger.error(f"🚨 default_structure type: {type(default_structure)}")
                            raise
                    else:
                        logger.warning(f"🔒 Section {section_name} is dict but default_structure is {type(default_structure)}, skipping key enforcement")
                elif isinstance(section_suggestions[section_name], list):
                    # Handle list sections (like projects)
                    if isinstance(default_structure, list) and not section_suggestions[section_name]:
                        # For empty lists, provide at least one item
                        if section_name == "projects":
                            section_suggestions[section_name] = self._create_projects_fallback(resume_data)
                        elif section_name == "workExperience":
                            section_suggestions[section_name] = self._create_experience_fallback(resume_data)
                    elif isinstance(default_structure, dict):
                        # If default_structure is a dict but section is a list, convert to proper format
                        logger.warning(f"🔒 Section {section_name} is list but default_structure is dict, converting to list format")
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
        except Exception as e:
            logger.error(f"🚨 Error enforcing section compliance: {str(e)}")
            logger.error(f"🚨 section_defaults type: {type(section_defaults)}")
            logger.error(f"🚨 section_suggestions type: {type(section_suggestions)}")
            raise
        
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
                # Ensure job is a dictionary, skip if not
                if not isinstance(job, dict):
                    logger.warning(f"Experience job item is not a dictionary (type: {type(job)}), skipping: {job}")
                    continue
                    
                fallback_item = {
                    "role": job.get('role', job.get('title', job.get('jobTitle', 'N/A'))),
                    "existing": self._extract_job_description(job),
                    "rewrite": "",  # AI will fill this
                    "recommendations": ["Quantify achievements with specific numbers and percentages", "Use strong action verbs to start each bullet point", "Highlight leadership and team collaboration examples", "Include relevant technologies and tools used"]
                }
                fallback_experience.append(fallback_item)
        else:
            logger.warning("🔒 No original experience data found, creating empty fallback")
            fallback_experience = [{"role": "", "existing": "", "rewrite": "", "recommendations": ["Add relevant work experience with specific achievements", "Include internships, volunteer work, or freelance projects", "Highlight transferable skills from other experiences", "Quantify impact and results wherever possible"]}]
        
        return fallback_experience
    
    def _create_projects_fallback(self, resume_data: Dict[str, Any]) -> list:
        """
        Creates a fallback projects section from the original resume data.
        If no projects exist, creates 2 dummy projects that match the job description.
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
                # Ensure project is a dictionary, skip if not
                if not isinstance(project, dict):
                    logger.warning(f"Project item is not a dictionary (type: {type(project)}), skipping: {project}")
                    continue
                    
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
                    "recommendations": ["Enhance project description with specific technologies used", "Add quantified results and achievements", "Include project duration and team size", "Highlight relevant skills gained"]
                }
                fallback_projects.append(fallback_item)
        else:
            logger.warning("🔒 No original projects data found, creating 2 dummy projects")
            # Create 2 dummy projects that will be enhanced by AI based on job description
            fallback_projects = [
                {
                    "name": "Project 1",
                    "existing": "",
                    "rewrite": "",  # AI will create relevant project description
                    "recommendations": ["Create a project that demonstrates relevant technical skills", "Include specific technologies and frameworks used", "Add quantified results and impact metrics", "Highlight problem-solving and innovation"]
                },
                {
                    "name": "Project 2", 
                    "existing": "",
                    "rewrite": "",  # AI will create relevant project description
                    "recommendations": ["Develop a project showcasing leadership and collaboration", "Include project timeline and deliverables", "Add client feedback or performance metrics", "Demonstrate continuous learning and adaptation"]
                }
            ]
        
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
                # Ensure edu is a dictionary, skip if not
                if not isinstance(edu, dict):
                    logger.warning(f"Education item is not a dictionary (type: {type(edu)}), skipping: {edu}")
                    continue
                    
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
            "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]
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
            "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add completion dates and credential IDs", "Highlight ongoing learning and skill development"]
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

    def _create_comprehensive_fallback_response(self, resume_data: Dict[str, Any], job_description: str, target_experience: str) -> Dict[str, Any]:
        """
        Creates a comprehensive fallback response when Gemini API fails or is blocked.
        This ensures the AI suggestions always work, even when the AI response is unavailable.
        """
        logger.info("🔄 Creating comprehensive fallback response...")
        
        # Calculate a basic score based on resume completeness and job description match
        basic_score = self._calculate_basic_fallback_score(resume_data, job_description)
        
        # Create work experience fallback
        work_experience_fallback = self._create_experience_fallback(resume_data)
        
        # Create projects fallback
        projects_fallback = self._create_projects_fallback(resume_data)
        
        # Create education fallback
        education_fallback = self._create_education_fallback(resume_data)
        
        # Create certifications fallback
        certifications_fallback = self._create_certifications_fallback(resume_data)
        
        # Create skills fallback
        skills_fallback = self._create_skills_fallback(resume_data, job_description)
        
        # Create professional summary fallback
        professional_summary_fallback = self._create_professional_summary_fallback(resume_data, job_description, target_experience)
        
        # Create comprehensive fallback response
        fallback_response = {
            "overallScore": basic_score,
            "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "sectionSuggestions": {
                "professionalSummary": professional_summary_fallback,
                "skills": skills_fallback,
                "workExperience": work_experience_fallback,
                "projects": projects_fallback,
                "education": education_fallback,
                "certifications": certifications_fallback
            },
            "topRecommendations": [
                "Review and enhance your professional summary with relevant keywords from the job description",
                "Add technical skills that match the job requirements and industry standards",
                "Quantify achievements in work experience with specific numbers and measurable results",
                "Include relevant projects that demonstrate your capabilities and problem-solving skills",
                "Highlight relevant education, certifications, and continuous learning achievements"
            ]
        }
        
        logger.info(f"✅ Created comprehensive fallback response with score: {basic_score}")
        return fallback_response

    def _calculate_basic_fallback_score(self, resume_data: Dict[str, Any], job_description: str) -> int:
        """
        Calculates a basic score based on resume completeness and job description match.
        """
        score = 0
        
        # Check for basic resume completeness (40 points max)
        if resume_data.get('skills'):
            score += 10
        if resume_data.get('experience') or resume_data.get('workExperience'):
            score += 15
        if resume_data.get('education'):
            score += 10
        if resume_data.get('projects'):
            score += 5
        
        # Check for job description keyword matches (60 points max)
        if job_description:
            job_keywords = job_description.lower().split()
            resume_text = str(resume_data).lower()
            
            # Count keyword matches
            matches = sum(1 for keyword in job_keywords if keyword in resume_text)
            keyword_score = min(60, matches * 2)  # Max 60 points for keyword matches
            score += keyword_score
        
        # Ensure score is between 0-100
        return max(0, min(100, score))

    def _create_skills_fallback(self, resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        """
        Creates a skills fallback with meaningful recommendations.
        """
        existing_skills = resume_data.get('skills', [])
        
        return {
            "existing": existing_skills if isinstance(existing_skills, list) else [str(existing_skills)],
            "rewrite": [],
            "recommendations": [
                "Add technical skills relevant to the job description",
                "Include both hard and soft skills that match the role requirements",
                "Organize skills by category for better readability and ATS compatibility",
                "Highlight skills that directly match the job posting keywords",
                "Include industry-specific tools and technologies mentioned in the job description"
            ]
        }

    def _create_professional_summary_fallback(self, resume_data: Dict[str, Any], job_description: str, target_experience: str) -> Dict[str, Any]:
        """
        Creates a professional summary fallback with meaningful recommendations.
        """
        existing_summary = resume_data.get('professionalSummary', resume_data.get('summary', ''))
        
        return {
            "existing": existing_summary if existing_summary else "No professional summary provided",
            "rewrite": "",
            "recommendations": [
                f"Craft a compelling 2-3 sentence summary highlighting your key achievements as a {target_experience} professional",
                "Include relevant keywords from the job description to improve ATS compatibility",
                "Quantify your impact with specific numbers, percentages, and measurable results",
                "Tailor the summary to emphasize skills and experience that match the target role",
                "Use strong action verbs and industry-specific terminology to demonstrate expertise"
            ]
        }

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
        # Handle string variations of "NA" - more comprehensive check
        if isinstance(score, str):
            score_str = score.strip().upper()
            # Extended list of NA variations
            na_variations = [
                'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
                'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
                'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
                'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
            ]
            if score_str in na_variations:
                logger.warning(f"⚠️ 'NA' score detected: '{score}', defaulting to 0.")
                return 0
        
        # Handle None values
        if score is None:
            logger.warning(f"⚠️ None score detected, defaulting to 0.")
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

    def _clean_all_na_values(self, ai_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively cleans all "NA" values from the AI response and replaces them with appropriate defaults.
        This ensures no "NA" values ever reach the user.
        """
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        
        def clean_value(value):
            if isinstance(value, str):
                value_str = value.strip().upper()
                if value_str in na_variations:
                    logger.warning(f"🧹 Cleaning 'NA' value: '{value}' -> ''")
                    return ""
                return value
            elif isinstance(value, list):
                return [clean_value(item) for item in value if item is not None]
            elif isinstance(value, dict):
                return {k: clean_value(v) for k, v in value.items()}
            elif isinstance(value, (int, float)):
                # Numbers are fine, no need to clean
                return value
            else:
                logger.warning(f"🧹 Unexpected value type in clean_value: {type(value)} - {value}")
                return value
        
        # Clean the entire response recursively
        cleaned_response = clean_value(ai_response)
        logger.info("🧹 Completed comprehensive NA value cleanup")
        return cleaned_response
    
    def _final_na_validation(self, ai_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Final validation to ensure absolutely no "NA" values exist anywhere in the response.
        This is the last line of defense against "NA" values.
        """
        na_variations = [
            'NA', 'N/A', 'N.A.', 'NOT AVAILABLE', 'NOT APPLICABLE', 
            'NOT APPLICABLE', 'NOT AVAILABLE', 'NONE', 'NULL', 'UNDEFINED',
            'UNKNOWN', 'TBD', 'TO BE DETERMINED', 'PENDING', 'INVALID',
            'ERROR', 'FAILED', 'MISSING', 'EMPTY', 'BLANK'
        ]
        
        def validate_and_fix(value, path=""):
            if isinstance(value, str):
                value_str = value.strip().upper()
                if value_str in na_variations:
                    logger.error(f"🚨 FINAL VALIDATION: Found 'NA' value at {path}: '{value}' -> ''")
                    return ""
                return value
            elif isinstance(value, list):
                return [validate_and_fix(item, f"{path}[{i}]") for i, item in enumerate(value) if item is not None]
            elif isinstance(value, dict):
                return {k: validate_and_fix(v, f"{path}.{k}") for k, v in value.items()}
            elif isinstance(value, (int, float)):
                # Numbers are fine, no need to validate
                return value
            else:
                logger.warning(f"🚨 FINAL VALIDATION: Unexpected value type at {path}: {type(value)} - {value}")
                return value
        
        # Perform final validation and fix any remaining "NA" values
        validated_response = validate_and_fix(ai_response, "root")
        logger.info("🔒 Completed final NA validation - response is guaranteed to be NA-free")
        return validated_response

    def _aggressive_json_recovery(self, response_text: str) -> str:
        """
        Aggressively try to recover the complete JSON response when normal extraction fails.
        """
        logger.info("🚨 Starting aggressive JSON recovery...")
        
        # Method 1: Look for the largest JSON object that contains sectionSuggestions
        if 'sectionSuggestions' in response_text:
            logger.info("🔍 Found sectionSuggestions, looking for complete structure...")
            
            # Find all potential JSON objects
            json_pattern = r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})'
            matches = re.findall(json_pattern, response_text, re.DOTALL)
            
            # Filter for objects that contain sectionSuggestions
            valid_matches = [match for match in matches if 'sectionSuggestions' in match]
            
            if valid_matches:
                # Get the largest valid match
                largest_valid = max(valid_matches, key=len)
                logger.info(f"🔍 Found valid JSON with sectionSuggestions: {len(largest_valid)} characters")
                
                # Try to fix and validate
                try:
                    fixed = self._fix_common_json_issues(largest_valid)
                    if self._validate_json_structure(fixed):
                        logger.info("✅ Aggressive recovery successful!")
                        return fixed
                except Exception as e:
                    logger.warning(f"⚠️ Aggressive recovery failed: {str(e)}")
        
        # Method 2: Look for JSON that starts with overallScore
        if 'overallScore' in response_text:
            logger.info("🔍 Found overallScore, looking for complete structure...")
            
            score_pos = response_text.find('overallScore')
            if score_pos > 0:
                # Look backwards for opening brace
                brace_start = response_text.rfind('{', 0, score_pos)
                if brace_start > 0:
                    # Extract from opening brace to end
                    potential = response_text[brace_start:]
                    
                    # Try to find balanced braces
                    brace_count = 0
                    end_pos = -1
                    for i, char in enumerate(potential):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                    
                    if end_pos > 0:
                        complete = potential[:end_pos]
                        logger.info(f"🔍 Extracted complete JSON from overallScore: {len(complete)} characters")
                        
                        try:
                            fixed = self._fix_common_json_issues(complete)
                            if self._validate_json_structure(fixed):
                                logger.info("✅ Aggressive recovery from overallScore successful!")
                                return fixed
                        except Exception as e:
                            logger.warning(f"⚠️ Aggressive recovery from overallScore failed: {str(e)}")
        
        # Method 3: Try to reconstruct from fragments
        logger.info("🔍 Attempting fragment reconstruction...")
        
        # Look for individual sections and try to reconstruct
        sections = {}
        for section in ['professionalSummary', 'skills', 'workExperience', 'projects', 'education', 'certifications']:
            if section in response_text:
                # Find the section content
                section_start = response_text.find(section)
                if section_start > 0:
                    # Look for the content after the section name
                    content_start = response_text.find('{', section_start)
                    if content_start > 0:
                        # Try to extract the section content
                        brace_count = 0
                        end_pos = -1
                        for i, char in enumerate(response_text[content_start:], content_start):
                            if char == '{':
                                brace_count += 1
                            elif char == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_pos = i + 1
                                    break
                        
                        if end_pos > 0:
                            section_content = response_text[content_start:end_pos]
                            sections[section] = section_content
                            logger.info(f"🔍 Extracted {section} section: {len(section_content)} characters")
        
        if sections:
            # Try to reconstruct a complete response
            reconstructed = {
                "overallScore": 0,  # Will be calculated dynamically
                "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "sectionSuggestions": {},
                "topRecommendations": ["Resume analysis completed with partial data"]
            }
            
            # Add extracted sections
            for section_name, section_content in sections.items():
                try:
                    # Try to parse the section content
                    section_data = json.loads(section_content)
                    reconstructed["sectionSuggestions"][section_name] = section_data
                except:
                    # If parsing fails, create a basic structure
                    reconstructed["sectionSuggestions"][section_name] = {
                        "existing": "",
                        "rewrite": "",
                        "recommendations": [""]
                    }
            
            # Add missing sections with defaults
            for section in ['professionalSummary', 'skills', 'workExperience', 'projects', 'education', 'certifications']:
                if section not in reconstructed["sectionSuggestions"]:
                    reconstructed["sectionSuggestions"][section] = {
                        "existing": "",
                        "rewrite": "",
                        "recommendations": [""]
                    }
            
            logger.info("✅ Fragment reconstruction completed")
            return json.dumps(reconstructed)
        
        logger.warning("⚠️ All aggressive recovery methods failed")
        return ""
    
    def _detect_and_fix_incomplete_json(self, json_text: str) -> str:
        """
        Detect and fix incomplete JSON structures that are missing the root wrapper.
        """
        try:
            # Check if the JSON is missing the root wrapper
            if 'sectionSuggestions' in json_text and not json_text.strip().startswith('{"overallScore"'):
                logger.info("🔍 Detected incomplete JSON structure, attempting to fix...")
                
                # Try to parse what we have
                try:
                    parsed = json.loads(json_text)
                    logger.info("✅ Incomplete JSON is still valid, no fixing needed")
                    return json_text
                except json.JSONDecodeError:
                    logger.info("🔍 Incomplete JSON is invalid, attempting to wrap...")
                    
                    # Look for the first valid JSON object
                    first_brace = json_text.find('{')
                    if first_brace >= 0:
                        # Try to find the matching closing brace
                        brace_count = 0
                        end_pos = -1
                        for i, char in enumerate(json_text[first_brace:], first_brace):
                            if char == '{':
                                brace_count += 1
                            elif char == '}':
                                brace_count -= 1
                                if brace_count == 0:
                                    end_pos = i + 1
                                    break
                        
                        if end_pos > 0:
                            # Extract the valid JSON portion
                            valid_portion = json_text[first_brace:end_pos]
                            logger.info(f"🔍 Extracted valid JSON portion: {len(valid_portion)} characters")
                            
                            # Try to parse it
                            try:
                                parsed = json.loads(valid_portion)
                                logger.info("✅ Valid JSON portion extracted and parsed")
                                
                                # Now wrap it in the complete structure
                                wrapped_json = {
                                    "overallScore": 0,  # Will be calculated dynamically
                                    "analysisTimestamp": datetime.datetime.utcnow().isoformat() + "Z",
                                    "sectionSuggestions": parsed,
                                    "topRecommendations": ["Resume analysis completed with wrapped data"]
                                }
                                
                                logger.info("✅ Successfully wrapped incomplete JSON")
                                return json.dumps(wrapped_json)
                                
                            except json.JSONDecodeError:
                                logger.warning("⚠️ Even the extracted portion is invalid")
            
            return json_text
            
        except Exception as e:
            logger.warning(f"⚠️ Error detecting/fixing incomplete JSON: {str(e)}")
            return json_text
    
    def _validate_json_structure(self, json_text: str) -> bool:
        """
        Validate that the extracted JSON has the complete structure we need.
        """
        try:
            # Check if it contains the essential keys
            essential_keys = ['overallScore', 'sectionSuggestions']
            if not all(key in json_text for key in essential_keys):
                logger.warning(f"⚠️ JSON missing essential keys: {[key for key in essential_keys if key not in json_text]}")
                return False
            
            # Check if sectionSuggestions has the required structure
            if 'sectionSuggestions' in json_text:
                section_keys = ['professionalSummary', 'skills', 'workExperience', 'projects', 'education', 'certifications']
                missing_sections = [key for key in section_keys if key not in json_text]
                if missing_sections:
                    logger.warning(f"⚠️ sectionSuggestions missing sections: {missing_sections}")
                    return False
            
            logger.info("✅ JSON structure validation passed")
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ JSON structure validation failed: {str(e)}")
            return False

    def _extract_experience_from_summary(self, resume_data: Dict[str, Any]) -> Optional[int]:
        """
        Extract experience years from summary text using intelligent pattern matching.
        Looks for patterns like "5+ years", "over 5 years", "5 years of experience", etc.
        """
        try:
            summary = resume_data.get('summary', '')
            if not summary or not isinstance(summary, str):
                return None
            
            logger.info(f"🔍 Analyzing summary for experience: {summary[:100]}...")
            
            # Convert to lowercase for easier matching
            summary_lower = summary.lower()
            
            # Pattern 1: "X+ years" or "X+ years of experience"
            plus_pattern = r'(\d+)\+?\s*years?\s*(?:of\s*experience)?'
            plus_match = re.search(plus_pattern, summary_lower)
            if plus_match:
                years = int(plus_match.group(1))
                logger.info(f"✅ Found 'X+ years' pattern: {years}+ years")
                return years
            
            # Pattern 2: "over X years" or "more than X years"
            over_pattern = r'(?:over|more\s*than|above|beyond)\s*(\d+)\s*years?'
            over_match = re.search(over_pattern, summary_lower)
            if over_match:
                years = int(over_match.group(1))
                logger.info(f"✅ Found 'over X years' pattern: {years} years")
                return years
            
            # Pattern 3: "X years of experience" or "X years in"
            exact_pattern = r'(\d+)\s*years?\s*(?:of\s*experience|in\s*the\s*field|in\s*industry)'
            exact_match = re.search(exact_pattern, summary_lower)
            if exact_match:
                years = int(exact_match.group(1))
                logger.info(f"✅ Found 'X years of experience' pattern: {years} years")
                return years
            
            # Pattern 4: "X years" followed by professional context
            context_pattern = r'(\d+)\s*years?\s*(?:working|developing|managing|leading|designing|architecting)'
            context_match = re.search(context_pattern, summary_lower)
            if context_match:
                years = int(context_match.group(1))
                logger.info(f"✅ Found 'X years working' pattern: {years} years")
                return years
            
            # Pattern 5: "X years" in various professional contexts
            professional_pattern = r'(\d+)\s*years?\s*(?:professional|technical|industry|field|domain)'
            professional_match = re.search(professional_pattern, summary_lower)
            if professional_match:
                years = int(professional_match.group(1))
                logger.info(f"✅ Found 'X years professional' pattern: {years} years")
                return years
            
            # Pattern 6: "X years" with specific roles
            role_pattern = r'(\d+)\s*years?\s*(?:as\s*a|as\s*an|working\s*as)'
            role_match = re.search(role_pattern, summary_lower)
            if role_match:
                years = int(role_match.group(1))
                logger.info(f"✅ Found 'X years as a' pattern: {years} years")
                return years
            
            # Pattern 7: "X years" with company/industry context
            company_pattern = r'(\d+)\s*years?\s*(?:at|with|in|within)'
            company_match = re.search(company_pattern, summary_lower)
            if company_match:
                years = int(company_match.group(1))
                logger.info(f"✅ Found 'X years at/with' pattern: {years} years")
                return years
            
            # Pattern 8: "X years" in various contexts
            general_pattern = r'(\d+)\s*years?'
            general_match = re.search(general_pattern, summary_lower)
            if general_match:
                years = int(general_match.group(1))
                # Only use this if it's in a professional context (not just random numbers)
                context_before = summary_lower[max(0, general_match.start() - 50):general_match.start()]
                context_after = summary_lower[general_match.end():min(len(summary_lower), general_match.end() + 50)]
                
                professional_indicators = [
                    'experience', 'working', 'developing', 'managing', 'leading', 'designing',
                    'architecting', 'professional', 'technical', 'industry', 'field', 'domain',
                    'career', 'background', 'expertise', 'specialization', 'practice'
                ]
                
                if any(indicator in context_before or indicator in context_after for indicator in professional_indicators):
                    logger.info(f"✅ Found 'X years' in professional context: {years} years")
                    return years
            
            # Pattern 9: "X+ years" variations
            plus_variations = [
                r'(\d+)\+?\s*years?\s*experience',
                r'(\d+)\+?\s*years?\s*in\s*the\s*field',
                r'(\d+)\+?\s*years?\s*of\s*professional',
                r'(\d+)\+?\s*years?\s*background',
                r'(\d+)\+?\s*years?\s*career'
            ]
            
            for pattern in plus_variations:
                match = re.search(pattern, summary_lower)
                if match:
                    years = int(match.group(1))
                    logger.info(f"✅ Found plus variation pattern: {years}+ years")
                    return years
            
            # Pattern 10: "X years" with specific professional terms
            specific_patterns = [
                r'(\d+)\s*years?\s*software\s*development',
                r'(\d+)\s*years?\s*web\s*development',
                r'(\d+)\s*years?\s*data\s*analysis',
                r'(\d+)\s*years?\s*project\s*management',
                r'(\d+)\s*years?\s*team\s*leadership',
                r'(\d+)\s*years?\s*consulting',
                r'(\d+)\s*years?\s*research',
                r'(\d+)\s*years?\s*design'
            ]
            
            for pattern in specific_patterns:
                match = re.search(pattern, summary_lower)
                if match:
                    years = int(match.group(1))
                    logger.info(f"✅ Found specific professional pattern: {years} years")
                    return years
            
            # Pattern 11: "X years" with industry-specific terms
            industry_patterns = [
                r'(\d+)\s*years?\s*in\s*it',
                r'(\d+)\s*years?\s*in\s*technology',
                r'(\d+)\s*years?\s*in\s*finance',
                r'(\d+)\s*years?\s*in\s*healthcare',
                r'(\d+)\s*years?\s*in\s*marketing',
                r'(\d+)\s*years?\s*in\s*sales',
                r'(\d+)\s*years?\s*in\s*engineering',
                r'(\d+)\s*years?\s*in\s*consulting'
            ]
            
            for pattern in industry_patterns:
                match = re.search(pattern, summary_lower)
                if match:
                    years = int(match.group(1))
                    logger.info(f"✅ Found industry-specific pattern: {years} years")
                    return years
            
            # Pattern 12: "X years" with role-specific terms
            role_patterns = [
                r'(\d+)\s*years?\s*as\s*developer',
                r'(\d+)\s*years?\s*as\s*engineer',
                r'(\d+)\s*years?\s*as\s*manager',
                r'(\d+)\s*years?\s*as\s*analyst',
                r'(\d+)\s*years?\s*as\s*consultant',
                r'(\d+)\s*years?\s*as\s*designer',
                r'(\d+)\s*years?\s*as\s*architect'
            ]
            
            for pattern in role_patterns:
                match = re.search(pattern, summary_lower)
                if match:
                    years = int(match.group(1))
                    logger.info(f"✅ Found role-specific pattern: {years} years")
                    return years
            
            logger.info("❌ No explicit experience patterns found in summary")
            return None
            
        except Exception as e:
            logger.warning(f"❌ Error extracting experience from summary: {str(e)}")
            return None
    
    def _map_experience_to_level(self, years: int) -> str:
        """
        Map years of experience to experience level.
        More accurate mapping based on industry standards.
        """
        if years <= 1:
            return "Entry level"
        elif years <= 3:
            return "Entry level"
        elif years <= 4:
            return "Mid level"
        else:
            return "Senior level"
    
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
        if 'education' in resume_data and isinstance(resume_data['education'], list) and resume_data['education']:
            score += 10
            for edu in resume_data['education']:
                if edu.get('degree') and edu.get('institution'):
                    score += 5
                elif edu.get('degree') or edu.get('institution'):
                    score += 2
                elif edu.get('startDate') or edu.get('endDate'):
                    score += 1

        # Check for certifications
        if 'certifications' in resume_data and isinstance(resume_data['certifications'], list) and resume_data['certifications']:
            score += 5
            for cert in resume_data['certifications']:
                if cert.get('certificateName') or cert.get('institueName'):
                    score += 2
                elif cert.get('issueDate') or cert.get('expiryDate'):
                    score += 1

        # Check for projects
        if 'projects' in resume_data and isinstance(resume_data['projects'], list) and resume_data['projects']:
            score += 10
            for project in resume_data['projects']:
                if project.get('name') or project.get('description'):
                    score += 5
                elif project.get('techStack'):
                    score += 2
                elif project.get('startDate') or project.get('endDate'):
                    score += 1

        return score
    
    def _calculate_dynamic_score_with_jd(self, resume_data: Dict[str, Any], job_description: str) -> int:
        """
        Calculates a dynamic score based on how well the resume matches the job description requirements.
        This provides a more intelligent scoring when AI scoring fails.
        """
        try:
            # Start with base resume completeness score
            base_score = self._calculate_resume_score(resume_data)
            logger.info(f"📊 Base resume completeness score: {base_score}/100")
            
            # Calculate JD match score (0-50 points)
            jd_match_score = self._calculate_jd_match_score(resume_data, job_description)
            logger.info(f"📊 Job description match score: {jd_match_score}/50")
            
            # Combine scores: 60% base resume quality + 40% JD match
            final_score = int((base_score * 0.6) + (jd_match_score * 0.4))
            final_score = max(0, min(100, final_score))
            
            logger.info(f"📊 Final dynamic score: {final_score}/100")
            logger.info(f"   - Base resume score: {base_score} (60% weight)")
            logger.info(f"   - JD match score: {jd_match_score} (40% weight)")
            logger.info(f"   - Calculated final: {final_score}")
            
            return final_score
            
        except Exception as e:
            logger.warning(f"❌ Error calculating dynamic score with JD: {str(e)}")
            # Fallback to base score if JD analysis fails
            return self._calculate_resume_score(resume_data)
    
    def _calculate_jd_match_score(self, resume_data: Dict[str, Any], job_description: str) -> int:
        """
        Calculates how well the resume matches the job description requirements.
        Returns a score from 0-50.
        """
        try:
            score = 0
            max_score = 50
            
            # Convert job description to lowercase for easier matching
            jd_lower = job_description.lower()
            
            # Extract key requirements from job description
            required_skills = self._extract_required_skills_from_jd(jd_lower)
            required_experience = self._extract_required_experience_from_jd(jd_lower)
            required_education = self._extract_required_education_from_jd(jd_lower)
            
            logger.info(f"🔍 JD Analysis:")
            logger.info(f"   - Required skills: {required_skills}")
            logger.info(f"   - Required experience: {required_experience}")
            logger.info(f"   - Required education: {required_education}")
            
            # Skills match (20 points)
            skills_match = self._calculate_skills_match(resume_data, required_skills)
            score += min(skills_match, 20)
            
            # Experience match (15 points)
            experience_match = self._calculate_experience_match(resume_data, required_experience)
            score += min(experience_match, 15)
            
            # Education match (10 points)
            education_match = self._calculate_education_match(resume_data, required_education)
            score += min(education_match, 10)
            
            # Keyword match (5 points)
            keyword_match = self._calculate_keyword_match(resume_data, jd_lower)
            score += min(keyword_match, 5)
            
            final_score = max(0, min(max_score, score))
            logger.info(f"📊 JD Match Score Breakdown:")
            logger.info(f"   - Skills match: {min(skills_match, 20)}/20")
            logger.info(f"   - Experience match: {min(experience_match, 15)}/15")
            logger.info(f"   - Education match: {min(education_match, 10)}/10")
            logger.info(f"   - Keyword match: {min(keyword_match, 5)}/5")
            logger.info(f"   - Total JD match: {final_score}/50")
            
            return final_score
            
        except Exception as e:
            logger.warning(f"❌ Error calculating JD match score: {str(e)}")
            return 25  # Return middle score if analysis fails
    
    def _extract_required_skills_from_jd(self, jd_lower: str) -> list:
        """Extract required skills from job description"""
        skills = []
        
        # Common technical skills to look for
        technical_skills = [
            'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker',
            'kubernetes', 'machine learning', 'ai', 'data analysis', 'excel', 'tableau',
            'power bi', 'salesforce', 'marketing', 'seo', 'content creation', 'project management'
        ]
        
        for skill in technical_skills:
            if skill in jd_lower:
                skills.append(skill)
        
        return skills
    
    def _extract_required_experience_from_jd(self, jd_lower: str) -> str:
        """Extract required experience level from job description"""
        if any(term in jd_lower for term in ['senior', 'lead', 'principal', 'architect', 'manager']):
            return 'senior'
        elif any(term in jd_lower for term in ['mid', 'intermediate', '3+ years', '5+ years']):
            return 'mid'
        elif any(term in jd_lower for term in ['junior', 'entry', '0-2 years', '1-3 years']):
            return 'entry'
        else:
            return 'mid'  # Default to mid level
    
    def _extract_required_education_from_jd(self, jd_lower: str) -> list:
        """Extract required education from job description"""
        education = []
        
        if 'bachelor' in jd_lower or 'bs' in jd_lower or 'ba' in jd_lower:
            education.append('bachelor')
        if 'master' in jd_lower or 'ms' in jd_lower or 'ma' in jd_lower or 'mba' in jd_lower:
            education.append('master')
        if 'phd' in jd_lower or 'doctorate' in jd_lower:
            education.append('phd')
        
        return education
    
    def _calculate_skills_match(self, resume_data: Dict[str, Any], required_skills: list) -> int:
        """Calculate skills match score (0-20 points)"""
        if not required_skills:
            return 10  # Neutral score if no skills specified
        
        resume_skills = set()
        skills_data = resume_data.get('skills', {})
        
        if isinstance(skills_data, dict):
            for category, skill_list in skills_data.items():
                if isinstance(skill_list, list):
                    resume_skills.update([str(s).lower().strip() for s in skill_list if s])
                elif isinstance(skill_list, str):
                    resume_skills.add(skill_list.lower().strip())
        elif isinstance(skills_data, list):
            resume_skills.update([str(s).lower().strip() for s in skills_data if s])
        
        # Calculate match percentage
        if not resume_skills:
            return 0
        
        matched_skills = sum(1 for skill in required_skills if any(skill in resume_skill for resume_skill in resume_skills))
        match_percentage = matched_skills / len(required_skills)
        
        return int(match_percentage * 20)
    
    def _calculate_experience_match(self, resume_data: Dict[str, Any], required_experience: str) -> int:
        """Calculate experience match score (0-15 points)"""
        resume_experience = self._analyze_experience_level(resume_data)
        
        if required_experience == resume_experience:
            return 15  # Perfect match
        elif (required_experience == 'senior' and resume_experience == 'mid') or \
             (required_experience == 'mid' and resume_experience == 'entry'):
            return 10  # Close match
        elif (required_experience == 'senior' and resume_experience == 'entry'):
            return 5   # Poor match
        else:
            return 8   # Neutral score
    
    def _calculate_education_match(self, resume_data: Dict[str, Any], required_education: list) -> int:
        """Calculate education match score (0-10 points)"""
        if not required_education:
            return 5  # Neutral score if no education specified
        
        resume_education = []
        education_data = resume_data.get('education', [])
        
        if isinstance(education_data, list):
            for edu in education_data:
                if isinstance(edu, dict):
                    degree = edu.get('degree', '').lower()
                    if 'bachelor' in degree or 'bs' in degree or 'ba' in degree:
                        resume_education.append('bachelor')
                    elif 'master' in degree or 'ms' in degree or 'ma' in degree or 'mba' in degree:
                        resume_education.append('master')
                    elif 'phd' in degree or 'doctorate' in degree:
                        resume_education.append('phd')
        
        if not resume_education:
            return 0
        
        # Calculate match percentage
        matched_education = sum(1 for edu in required_education if edu in resume_education)
        match_percentage = matched_education / len(required_education)
        
        return int(match_percentage * 10)
    
    def _calculate_keyword_match(self, resume_data: Dict[str, Any], jd_lower: str) -> int:
        """Calculate keyword match score (0-5 points)"""
        # Extract key terms from resume
        resume_text = self._format_resume_for_comparison(resume_data).lower()
        
        # Look for important keywords in both resume and JD
        important_keywords = [
            'leadership', 'management', 'strategy', 'innovation', 'collaboration',
            'communication', 'problem solving', 'analytical', 'creative', 'detail-oriented',
            'results-driven', 'customer-focused', 'team player', 'self-motivated'
        ]
        
        matched_keywords = sum(1 for keyword in important_keywords if keyword in resume_text and keyword in jd_lower)
        
        return min(matched_keywords, 5)