"""
Optimized AI Suggestion Service with Pydantic validation
Removed all fallback functions and JSON-related helper functions
"""
import json
import logging
import datetime
import re
from typing import Dict, Any, Optional
from openai import OpenAI
from models.ai_suggestion_models import (
    AIComparisonResponse, 
    JobDescriptionResponse, 
    ResumeData,
    SectionSuggestions,
    ProfessionalSummarySuggestion,
    SkillsSuggestion,
    WorkExperienceSuggestion,
    ProjectSuggestion,
    EducationSuggestion,
    CertificationsSuggestion
)
from .openai_parser_service import OpenAIResumeParser

logger = logging.getLogger(__name__)


class AISuggestionServiceOptimized:
    """
    Optimized AI service for generating job descriptions and resume suggestions
    
    Features:
    - Pydantic validation for all responses
    - No fallback functions - relies on robust prompting
    - Error-free JSON handling
    - Clean, maintainable code
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini", temperature: float = 0.3, top_p: float = 0.8):
        """
        Initialize the optimized AI Suggestion Service
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model_name: OpenAI model name (if not provided, will use default)
            temperature: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
            top_p: Controls diversity via nucleus sampling (0.0 = focused, 1.0 = diverse)
        """
        self.parser = OpenAIResumeParser(api_key=api_key, model_name=model_name, temperature=temperature, top_p=top_p)
        self.model = self.parser.client
        self.model_name = model_name
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
    
    def _generate_with_retry(self, prompt: str, max_retries: int = 3, max_tokens: int = 4096) -> str:
        """
        Generate content with retry mechanism for blocked responses.
        
        Args:
            prompt: The prompt to send to the AI
            max_retries: Maximum number of retry attempts
            
        Returns:
            Generated response text
            
        Raises:
            ValueError: If all retry attempts fail
        """
        retry_configs = [
            {"temperature": 0.1, "top_p": 0.9},  # More conservative
            {"temperature": 0.7, "top_p": 0.8},  # More creative
            {"temperature": 0.3, "top_p": 0.95}, # Balanced
        ]
        
        for attempt in range(max_retries):
            try:
                # Use retry config if available, otherwise use current settings
                config = retry_configs[attempt] if attempt < len(retry_configs) else {
                    "temperature": self.temperature,
                    "top_p": self.top_p
                }
                
                generation_config = {
                    "temperature": config["temperature"],
                    "top_p": config["top_p"],
                    "top_k": 40,
                    "max_output_tokens": max_tokens,
                    "candidate_count": 1
                }
                
                logger.info(f"Attempt {attempt + 1}: Generating with temperature={config['temperature']}, top_p={config['top_p']}")
                response = self.model.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": "You are an expert global job market analyst and HR recruiter. Generate realistic, ATS-friendly job descriptions."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=config['temperature'],
                    top_p=config['top_p'],
                    max_tokens=max_tokens
                )
                
                # Check for blocked/filtered responses
                if hasattr(response, 'choices') and response.choices:
                    choice = response.choices[0]
                    if hasattr(choice, 'finish_reason'):
                        if choice.finish_reason == 'content_filter':
                            logger.warning(f"Attempt {attempt + 1}: Response blocked by safety filters, retrying...")
                            continue
                        elif choice.finish_reason == 'length':
                            logger.warning(f"Attempt {attempt + 1}: Response stopped due to length limit, retrying...")
                            continue
                        # 'stop' and 'function_call' are successful completion reasons, don't retry
                
                # Check for valid response
                if not response or not hasattr(response, 'choices') or not response.choices or not response.choices[0].message.content:
                    logger.warning(f"Attempt {attempt + 1}: Empty response, retrying...")
                    continue
                
                response_text = response.choices[0].message.content.strip()
                if not response_text:
                    logger.warning(f"Attempt {attempt + 1}: Empty response text, retrying...")
                    continue
                
                logger.info(f"Success on attempt {attempt + 1} with {len(response_text)} characters")
                return response_text
                
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    raise
                continue
        
        raise ValueError("All retry attempts failed. The AI service may be experiencing issues or the content may be consistently blocked.")

    def set_consistent_parameters(self):
        """
        Set parameters optimized for consistent AI suggestion results.
        Uses moderate temperature and focused top_p for balanced output.
        """
        self.update_generation_parameters(temperature=0.3, top_p=0.8)
        logger.info("🎯 Set consistent parameters for deterministic AI suggestions")

    def generate_job_description(self, sector: str, country: str, designation: str, resume_data: Optional[Dict[str, Any]] = None, experience_level: Optional[str] = None) -> JobDescriptionResponse:
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
            target_experience = self._analyze_experience_level(resume_data)
            logger.info(f"🎯 Analyzed experience level from resume: {target_experience}")
        else:
            target_experience = self._get_intelligent_default_experience(sector, designation)
            logger.info(f"🎯 Using intelligent default experience level: {target_experience}")
        
        # Extract level from target_experience for the prompt
        experience_level_short = target_experience.split()[0] if target_experience else "Mid"

        prompt = f"""
        You are an expert global job market analyst and HR recruiter.

        TASK: Create a **comprehensive, detailed, ATS-friendly job description (JD)** for the role of "{designation}" in the {sector} sector for {country}.
        The JD must reflect exactly the **{target_experience}** career stage of the candidate.

        CRITICAL REQUIREMENTS:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations, no text before or after)
        - Start your response with {{ and end with }}
        - Create a DETAILED job description following the comprehensive structure below
        - Ensure the JD is ATS-friendly with relevant keywords
        - Match the experience level: {target_experience}
        - Include sector-specific terminology and requirements
        - Consider country-specific job market standards for {country}
        - Include all required fields as specified in the structure

        REQUIRED DETAILED JSON FORMAT (return exactly this structure):
        {{
            "req_id": "string",
            "title": "{designation}",
            "level": "{experience_level_short}",
            "alt_titles": ["Alternative Title 1", "Alternative Title 2", "Alternative Title 3"],
            "department": "Department Name",
            "team_name": "Team Name",
            "reports_to": "Reporting Manager",
            "employment_type": "Full-time",
            "work_model": "Hybrid",
            "location": {{
                "city": "City Name",
                "state": "State/Province",
                "country": "{country}",
                "onsite_days_per_week": 3
            }},
            "visa_work_auth": {{
                "sponsor": true,
                "note": "Work authorization details"
            }},
            "mission": "2-3 lines describing what the team builds and why it matters",
            "impact_summary": "Brief description of the candidate's impact and responsibilities",
            "responsibilities": [
                "Responsibility 1 - outcome focused",
                "Responsibility 2 - outcome focused",
                "Responsibility 3 - outcome focused",
                "Responsibility 4 - outcome focused",
                "Responsibility 5 - outcome focused",
                "Responsibility 6 - outcome focused"
            ],
            "must_have_qualifications": [
                "Essential qualification 1",
                "Essential qualification 2",
                "Essential qualification 3",
                "Essential qualification 4",
                "Essential qualification 5"
            ],
            "nice_to_have_qualifications": [
                "Preferred qualification 1",
                "Preferred qualification 2",
                "Preferred qualification 3",
                "Preferred qualification 4"
            ],
            "tech_stack": {{
                "languages": ["Language 1", "Language 2", "Language 3"],
                "frameworks": ["Framework 1", "Framework 2"],
                "datastores": ["Database 1", "Database 2"],
                "cloud": ["Cloud Platform"],
                "messaging": ["Messaging System"],
                "devops": ["DevOps Tool 1", "DevOps Tool 2"],
                "observability": ["Monitoring Tool 1", "Monitoring Tool 2"]
            }},
            "kpis": [
                "KPI 1 with specific metrics",
                "KPI 2 with specific metrics",
                "KPI 3 with specific metrics"
            ],
            "screening_questions": [
                "Technical question 1",
                "Technical question 2",
                "Experience question 3"
            ],
            "education": "Education requirements",
            "certifications": ["Relevant certification 1", "Relevant certification 2"],
            "compensation": {{
                "base_range_usd": [80000, 120000],
                "bonus_target_pct": 10,
                "equity": "Equity details"
            }},
            "benefits": [
                "Benefit 1",
                "Benefit 2",
                "Benefit 3",
                "Benefit 4"
            ],
            "interview_process": [
                "Interview stage 1",
                "Interview stage 2",
                "Interview stage 3"
            ],
            "industry": "{sector}",
            "function": "Function Name",
            "keywords": [
                "Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5",
                "Keyword 6", "Keyword 7", "Keyword 8", "Keyword 9", "Keyword 10"
            ],
            "eeo_statement": "Equal opportunity employer statement",
            "posting": {{
                "date_posted": "{datetime.datetime.utcnow().strftime('%Y-%m-%d')}",
                "valid_through": "2025-12-31",
                "application_instructions": "Application instructions"
            }},
            "seo": {{
                "title": "SEO optimized title",
                "meta_description": "SEO meta description"
            }},
            "jobDescription": "Complete job description text combining mission, responsibilities, qualifications, and other details in a readable format",
            "sector": "{sector}",
            "country": "{country}",
            "designation": "{designation}",
            "experienceLevel": "{target_experience}",
            "generatedAt": "{datetime.datetime.utcnow().isoformat()}Z"
        }}

        DETAILED JD CREATION CHECKLIST:
        1. Define role basics: title, level, location, work model, employment type
        2. Clarify mission: 2-3 lines on what team builds and why it matters
        3. List 6-10 responsibilities: outcomes first, then activities
        4. Separate Must-Have vs Nice-to-Have skills; keep must-haves minimal and testable
        5. Specify tech stack clearly (languages, frameworks, cloud, DB, tooling)
        6. Add compliance & logistics: compensation range, benefits, EEO, work auth, interview process
        7. Include ATS/SEO metadata: keywords, alt job titles, function, industry, screening questions

        IMPORTANT: Your response must be valid JSON that can be parsed directly. Do not include any text outside the JSON object.
        """

        try:
            logger.info(f"Generating job description using temperature={self.temperature}, top_p={self.top_p}")
            
            # Use retry mechanism for better reliability
            response_text = self._generate_with_retry(prompt)
            logger.info(f"Received response length: {len(response_text)} characters")
            
            # Check for common non-JSON responses
            if response_text.lower().startswith(('sorry', 'i cannot', 'i am unable', 'i apologize')):
                logger.error(f"AI returned error message: {response_text[:100]}...")
                raise ValueError(f"AI service returned error: {response_text[:200]}")
            
            # Check if response appears to be truncated (common with long responses)
            if response_text.count('{') > response_text.count('}') or response_text.count('[') > response_text.count(']'):
                logger.warning("Response appears to be truncated - attempting to complete JSON")
            
            # Try to extract JSON from response if it's wrapped in markdown
            json_text = self._extract_json_from_response(response_text)
            
            # Validate that we have a reasonable JSON structure
            if not json_text.strip().startswith('{'):
                logger.error(f"Failed to extract valid JSON from response. Response starts with: {json_text[:100]}")
                raise ValueError("Could not extract valid JSON from AI response. The response may be malformed or truncated.")
            
            # Parse and validate response with Pydantic
            response_data = json.loads(json_text)
            return JobDescriptionResponse(**response_data)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response text (first 500 chars): {response_text[:500] if 'response_text' in locals() else 'N/A'}")
            raise ValueError(f"Invalid JSON response from AI. Please try again or check your input data.")
        except Exception as e:
            logger.error(f"Error generating job description: {e}")
            raise

    def compare_resume_with_jd(self, resume_data: Dict[str, Any], job_description: str, target_experience: Optional[str] = None) -> AIComparisonResponse:
        """
        Compare resume with job description and generate actionable improvement suggestions.
        Uses Pydantic validation to ensure error-free responses.
        """
        # Ensure consistent parameters for reliable output
        self.set_consistent_parameters()
        
        # Validate input resume data
        try:
            validated_resume = ResumeData(**resume_data)
        except Exception as e:
            logger.error(f"Invalid resume data: {e}")
            raise ValueError(f"Invalid resume data format: {e}")
        
        logger.info(f"Starting resume comparison with data keys: {list(resume_data.keys())}")
        
        resume_text = self._format_resume_for_comparison(resume_data)
        if not target_experience:
            target_experience = self._analyze_experience_level(resume_data)
            logger.info(f"🎯 Analyzed experience level from resume: {target_experience}")

        prompt = f"""
        You are an expert resume consultant and recruiter.  
        Compare the following resume with the job description and provide actionable, ready-to-use rewritten improvements.

        CRITICAL RULES - NEVER VIOLATE:
        - Return ONLY valid JSON (no markdown, no code fences, no explanations, no text before or after)
        - Start your response with {{ and end with }}
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
        - **CRITICAL FORMATTING**: For ALL description fields (experience, projects, education, activities, etc.), format each sentence to end with \\n (newline character). This ensures proper bullet point formatting in the frontend.

        CRITICAL FIELD NAMING CONVENTIONS - MUST FOLLOW EXACTLY:
        - For projects: Use "techStack" (not "technologies" or "tech_stack") - must be a comma-separated string
        - For certifications: Use "certificateName" (not "name" or "certificate_name") and "instituteName" (not "issuer" or "institute_name")
        - For work experience: Use "startDate" and "endDate" (not "start_date" or "end_date")
        - For projects: Use "startDate" and "endDate" (not "start_date" or "end_date")
        - For certifications: Use "issueDate" (not "startDate", "endDate", "start_date", or "end_date")
        - These field names must match exactly what the frontend expects for proper data display

        OVERALL SCORE CALCULATION RULES (MANDATORY DYNAMIC SCORING):
        - Calculate overallScore using this EXACT formula with specific weights and criteria:
        - **CRITICAL**: Role/Position matching is the PRIMARY factor and heavily weighted
        
        SCORING FORMULA (Total: 100 points):
        1. **ROLE/POSITION MATCH (40 points)**: Most critical factor - how well resume role matches JD title
           - Perfect role match: 40 points (exact title match or very close)
           - Strong role match: 30-35 points (similar role with same responsibilities)
           - Moderate role match: 20-25 points (related role but different focus)
           - Weak role match: 10-15 points (different role but transferable skills)
           - No role match: 0-5 points (completely different role/industry)
           - Maximum: 40 points
        
        2. Skills Match (20 points): Count matching skills between resume and JD
           - Exact matches: 3 points each
           - Similar/related skills: 2 points each  
           - Missing critical skills: -2 points each
           - Maximum: 20 points
        
        3. Experience Relevance (15 points): How well work experience aligns with JD requirements
           - Role relevance: 0-6 points (0=none, 6=perfect match)
           - Industry relevance: 0-5 points (0=none, 5=same industry)
           - Achievement quality: 0-4 points (0=none, 4=quantified results)
           - Maximum: 15 points
        
        4. Keyword Density (10 points): Important JD keywords present in resume
           - Critical keywords: 2 points each (max 6 points)
           - Important keywords: 1 point each (max 3 points)
           - Nice-to-have keywords: 0.5 points each (max 1 point)
           - Maximum: 10 points
        
        5. Professional Summary Quality (8 points): How well summary matches JD
           - Keyword alignment: 0-3 points
           - Experience level match: 0-3 points
           - Value proposition clarity: 0-2 points
           - Maximum: 8 points
        
        6. Education/Certifications (4 points): Educational background relevance
           - Degree relevance: 0-2 points
           - Certification relevance: 0-2 points
           - Maximum: 4 points
        
        7. Project Relevance (3 points): How well projects demonstrate required skills
           - Technology stack match: 0-1 point
           - Project complexity: 0-1 point
           - Results/impact shown: 0-1 point
           - Maximum: 3 points
        
        FINAL SCORE CALCULATION:
        - Add all 7 category scores (should total 0-100)
        - **ROLE MATCH MULTIPLIER**: Apply strict multiplier based on role matching:
          * Perfect/Strong role match: multiply by 1.0 (no penalty)
          * Moderate role match: multiply by 0.8 (20% penalty)
          * Weak role match: multiply by 0.6 (40% penalty)
          * No role match: multiply by 0.4 (60% penalty)
        - Round to the nearest integer (e.g., 73, 84, 92)
        - NEVER use round numbers ending in 0 or 5 unless truly calculated
        - Score range: 0 to 100
        - **TARGET SCORES**: Perfect role match should score 80%+, weak/no match should score <50%
        
        SCORING EXAMPLES:
        **PERFECT ROLE MATCH EXAMPLE:**
        - Role Match: Perfect match (40/40) - Software Engineer resume for Software Engineer JD
        - Skills: 6 exact matches (18) + 2 similar (4) - 1 missing (2) = 20/20
        - Experience: Role (6) + Industry (5) + Achievements (4) = 15/15
        - Keywords: 3 critical (6) + 4 important (4) = 10/10
        - Summary: Keywords (3) + Level (3) + Value (2) = 8/8
        - Education: Degree (2) + Certs (2) = 4/4
        - Projects: Tech (1) + Complexity (1) + Results (1) = 3/3
        - Total: 40+20+15+10+8+4+3 = 100 * 1.0 = 100 (Perfect match)
        
        **MODERATE ROLE MATCH EXAMPLE:**
        - Role Match: Moderate match (25/40) - Frontend Developer resume for Full-Stack Engineer JD
        - Skills: 4 exact matches (12) + 3 similar (6) - 2 missing (4) = 14/20
        - Experience: Role (4) + Industry (4) + Achievements (3) = 11/15
        - Keywords: 2 critical (4) + 3 important (3) = 7/10
        - Summary: Keywords (2) + Level (2) + Value (1) = 5/8
        - Education: Degree (1) + Certs (1) = 2/4
        - Projects: Tech (1) + Complexity (1) + Results (0) = 2/3
        - Total: 25+14+11+7+5+2+2 = 66 * 0.8 = 53 (Moderate match with penalty)
        
        **WEAK ROLE MATCH EXAMPLE:**
        - Role Match: Weak match (12/40) - Marketing Manager resume for Software Engineer JD
        - Skills: 1 exact match (3) + 2 similar (4) - 5 missing (10) = -3/20 (capped at 0)
        - Experience: Role (1) + Industry (1) + Achievements (1) = 3/15
        - Keywords: 0 critical (0) + 1 important (1) = 1/10
        - Summary: Keywords (1) + Level (1) + Value (0) = 2/8
        - Education: Degree (0) + Certs (0) = 0/4
        - Projects: Tech (0) + Complexity (0) + Results (0) = 0/3
        - Total: 12+0+3+1+2+0+0 = 18 * 0.6 = 11 (Weak match with penalty)
        
        CRITICAL: Always calculate using the exact formula above. Never return generic scores like 75, 80, 85, 90, 95, 100.

        **ROLE MATCHING ANALYSIS REQUIREMENTS:**
        - Analyze the resume's primary role/position against the JD title from the job description
        - Look for exact matches: "Software Engineer" vs "Software Engineer" = Perfect match (40 points)
        - Look for strong matches: "Frontend Developer" vs "Full-Stack Engineer" = Strong match (30-35 points)
        - Look for moderate matches: "Data Analyst" vs "Software Engineer" = Moderate match (20-25 points)
        - Look for weak matches: "Marketing Manager" vs "Software Engineer" = Weak match (10-15 points)
        - Look for no matches: "Teacher" vs "Software Engineer" = No match (0-5 points)
        - Consider role responsibilities, not just titles
        - Consider industry relevance and transferable skills
        - Apply the appropriate multiplier based on match quality

        **ROLE MISMATCH DETECTION (CRITICAL):**
        - BEFORE calculating the score, analyze if the resume is significantly better suited for a DIFFERENT role than the applied designation
        - Check ALL these areas for role indicators:
          * Work Experience: Job titles, responsibilities, achievements
          * Skills: Technical skills, tools, technologies used
          * Projects: Project types, technologies, complexity
          * Education: Degree field, coursework, specialization
          * Certifications: Industry-specific certifications
          * Professional Summary: Career focus, expertise areas
        - If the resume shows STRONG evidence of being suited for a different role (e.g., Full-Stack Developer resume applied for Product Manager), include a "roleMismatchWarning" field
        - Only show mismatch warning if there's CLEAR evidence the resume is better suited for another specific role
        - Do NOT show mismatch warning if the resume could reasonably fit both roles
        - Format: "This resume appears to be better suited for [DETECTED_ROLE] based on your work experience, skills, and projects. Consider applying for [DETECTED_ROLE] positions instead."

        **ROLE MISMATCH EXAMPLES:**
        - Full-Stack Developer resume → Product Manager application: MISMATCH (technical skills vs business focus)
        - Software Engineer resume → Marketing Manager application: MISMATCH (technical background vs marketing)
        - Data Scientist resume → Sales Representative application: MISMATCH (analytical vs sales skills)
        - Project Manager resume → Software Engineer application: MISMATCH (management vs technical)
        - Business Analyst resume → Product Manager application: NO MISMATCH (both business-focused)
        - Software Engineer resume → Technical Product Manager application: NO MISMATCH (both tech-related)

        **DETECTION CRITERIA:**
        - Look for 3+ strong indicators pointing to a different role
        - Consider the PRIMARY focus of the resume (what the person does most)
        - Check if the resume shows expertise in a completely different domain
        - Verify that the suggested role makes sense based on the evidence
        - Be conservative - only warn when there's a clear mismatch

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
        - In the "rewrite" field: Return skills as a DIRECT object with category names as keys, NOT wrapped in "General".
        - CRITICAL: In rewrite, ONLY include the NEW skills being added, NOT the existing skills.
        - Format: If existing has "Languages: JavaScript" and you need to add "Java", rewrite should be {{"Languages": "Java"}} NOT {{"Languages": "JavaScript, Java"}}.
        - NEVER include existing skills in the rewrite - only show the new skills being added.
        - NEVER use "General" wrapper - return skills directly as category: skills pairs.
        - Example: If resume has "Languages: Java, Python" and job needs "JavaScript", suggest {{"Languages": "JavaScript"}}.
        - If a category has no new skills to add, do NOT include that category in the rewrite at all.
        - Do NOT suggest "New Category: skills" - only use existing categories.
        - NEVER suggest "General" as a skill category - avoid generic categories.

        CRITICAL PROJECTS RULES:
        - If NO projects exist in the resume, create exactly 2 dummy projects that match the job description requirements.
        - Each dummy project must have: name, existing (empty), rewrite (detailed project description), startDate, endDate, techStack, and recommendations.
        - Dummy projects should be relevant to the job role and demonstrate skills mentioned in the job description.
        - If projects DO exist, ONLY enhance the descriptions of existing projects in the "rewrite" field to better match the job description.
        - DO NOT create new projects when projects already exist - only enhance existing ones.
        - For existing projects, keep the same project names and only improve the descriptions.
        - ALWAYS include startDate, endDate, and techStack in project responses - if missing from existing resume, add realistic dummy dates and technologies.
        - techStack should be a comma-separated string of technologies (e.g., "React, Node.js, MongoDB, AWS").
        - Project descriptions should include: technologies used, achievements, impact, and relevance to the target role.
        - Use strong action verbs and quantified results where possible.
        - Ensure project names and descriptions align with the {target_experience} level and job requirements.
        - **DESCRIPTION FORMATTING**: Each feature/achievement should be a separate sentence ending with \\n

        CRITICAL WORK EXPERIENCE RULES:
        - ALWAYS include startDate and endDate in work experience responses - if missing from existing resume, add realistic dummy dates.
        - For work experience, enhance descriptions while preserving role and company information.
        - Include quantified achievements, technologies used, and impact in rewritten descriptions.
        - Use strong action verbs and professional language in all rewrites.
        - **DESCRIPTION FORMATTING**: Each responsibility/achievement should be a separate sentence ending with \\n

        CRITICAL CERTIFICATIONS RULES:
        - ALWAYS include issueDate, certificateName, and instituteName in certification responses - if missing from existing resume, add realistic issue dates and organization names.
        - For certifications, enhance descriptions while preserving certification names and issuing organizations.
        - certificateName should be the full name of the certification (e.g., "AWS Certified Solutions Architect").
        - instituteName should be the issuing organization (e.g., "Amazon Web Services").
        - issueDate should be the date when the certification was issued (e.g., "Jan 2023").
        - Include relevant details about certification value and relevance to the target role.
        - Use professional language and highlight ongoing learning commitment.

        CRITICAL EDUCATION RULES:
        - For education section, ALWAYS return rewrite as a SINGLE STRING, NOT as an array/list.
        - Format: "rewrite": "Enhanced education description as a single string"
        - NEVER return education rewrite as an array like ["string1", "string2"].
        - Combine multiple education entries into one comprehensive string if needed.
        - Include relevant coursework, achievements, and academic highlights in the single string.
        - **DESCRIPTION FORMATTING**: Each detail should be a separate sentence ending with \\n

        RESUME DATA:
        {resume_text}

        JOB DESCRIPTION:
        {job_description}

        REQUIRED OUTPUT SCHEMA (MUST INCLUDE ALL SECTIONS):
        {{
            "overallScore": <calculate_using_exact_formula_above_0_to_100>,
            "analysisTimestamp": "{datetime.datetime.utcnow().isoformat()}Z",
            "roleMismatchWarning": null,
            "sectionSuggestions": {{
                "professionalSummary": {{
                    "existing": "",
                    "rewrite": "",
                    "recommendations": ["Craft a compelling 2-3 sentence summary highlighting key achievements", "Include relevant keywords from the job description", "Quantify your impact with specific numbers and results", "Tailor the summary to the target role and company"]
                }},
                "skills": {{
                    "existing": {{"Languages": ["JavaScript", "Python"], "Database": ["SQL", "MongoDB"]}},
                    "rewrite": {{"Languages": "Java", "Database": "PostgreSQL"}},
                    "recommendations": ["Add technical skills relevant to the job description", "Include both hard and soft skills", "Organize skills by category for better readability", "Highlight skills that match the job requirements"]
                }},
                "workExperience": [
                    {{
                        "role": "",
                        "existing": "",
                        "rewrite": "",
                        "startDate": "",
                        "endDate": "",
                        "recommendations": ["Quantify achievements with specific numbers and percentages", "Use strong action verbs to start each bullet point", "Highlight leadership and team collaboration examples", "Include relevant technologies and tools used"]
                    }}
                ],
                "projects": [
                    {{
                        "name": "",
                        "existing": "",
                        "rewrite": "",
                        "startDate": "",
                        "endDate": "",
                        "techStack": "",
                        "recommendations": ["Enhance project description with specific technologies used", "Add quantified results and achievements", "Include project duration and team size", "Highlight relevant skills gained"]
                    }}
                ],
                "education": {{
                    "existing": ["Bachelor of Science in Computer Science, University of Technology, 2020"],
                    "rewrite": "Bachelor of Science in Computer Science with specialization in Software Engineering from University of Technology (2020). Relevant coursework included Data Structures, Algorithms, Database Systems, and Software Development. Achieved Dean's List recognition for academic excellence.",
                    "recommendations": ["Include relevant coursework and academic projects", "Add GPA if it's 3.5 or higher", "Highlight academic achievements and honors", "Include relevant extracurricular activities and leadership roles"]
                }},
                "certifications": [
                    {{
                        "certificateName": "",
                        "existing": "",
                        "rewrite": "",
                        "issueDate": "",
                        "instituteName": "",
                        "recommendations": ["Add relevant professional certifications for the target role", "Include industry-specific certifications and licenses", "Add issue dates and credential IDs", "Highlight ongoing learning and skill development"]
                    }}
                ]
            }},
            "topRecommendations": [
                "Review and enhance your professional summary with relevant keywords",
                "Add technical skills that match the job description requirements",
                "Quantify achievements in work experience with specific numbers and results"
            ]
        }}
        
        SCORING IMPLEMENTATION REQUIREMENTS:
        - You MUST calculate the overallScore using the exact 7-category formula provided above
        - Count actual matches, keywords, and elements from the resume and job description
        - Apply the specific point values for each category as defined
        - Sum all 7 categories and round to the nearest integer
        - The final score should reflect the actual analysis, not a generic estimate
        - Examples of good scores: 67, 73, 81, 89, 92
        - Examples of bad scores: 70, 75, 80, 85, 90, 95, 100 (unless truly calculated)
        
        REMEMBER: 
        - NEVER omit sections - return empty values instead of missing sections!
        - overallScore MUST be an integer between 0-100, never "NA" or text!
        - Use the exact scoring formula - do not estimate or round to multiples of 5!
        
        IMPORTANT: Your response must be valid JSON that can be parsed directly. Do not include any text outside the JSON object.
        """

        try:
            logger.info(f"Comparing resume with JD using temperature={self.temperature}, top_p={self.top_p}")
            
            # Use retry mechanism for better reliability (with higher token limit for comparison)
            response_text = self._generate_with_retry(prompt, max_tokens=8192)
            logger.info(f"Received response length: {len(response_text)} characters")
            
            # Check for common non-JSON responses
            if response_text.lower().startswith(('sorry', 'i cannot', 'i am unable', 'i apologize')):
                logger.error(f"AI returned error message: {response_text[:100]}...")
                raise ValueError(f"AI service returned error: {response_text[:200]}")
            
            # Check if response appears to be truncated (common with long responses)
            if response_text.count('{') > response_text.count('}') or response_text.count('[') > response_text.count(']'):
                logger.warning("Response appears to be truncated - attempting to complete JSON")
            
            # Try to extract JSON from response if it's wrapped in markdown
            json_text = self._extract_json_from_response(response_text)
            
            # Validate that we have a reasonable JSON structure
            if not json_text.strip().startswith('{'):
                logger.error(f"Failed to extract valid JSON from response. Response starts with: {json_text[:100]}")
                raise ValueError("Could not extract valid JSON from AI response. The response may be malformed or truncated.")
            
            # Parse and validate response with Pydantic
            response_data = json.loads(json_text)
            return AIComparisonResponse(**response_data)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response text (first 500 chars): {response_text[:500] if 'response_text' in locals() else 'N/A'}")
            raise ValueError(f"Invalid JSON response from AI. Please try again or check your input data.")
        except Exception as e:
            logger.error(f"Error comparing resume with JD: {e}")
            raise

    def _format_resume_for_comparison(self, resume_data: Dict[str, Any]) -> str:
        """Format resume data into a readable text format for comparison"""
        logger.info(f"🔍 Starting resume formatting with data keys: {list(resume_data.keys())}")
        
        formatted_sections = []
        
        # Professional Summary
        summary = resume_data.get('professionalSummary', resume_data.get('summary', ''))
        if summary:
            formatted_sections.append(f"PROFESSIONAL SUMMARY:\n{summary}\n")
        
        # Skills
        skills = resume_data.get('skills', [])
        if skills:
            if isinstance(skills, list):
                skills_text = ', '.join(skills)
            else:
                skills_text = str(skills)
            formatted_sections.append(f"SKILLS:\n{skills_text}\n")
        
        # Work Experience
        work_experience = resume_data.get('workExperience', [])
        if work_experience:
            formatted_sections.append("WORK EXPERIENCE:")
            for exp in work_experience:
                if isinstance(exp, dict):
                    role = exp.get('role', exp.get('title', exp.get('position', 'Unknown Role')))
                    company = exp.get('company', exp.get('organization', 'Unknown Company'))
                    duration = exp.get('duration', exp.get('period', exp.get('dates', 'Unknown Duration')))
                    description = exp.get('description', exp.get('summary', exp.get('responsibilities', '')))
                    
                    formatted_sections.append(f"- {role} at {company} ({duration})")
                    if description:
                        formatted_sections.append(f"  {description}")
            formatted_sections.append("")
        
        # Projects
        projects = resume_data.get('projects', [])
        if projects:
            formatted_sections.append("PROJECTS:")
            for project in projects:
                if isinstance(project, dict):
                    name = project.get('name', project.get('title', 'Unknown Project'))
                    description = project.get('description', project.get('summary', ''))
                    technologies = project.get('technologies', project.get('tech_stack', project.get('tools', [])))
                    
                    formatted_sections.append(f"- {name}")
                    if description:
                        formatted_sections.append(f"  {description}")
                    if technologies:
                        if isinstance(technologies, list):
                            tech_text = ', '.join(technologies)
                        else:
                            tech_text = str(technologies)
                        formatted_sections.append(f"  Technologies: {tech_text}")
            formatted_sections.append("")
        
        # Education
        education = resume_data.get('education', [])
        if education:
            formatted_sections.append("EDUCATION:")
            for edu in education:
                if isinstance(edu, dict):
                    degree = edu.get('degree', edu.get('qualification', 'Unknown Degree'))
                    institution = edu.get('institution', edu.get('university', edu.get('school', 'Unknown Institution')))
                    year = edu.get('year', edu.get('graduation_year', edu.get('completion_year', '')))
                    
                    formatted_sections.append(f"- {degree} from {institution}")
                    if year:
                        formatted_sections.append(f"  Year: {year}")
            formatted_sections.append("")
        
        # Certifications
        certifications = resume_data.get('certifications', [])
        if certifications:
            formatted_sections.append("CERTIFICATIONS:")
            for cert in certifications:
                if isinstance(cert, dict):
                    name = cert.get('name', cert.get('title', 'Unknown Certification'))
                    issuer = cert.get('issuer', cert.get('organization', cert.get('provider', '')))
                    year = cert.get('year', cert.get('completion_year', cert.get('date', '')))
                    
                    formatted_sections.append(f"- {name}")
                    if issuer:
                        formatted_sections.append(f"  Issuer: {issuer}")
                    if year:
                        formatted_sections.append(f"  Year: {year}")
            formatted_sections.append("")
        
        formatted_text = '\n'.join(formatted_sections)
        logger.info(f"🔍 Formatted resume text length: {len(formatted_text)} characters")
        return formatted_text

    def _analyze_experience_level(self, resume_data: Dict[str, Any]) -> str:
        """Analyze resume level from resume data"""
        try:
            # Check work experience length
            work_experience = resume_data.get('workExperience', [])
            if work_experience and isinstance(work_experience, list):
                total_years = 0
                for exp in work_experience:
                    if isinstance(exp, dict):
                        duration = exp.get('duration', exp.get('period', exp.get('dates', '')))
                        if duration:
                            # Extract years from duration string
                            years_match = re.search(r'(\d+)\s*(?:year|yr|y)', duration.lower())
                            if years_match:
                                total_years += int(years_match.group(1))
                
                if total_years >= 8:
                    return "Senior level"
                elif total_years >= 4:
                    return "Mid level"
                elif total_years >= 1:
                    return "Entry level"
                else:
                    return "Entry level"
            
            # Check professional summary for experience indicators
            summary = resume_data.get('professionalSummary', resume_data.get('summary', ''))
            if summary:
                summary_lower = summary.lower()
                if any(word in summary_lower for word in ['senior', 'lead', 'principal', 'architect', 'manager', 'director']):
                    return "Senior level"
                elif any(word in summary_lower for word in ['mid-level', 'experienced', 'professional', 'specialist']):
                    return "Mid level"
                elif any(word in summary_lower for word in ['junior', 'entry', 'graduate', 'fresh', 'recent']):
                    return "Entry level"
            
            # Check if it's an internship/student resume
            if self._is_internship_student_resume(work_experience, resume_data):
                return "Entry level"
            
            # Default to entry level if no clear indicators
            return "Entry level"
            
        except Exception as e:
            logger.error(f"Error analyzing experience level: {e}")
            return "Entry level"

    def _is_internship_student_resume(self, experience: list, resume_data: Dict[str, Any]) -> bool:
        """Check if this is an internship or student resume"""
        try:
            # Check for internship keywords in experience
            for exp in experience:
                if isinstance(exp, dict):
                    role = exp.get('role', exp.get('title', exp.get('position', ''))).lower()
                    if any(keyword in role for keyword in ['intern', 'internship', 'trainee', 'student', 'co-op']):
                        return True
            
            # Check education for student indicators
            education = resume_data.get('education', [])
            for edu in education:
                if isinstance(edu, dict):
                    degree = edu.get('degree', edu.get('qualification', '')).lower()
                    if any(keyword in degree for keyword in ['student', 'undergraduate', 'graduate', 'phd', 'masters', 'bachelor']):
                        return True
            
            return False
        except Exception as e:
            logger.error(f"Error checking internship/student status: {e}")
            return False

    def _extract_json_from_response(self, response_text: str) -> str:
        """
        Extract JSON from AI response, handling markdown code blocks and other formatting.
        Enhanced to be more robust with malformed JSON.
        """
        import re
        
        # Remove any leading/trailing whitespace
        text = response_text.strip()
        
        # If the response is already valid JSON, try to parse it first
        if text.startswith('{') and text.endswith('}'):
            try:
                json.loads(text)
                return text
            except json.JSONDecodeError:
                # Even if it looks like complete JSON, it might be malformed
                pass
        
        # Try to extract JSON from markdown code blocks (handle incomplete JSON)
        json_patterns = [
            r'```json\s*(\{.*?)(?:\n```|$)',  # ```json { ... } (may be incomplete)
            r'```\s*(\{.*?)(?:\n```|$)',     # ``` { ... } (may be incomplete)
            r'`(\{.*?)`',                     # `{ ... }`
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            if matches:
                json_candidate = matches[0].strip()
                # Try to complete the JSON if it's incomplete
                if not json_candidate.endswith('}'):
                    json_candidate = self._attempt_json_completion(json_candidate)
                else:
                    # Even if it ends with }, it might be malformed
                    json_candidate = self._attempt_json_completion(json_candidate)
                return json_candidate
        
        # Try to find JSON object boundaries (handle incomplete JSON)
        start_idx = text.find('{')
        if start_idx != -1:
            # Find the matching closing brace
            brace_count = 0
            json_end = start_idx
            for i, char in enumerate(text[start_idx:], start_idx):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end = i + 1
                        break
            
            extracted_json = text[start_idx:json_end]
            
            # Always try to complete the JSON, even if it looks complete
            extracted_json = self._attempt_json_completion(extracted_json)
            
            return extracted_json
        
        # If no JSON found, return the original text (will cause JSON error with better message)
        return text

    def _attempt_json_completion(self, incomplete_json: str) -> str:
        """
        Attempt to complete incomplete JSON by adding missing closing braces and brackets.
        Enhanced to handle more edge cases and malformed JSON.
        """
        try:
            # Clean up common JSON issues first
            cleaned_json = incomplete_json.strip()
            
            # Handle trailing commas (common issue)
            cleaned_json = re.sub(r',(\s*[}\]])', r'\1', cleaned_json)
            
            # Handle incomplete strings (add closing quote if missing)
            if cleaned_json.count('"') % 2 != 0:
                # Find the last unclosed quote and add closing quote
                last_quote_pos = cleaned_json.rfind('"')
                if last_quote_pos != -1:
                    # Check if it's inside a string (not escaped)
                    before_quote = cleaned_json[:last_quote_pos]
                    if before_quote.count('\\"') % 2 == 0:  # Not escaped
                        cleaned_json = cleaned_json + '"'
            
            # Count opening and closing braces/brackets
            open_braces = cleaned_json.count('{')
            close_braces = cleaned_json.count('}')
            open_brackets = cleaned_json.count('[')
            close_brackets = cleaned_json.count(']')
            
            # Add missing closing braces/brackets
            missing_braces = max(0, open_braces - close_braces)
            missing_brackets = max(0, open_brackets - close_brackets)
            
            completed_json = cleaned_json
            
            # Add missing closing brackets first
            for _ in range(missing_brackets):
                completed_json += ']'
            
            # Add missing closing braces
            for _ in range(missing_braces):
                completed_json += '}'
            
            # Try to parse the completed JSON
            json.loads(completed_json)
            return completed_json
            
        except json.JSONDecodeError as e:
            # If completion failed, try multiple approaches to fix common issues
            try:
                # Approach 1: Handle incomplete key-value pairs
                if ':' in completed_json and not completed_json.strip().endswith(('}', ']')):
                    if completed_json.strip().endswith(':'):
                        completed_json += ' null'
                    elif completed_json.strip().endswith(','):
                        completed_json = completed_json.rstrip(',') + '}'
                
                # Approach 2: Fix missing commas between array/object elements
                # Look for patterns like "value1" "value2" or } { and add commas
                completed_json = re.sub(r'("\s*)(?=")', r'\1,', completed_json)  # Add comma between strings
                completed_json = re.sub(r'(\}\s*)(?=\{)', r'\1,', completed_json)  # Add comma between objects
                completed_json = re.sub(r'(\]\s*)(?=\[)', r'\1,', completed_json)  # Add comma between arrays
                completed_json = re.sub(r'(\}\s*)(?=\[)', r'\1,', completed_json)  # Add comma between object and array
                completed_json = re.sub(r'(\]\s*)(?=\{)', r'\1,', completed_json)  # Add comma between array and object
                
                # Approach 3: Fix missing commas after values before closing braces/brackets
                completed_json = re.sub(r'([^,}\]])(\s*)([}\]])', r'\1\2\3', completed_json)
                
                # Approach 4: Handle malformed nested structures
                # Fix cases where nested objects/arrays are not properly closed
                lines = completed_json.split('\n')
                fixed_lines = []
                for i, line in enumerate(lines):
                    stripped = line.strip()
                    # If line ends with { or [ but next line doesn't have proper indentation
                    if stripped.endswith(('{', '[')) and i < len(lines) - 1:
                        next_line = lines[i + 1].strip()
                        if next_line and not next_line.startswith(('"', '{', '[', '}', ']')):
                            # Add comma if needed
                            if not stripped.endswith(','):
                                line = line.rstrip() + ','
                    fixed_lines.append(line)
                completed_json = '\n'.join(fixed_lines)
                
                # Try parsing again
                json.loads(completed_json)
                return completed_json
                
            except json.JSONDecodeError as e2:
                # Final attempt: More aggressive fixes
                try:
                    # Remove any remaining trailing commas before closing braces/brackets
                    completed_json = re.sub(r',(\s*[}\]])', r'\1', completed_json)
                    
                    # Fix any remaining quote issues
                    if completed_json.count('"') % 2 != 0:
                        completed_json += '"'
                    
                    # Try parsing one more time
                    json.loads(completed_json)
                    return completed_json
                    
                except json.JSONDecodeError:
                    # If all attempts fail, return the original incomplete JSON
                    logger.warning(f"Could not complete malformed JSON after multiple attempts. Original error: {str(e)[:100]}...")
                    return incomplete_json

    def _get_intelligent_default_experience(self, sector: str, designation: str) -> str:
        """
        Determine intelligent default experience level based on sector and designation context.
        This provides better defaults than always using "Mid level".
        """
        designation_lower = designation.lower()
        sector_lower = sector.lower()
        
        # Senior level indicators
        senior_keywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director', 'head', 'chief', 'vp', 'vice president']
        if any(keyword in designation_lower for keyword in senior_keywords):
            return "Senior level"
        
        # Entry level indicators
        entry_keywords = ['junior', 'entry', 'associate', 'trainee', 'intern', 'graduate', 'fresh', 'new']
        if any(keyword in designation_lower for keyword in entry_keywords):
            return "Entry level"
        
        # Sector-specific defaults
        if sector_lower in ['technology', 'software', 'it', 'engineering']:
            return "Mid level"  # Tech roles often require some experience
        elif sector_lower in ['healthcare', 'finance', 'legal']:
            return "Mid level"  # Professional sectors often require experience
        elif sector_lower in ['retail', 'hospitality', 'customer service']:
            return "Entry level"  # Service sectors often have entry-level positions
        
        # Default to mid level for most cases
        return "Mid level"
